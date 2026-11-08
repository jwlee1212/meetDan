-- ============================================================
-- 마이그레이션 019 — 푸시 트리거를 전용 비밀값으로 인증한다
--
-- 문제
--   013 의 트리거는 Vault 의 service_role_key 를 Authorization 에 실어
--   send-push 를 불렀고, send-push 는 그 값을 자기 환경변수와 대조했다.
--     · 함수 쪽 SUPABASE_SERVICE_ROLE_KEY 는 Supabase 가 자동으로 넣는
--       '예전 JWT 형식' 키다. 이 프로젝트가 쓰는 새 sb_secret_… 키와 다르다.
--     · 새 키를 대조하려던 SUPABASE_SECRET_KEY 는 SUPABASE_ 접두사가 예약돼
--       있어 사용자가 설정할 수 없다.
--   그래서 두 값이 같아질 방법이 없고, 푸시는 늘 403 으로 막혔다.
--   덤으로 RLS 를 통째로 지나가는 관리자 키를 Vault 에 두어야 했다.
--
-- 해결
--   트리거와 send-push 가 '푸시 전용 비밀값' 하나만 공유한다.
--     DB 쪽     Vault 'push_hook_secret'
--     함수 쪽   Edge Function 시크릿 PUSH_HOOK_SECRET
--   이 값은 send-push 를 부를 자격 말고는 아무 권한이 없다. API 키를 교체해도
--   건드릴 필요가 없고, 새어 나가도 할 수 있는 일은 '이미 있는 알림을 다시
--   푸시하게 하는 것'뿐이다. 함수가 DB 를 읽는 열쇠는 Supabase 가 함수에
--   자동으로 넣어 주는 값을 그대로 쓴다.
--
--   헤더는 Authorization 이 아니라 x-push-secret 을 쓴다. Authorization 에
--   JWT 가 아닌 값을 실으면 게이트웨이 설정에 따라 함수에 닿기 전에 막힐 수 있다.
--
-- 실행 순서 (한 번만)
--   1. 비밀값을 하나 만든다 (터미널)
--        openssl rand -hex 32
--   2. 같은 값을 함수 쪽에 넣는다 (터미널, backend/ 에서)
--        supabase secrets set PUSH_HOOK_SECRET=<1번 값>
--   3. 같은 값을 Vault 에 넣는다 (SQL Editor) — 값이 먼저, 이름이 나중
--        select vault.create_secret('<1번 값>', 'push_hook_secret');
--      ⚠ < > 괄호는 빼고 값만 넣는다.
--   4. 이 파일을 SQL Editor 에서 실행한다
--   5. send-push 를 다시 배포한다
--        supabase functions deploy send-push
--   6. 이제 쓰지 않는 관리자 키를 Vault 에서 지운다
--        delete from vault.secrets where name = 'service_role_key';
--
--   여러 번 돌려도 안전하다.
-- ============================================================


create or replace function dispatch_push_notification()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  v_url    text;
  v_secret text;
begin
  -- 등록된 기기가 없는 사람이면 부를 것도 없다. 대부분의 알림이 여기서 끝난다.
  if not exists (select 1 from push_tokens where user_id = new.user_id) then
    return null;
  end if;

  begin
    select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'project_url';

    select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'push_hook_secret';

    -- 아직 준비가 안 된 프로젝트. 조용히 넘어간다.
    if v_url is null or v_secret is null then
      return null;
    end if;

    perform net.http_post(
      url     := rtrim(v_url, '/') || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'x-push-secret', v_secret
      ),
      -- 내용은 보내지 않는다. 함수가 id 로 직접 읽는다 (013 참고).
      body    := jsonb_build_object('notification_id', new.id)
    );

  exception when others then
    -- 푸시 한 통 때문에 알림(과 그걸 만든 매칭 수락)이 롤백되면 안 된다 (013 참고)
    raise warning '[push] 발송 요청 실패 (알림 %): %', new.id, sqlerrm;
  end;

  return null;
end; $$;

-- 트리거는 013 에서 만든 것을 그대로 쓴다. 함수 본문만 바꿨다.


-- ------------------------------------------------------------
-- 확인
-- ------------------------------------------------------------
-- Vault 준비 — project_url / push_hook_secret 두 줄. 값은 앞부분과 길이만 본다.
-- select name, left(decrypted_secret, 8) as 앞부분, length(decrypted_secret) as 길이
-- from vault.decrypted_secrets
-- where name in ('project_url', 'push_hook_secret');
--   push_hook_secret 의 길이는 openssl rand -hex 32 기준 64 여야 한다.
--
-- 최근 발송 요청의 응답 — status_code 200 이면 성공, 403 이면 비밀값이 서로 다르다.
-- select id, status_code, content::text, created
-- from net._http_response
-- order by id desc
-- limit 10;
