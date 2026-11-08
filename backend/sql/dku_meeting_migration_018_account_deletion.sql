-- ============================================================
-- 마이그레이션 018 — 회원 탈퇴 (익명화)
--
-- 왜 계정을 통째로 지우지 않나
--   profiles 를 가리키는 외래키가 전부 on delete cascade 라, auth 계정을
--   지우는 순간 이 사람이 걸린 것들이 연쇄로 사라진다.
--     · 팀장이었다면 팀 → 매칭 → 채팅방 → 상대 팀의 대화 기록까지 전부
--     · 이 사람이 받은 신고(reports.target_user_id)
--   그리고 같은 메일로 바로 다시 가입할 수 있어, 신고를 받으면 탈퇴하고
--   새로 들어오는 식으로 제재를 피할 수 있다.
--
-- 그래서 행은 남기고 사람을 알아볼 수 있는 값만 지운다
--   지운다      이름·닉네임·소개·MBTI·출생연도·아바타, 아이디(login_id),
--               푸시 토큰, 알림, 알림 설정, 내가 건 차단 목록,
--               다른 사람의 차단 목록에 스냅샷으로 남은 내 이름·학과
--   남긴다      이메일        같은 메일로 다시 가입하는 것을 막는다
--               성별·캠퍼스·학과   성사된 팀의 사실 정보(팀 성별·학과)가 이것을 본다
--               보낸 메시지    상대 팀의 대화 기록. 화면에는 '밋단 회원'으로 뜬다
--                              (profiles_select 가 deleted_at 이 찬 행을 가린다)
--               받은 신고·제재 이력
--   ⚠ 이메일과 메시지를 남긴다는 것과 보관 기간을 개인정보처리방침에 적어야 한다.
--
-- 팀은 이렇게 정리한다
--   매칭이 성사된 팀(MATCHED)   그대로 둔다. 빠지면 상대 팀 채팅방의 참여자
--                               구성이 무너진다. 이 사람은 로그인할 수 없으니
--                               이름 없는 팀원으로 남는다.
--   그 외 팀에서 팀장           팀을 지운다. 성사된 매칭이 없으므로 채팅방도 없고,
--                               걸려 있던 대기중·거절 신청만 함께 사라진다.
--   그 외 팀에서 팀원           팀에서 뺀다. sync_team_fill 이 인원을 다시 세고
--                               공개중이던 팀은 게시판에서 내린다 (마이그레이션 009).
--
-- 로그인 차단은 여기서 하지 않는다
--   auth 쪽(계정 정지·메타데이터 비우기)은 SQL 로 건드리지 않고 delete-account
--   Edge Function 이 Admin API 로 한다. 이 함수는 그 함수만 부를 수 있다.
--
-- 실행: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
--       (전제: dku_meeting_schema_v2.sql + 마이그레이션 002~017)
--       여러 번 돌려도 안전하다.
--       ⚠ 적용한 뒤 delete-account 를 함께 배포한다.
--         supabase functions deploy delete-account
-- ============================================================


-- ------------------------------------------------------------
-- 1. profiles 가드에 '탈퇴 처리 중' 통로를 낸다
--
--    guard_profile_update(마이그레이션 003·006)는 관리자가 아니면 이름·아이디·
--    상태·deleted_at 변경을 막는다. 탈퇴는 service_role 이 부르므로 auth.uid()
--    가 비어 is_admin() 도 거짓이라 그대로 막힌다.
--
--    아래 anonymize_account() 가 트랜잭션 안에서만 app.account_deletion 을
--    켜고, 가드는 그때만 통과시킨다. 사용자는 PostgREST 로 임의의 설정값을
--    바꿀 수 없고, 이 값을 켜는 함수는 service_role 만 부를 수 있다.
--
--    나머지 내용은 006 의 정의와 같다.
-- ------------------------------------------------------------
create or replace function guard_profile_update()
returns trigger language plpgsql as $$
begin
  if is_admin() then
    return new;
  end if;

  if coalesce(current_setting('app.account_deletion', true), 'off') = 'on' then
    return new;
  end if;

  if new.login_id        is distinct from old.login_id
  or new.name             is distinct from old.name
  or new.email            is distinct from old.email
  or new.gender           is distinct from old.gender
  or new.campus           is distinct from old.campus
  or new.dept             is distinct from old.dept
  or new.email_verified_at is distinct from old.email_verified_at
  or new.status           is distinct from old.status
  or new.strike_count     is distinct from old.strike_count
  or new.suspended_until  is distinct from old.suspended_until
  or new.deleted_at       is distinct from old.deleted_at
  then
    raise exception '가입 정보 및 운영 컬럼은 본인이 직접 수정할 수 없어요.'
      using errcode = '42501';
  end if;

  if old.birth_year is not null
     and new.birth_year is distinct from old.birth_year then
    raise exception '출생연도는 한 번 등록하면 바꿀 수 없어요.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;


