// 파일: supabase/functions/delete-account/index.ts
//
// 회원 탈퇴.
//
// auth 계정을 지우지 않는다. profiles 의 외래키가 전부 cascade 라 지우는
// 순간 상대 팀의 채팅 기록과 이 사람이 받은 신고까지 사라지고, 같은 메일로
// 바로 다시 가입할 수 있게 된다 (마이그레이션 018 머리말 참고).
//
// 흐름
//   1. Authorization 헤더로 누가 탈퇴하는지 확인한다 (본인만 탈퇴할 수 있다)
//   2. anonymize_account() — 개인정보를 지우고 팀을 정리한다 (DB 한 트랜잭션)
//   3. auth 계정을 정지하고 가입 메타데이터(이름·학과 등)를 비운다
//   4. 이 사람의 모든 기기 세션을 끊는다
//
// 2 가 끝나고 3 에서 실패해도 다시 부르면 된다. anonymize_account 는 이미
// 탈퇴한 계정이면 아무것도 하지 않는다. 그 사이에도 profiles.deleted_at 이
// 찼으므로 앱은 로그인을 막고("탈퇴한 계정이에요") RLS 도 쓰기를 막는다.
//
// 요청  (본문 없음)
// 응답  { success: true }
//       { error: "..." }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

/**
 * 서버 열쇠. send-push 와 같은 이유로 예전 JWT 형식(service_role)과
 * 새 형식(sb_secret_…)을 둘 다 받는다. 먼저 잡히는 값을 쓴다.
 */
const serviceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SECRET_KEY") ??
  "";

/** 사실상 영구 정지 (약 100년) */
const BAN_FOREVER = "876000h";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "잘못된 요청이에요" }, 405);
  }

  // 1. 누구인가
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "로그인이 필요해요" }, 401);
  }

  // 게이트웨이 검사를 껐으므로(config.toml) 여기서 확인한다.
  // getUser(jwt) 는 토큰을 Auth 서버에 보내 검증한다 — 서명 키 형식과 무관하다.
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userData, error: userErr } = await adminClient.auth.getUser(jwt);
  if (userErr || !userData.user) {
    console.error("[delete-account] 사용자 확인 실패", userErr);
    return json({ error: "인증 실패", code: "auth_user" }, 401);
  }
  const userId = userData.user.id;

  // 2. DB 쪽 익명화
  const { error: anonErr } = await adminClient.rpc("anonymize_account", {
    p_user_id: userId,
  });
  if (anonErr) {
    console.error("[delete-account] anonymize_account 실패", anonErr);
    // code 는 원인을 가리기 위한 값이라 내보내도 된다 (내용은 담지 않는다).
    //   PGRST202 = 함수가 없다 → 마이그레이션 018 미적용
    //   42501    = 권한/가드에 막혔다
    return json(
      {
        error: "탈퇴 처리 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
        code: anonErr.code ?? "db_error",
      },
      500,
    );
  }

  // 3. 로그인 차단 + 가입 메타데이터 비우기
  //    메일은 auth 에도 남긴다 — 같은 메일로 다시 가입하는 것을 막는 쪽이 이것이다.
  //    user_metadata 는 키 단위로 합쳐지므로 가입 때 넣은 키를 하나하나 null 로 덮는다.
  const { error: banErr } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: BAN_FOREVER,
    user_metadata: {
      login_id: null,
      name: null,
      gender: null,
      birth_year: null,
      campus: null,
      dept: null,
    },
  });
  if (banErr) {
    console.error("[delete-account] 계정 정지 실패", banErr);
    return json(
      {
        error: "탈퇴 처리 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
        code: `auth_${banErr.status ?? "error"}`,
      },
      500,
    );
  }

  // 4. 모든 기기의 세션(리프레시 토큰)을 끊는다.
  //    정지된 계정은 토큰 갱신이 막히지만, 남은 세션까지 지워 두는 게 확실하다.
  //    실패해도 탈퇴 자체는 끝났으므로 성공으로 돌려준다.
  const { error: signOutErr } = await adminClient.auth.admin.signOut(jwt, "global");
  if (signOutErr) {
    console.error("[delete-account] 세션 정리 실패 (탈퇴는 완료)", signOutErr);
  }

  return json({ success: true });
});
