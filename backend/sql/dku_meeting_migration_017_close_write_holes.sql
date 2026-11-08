-- ============================================================
-- 마이그레이션 017 — 클라이언트가 직접 쓸 수 있던 네 군데를 닫는다
--
-- 011 은 "필터를 지나지 않은 메시지는 존재할 수 없다"를 목표로 messages 의
-- 직접 insert 를 막았다. 그런데 같은 결과를 내는 옆길이 남아 있었다.
--
-- [1] messages_update — 보낸 사람이 자기 메시지를 아무렇게나 고칠 수 있었다
--     using (sender_id = auth.uid() or is_admin()), with check 없음.
--     with check 가 없으면 using 이 그대로 쓰이므로 sender_id 만 유지하면
--     나머지 컬럼은 무엇이든 통과했다.
--       · content 를 바꾸고 is_filtered=false → 금지어 필터 우회
--       · room_id 를 남의 방으로 → 참여하지도 않은 방에 메시지가 생긴다
--       · deleted_at=null → 신고로 지워진 메시지를 되살린다 (증거 훼손)
--     앱은 messages 를 update 하지 않는다. 종료 제안 결과(proposal_result)는
--     resolve_exit_proposal(security definer)이 쓴다. 그래서 관리자만 남긴다.
--
-- [2] post_system_message — 참여자면 누구나 '시스템' 문구를 마음대로 올렸다
--     금지어 필터를 거치지 않고, 닫힌 방에도, 정지된 계정으로도 됐다.
--     앱이 이걸 쓰는 곳은 약속 확정/변경/취소 안내 두 군데뿐이라, 그 문구를
--     set_match_plan 이 서버에서 직접 만들어 남기게 하고 실행 권한을 거둔다.
--     (구버전 앱이 계속 부르면 권한 오류가 나지만, 앱은 그 결과를 보지 않으므로
--      화면에는 영향이 없다. 안내 문구는 set_match_plan 이 대신 남긴다.)
--
-- [3] team_members_insert — 초대 코드 없이 팀에 들어가고, 팀장도 될 수 있었다
--     with check (user_id = auth.uid() and is_account_active()) 뿐이라
--       insert { team_id: <아는 팀 id>, user_id: 나, is_owner: true }
--     가 통과했다. 정원·성별 트리거는 지나야 하지만, 일단 들어가면 공동 팀장이
--     되어 팀 삭제·강퇴·매칭 수락까지 할 수 있었다.
--     정상 경로 두 개는 모두 security definer 라 RLS 를 거치지 않는다.
--       · 팀 생성 시 팀장 등록   add_owner_to_team() 트리거
--       · 초대 코드로 참여       join_team_by_code()
--     그래서 직접 insert 는 막는다.
--
-- [4] chat_rooms_update — 참여자가 방 행을 직접 고칠 수 있었다
--     합의로 닫힌 방을 closed_at=null 로 다시 열거나 match_id 를 바꿀 수 있었다.
--     방을 닫는 정상 경로는 resolve_exit_proposal(security definer)뿐이다.
--
-- 덤: v2 에서 만든 RPC 들은 `revoke ... from public` 만 했는데, Supabase 는
--     public 스키마 함수에 anon 실행 권한을 따로 준다(default privileges).
--     012 이후 파일들처럼 anon 에게서도 명시적으로 거둔다.
--
-- 실행: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
--       (전제: dku_meeting_schema_v2.sql + 마이그레이션 002~016)
--       여러 번 돌려도 안전하다.
--       ⚠ 이 파일을 먼저 적용한 뒤 앱을 배포한다. 새 앱은 약속 안내를 직접
--         올리지 않으므로, 순서가 바뀌면 그 사이 약속 안내가 빠진다.
-- ============================================================


-- ------------------------------------------------------------
-- 1. messages — update 는 관리자만 (신고 처리용 soft delete)
-- ------------------------------------------------------------
drop policy if exists messages_update       on messages;
drop policy if exists messages_update_admin on messages;

create policy messages_update_admin on messages for update to authenticated
using (is_admin())
with check (is_admin());

comment on policy messages_update_admin on messages is
  '일반 사용자는 메시지를 고칠 수 없다. 종료 제안 결과는 resolve_exit_proposal 이 쓴다 (마이그레이션 017).';


-- ------------------------------------------------------------
-- 2. chat_rooms — update 는 관리자만
-- ------------------------------------------------------------
drop policy if exists chat_rooms_update       on chat_rooms;
drop policy if exists chat_rooms_update_admin on chat_rooms;

create policy chat_rooms_update_admin on chat_rooms for update to authenticated
using (is_admin())
with check (is_admin());

comment on policy chat_rooms_update_admin on chat_rooms is
  '방을 닫는 길은 resolve_exit_proposal 하나다 (마이그레이션 017).';


-- ------------------------------------------------------------
-- 3. team_members — 직접 insert 금지
--    팀장 등록은 add_owner_to_team(), 팀 참여는 join_team_by_code() 가
--    security definer 로 넣는다.
-- ------------------------------------------------------------
drop policy if exists team_members_insert        on team_members;
drop policy if exists team_members_insert_denied on team_members;

create policy team_members_insert_denied on team_members for insert to authenticated
with check (false);