-- ------------------------------------------------------------
-- 2. 익명화 함수
--
--    이미 탈퇴한 계정이면 아무것도 하지 않는다. Edge Function 이 DB 처리 뒤
--    auth 정지에서 실패해 다시 불러도 같은 결과가 나온다.
-- ------------------------------------------------------------
create or replace function anonymize_account(p_user_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_profile profiles%rowtype;
  v_team    record;
begin
  select * into v_profile from profiles where id = p_user_id for update;
  if not found then
    raise exception '프로필을 찾을 수 없습니다' using errcode = 'no_data_found';
  end if;

  if v_profile.deleted_at is not null then
    return;
  end if;

  perform set_config('app.account_deletion', 'on', true);

  -- (1) 팀
  for v_team in
    select t.id, t.status, tm.is_owner
    from team_members tm
    join teams t on t.id = tm.team_id
    where tm.user_id = p_user_id
    order by t.id
    for update of t
  loop
    if v_team.status = 'MATCHED' then
      continue;
    elsif v_team.is_owner then
      delete from teams where id = v_team.id;
    else
      delete from team_members where team_id = v_team.id and user_id = p_user_id;
    end if;
  end loop;

  -- (2) 이 사람에게만 의미 있는 것들
  delete from push_tokens        where user_id = p_user_id;
  delete from notifications      where user_id = p_user_id;
  delete from notification_mutes where user_id = p_user_id;
  delete from blocks             where blocker_id = p_user_id;

  -- (3) 남의 차단 목록에 남은 내 스냅샷. 차단 관계는 유지한다
  --     (차단한 사람 입장에서 이 사람을 다시 볼 일이 없어야 한다).
  update blocks
  set blocked_name = '탈퇴한 회원', blocked_dept = null
  where blocked_id = p_user_id;

  -- (4) 프로필
  update profiles
  set name       = '탈퇴한 회원',
      -- login_id 는 unique 라 비울 수 없다. 원래 아이디는 다른 사람이 쓸 수 있게 풀어 준다.
      login_id   = 'del_' || left(replace(p_user_id::text, '-', ''), 16),
      nickname   = null,
      bio        = null,
      mbti       = null,
      birth_year = null,
      avatar_idx = 0,
      status     = 'deleted',
      deleted_at = now()
  where id = p_user_id;

  perform set_config('app.account_deletion', 'off', true);
end; $$;

comment on function anonymize_account(uuid) is
  '회원 탈퇴. 개인정보를 지우고 행은 남긴다. delete-account Edge Function(service_role)만 부른다 (마이그레이션 018).';

revoke all on function anonymize_account(uuid) from public;
revoke all on function anonymize_account(uuid) from anon;
revoke all on function anonymize_account(uuid) from authenticated;
grant execute on function anonymize_account(uuid) to service_role;


-- ------------------------------------------------------------
-- 3. 확인
-- ------------------------------------------------------------
-- 실행 권한 — service_role(과 postgres)만 남아야 한다
-- select grantee, privilege_type
-- from information_schema.routine_privileges
-- where routine_name = 'anonymize_account';
--
-- 탈퇴 처리된 계정
-- select id, login_id, name, status, deleted_at from profiles where deleted_at is not null;