comment on policy team_members_insert_denied on team_members is
  '팀 참여는 join_team_by_code() 로만. 직접 넣으면 초대 코드 없이 is_owner=true 로 들어올 수 있었다 (마이그레이션 017).';


-- ------------------------------------------------------------
-- 4. set_match_plan — 약속 안내 시스템 메시지를 서버가 직접 남긴다
--
--    문구는 앱의 formatPlanSummary(utils/plan.ts)와 같은 모양이다.
--      약속이 확정되었어요.
--      8/20(수) 19:00 · 죽전역 근처
--    확정/변경은 '저장 전에 약속이 있었는가'로 가른다(앱과 같은 기준).
--    방이 닫혔으면 약속만 저장하고 안내는 남기지 않는다.
--
--    시그니처는 그대로라 앱의 호출부(setMatchPlan / clearMatchPlan)는 바뀌지 않는다.
-- ------------------------------------------------------------
create or replace function set_match_plan(
  p_match_id uuid,
  p_date     date,
  p_time     time,
  p_place    text
)
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_match    matches%rowtype;
  v_room_id  uuid;
  v_had_plan boolean;
  v_place    text := nullif(trim(p_place), '');
  v_text     text;
begin
  if not is_account_active() then
    raise exception '이용이 제한된 계정입니다';
  end if;

  -- 두 사람이 동시에 저장하면 둘 다 '확정되었어요'를 남기지 않도록 잠근다
  select * into v_match from matches where id = p_match_id for update;
  if not found then
    raise exception '매칭을 찾을 수 없습니다';
  end if;

  if not (is_team_member(v_match.from_team_id) or is_team_member(v_match.to_team_id)) then
    raise exception '이 매칭의 참여자가 아닙니다';
  end if;

  if v_match.status <> 'ACCEPTED' then
    raise exception '성사된 매칭에만 약속을 정할 수 있습니다';
  end if;

  v_had_plan := v_match.plan_date is not null;

  update matches
  set plan_date = p_date, plan_time = p_time, plan_place = v_place
  where id = p_match_id;

  -- 안내 문구
  select id into v_room_id
  from chat_rooms
  where match_id = p_match_id and closed_at is null;

  if v_room_id is null then
    return;
  end if;

  if p_date is null then
    if not v_had_plan then
      return;   -- 없던 약속을 '취소'했다는 안내는 남기지 않는다
    end if;
    v_text := '확정된 약속을 취소했어요.';
  else
    v_text :=
      case when v_had_plan then '약속이 변경되었어요.' else '약속이 확정되었어요.' end
      || E'\n'
      || to_char(p_date, 'FMMM/FMDD')
      || '(' || (array['일','월','화','수','목','금','토'])[extract(dow from p_date)::int + 1] || ')'
      || coalesce(' ' || to_char(p_time, 'HH24:MI'), '')
      || coalesce(' · ' || v_place, '');
  end if;

  insert into messages (room_id, sender_id, kind, content)
  values (v_room_id, null, 'system', v_text);
end; $$;


-- ------------------------------------------------------------
-- 5. 실행 권한 정리
-- ------------------------------------------------------------

-- 시스템 문구는 이제 서버 함수만 남긴다
revoke all on function post_system_message(uuid, text) from public;
revoke all on function post_system_message(uuid, text) from anon;
revoke all on function post_system_message(uuid, text) from authenticated;

-- 로그인한 사용자만 부르는 RPC 들. anon 에게서 명시적으로 거둔다.
revoke all on function set_match_plan(uuid, date, time, text) from public;
revoke all on function set_match_plan(uuid, date, time, text) from anon;
grant execute on function set_match_plan(uuid, date, time, text) to authenticated;

revoke all on function join_team_by_code(text) from public;
revoke all on function join_team_by_code(text) from anon;
grant execute on function join_team_by_code(text) to authenticated;

revoke all on function post_exit_proposal(uuid) from public;
revoke all on function post_exit_proposal(uuid) from anon;
grant execute on function post_exit_proposal(uuid) to authenticated;

revoke all on function resolve_exit_proposal(uuid, text) from public;
revoke all on function resolve_exit_proposal(uuid, text) from anon;
grant execute on function resolve_exit_proposal(uuid, text) to authenticated;


-- ------------------------------------------------------------
-- 6. 확인
-- ------------------------------------------------------------
-- 정책이 바뀌었는가 (messages / chat_rooms 의 UPDATE, team_members 의 INSERT)
-- select tablename, policyname, cmd, qual, with_check
-- from pg_policies
-- where tablename in ('messages', 'chat_rooms', 'team_members')
--   and cmd in ('UPDATE', 'INSERT')
-- order by tablename, cmd;
--
-- 기대값
--   chat_rooms   UPDATE  chat_rooms_update_admin      is_admin()  is_admin()
--   messages     INSERT  messages_insert_denied       -           false
--   messages     UPDATE  messages_update_admin        is_admin()  is_admin()
--   team_members INSERT  team_members_insert_denied   -           false
--
-- post_system_message 를 아무도 못 부르는가 (service_role / postgres 만 남아야 한다)
-- select grantee, privilege_type
-- from information_schema.routine_privileges
-- where routine_name = 'post_system_message';
