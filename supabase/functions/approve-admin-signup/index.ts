import { createClient } from "npm:@supabase/supabase-js@2";

type ApproveAdminSignupPayload = {
  request_id: string;
};

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Supabase 환경변수가 없습니다." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization 헤더가 없습니다." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user: approverUser },
      error: approverAuthError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (approverAuthError || !approverUser) {
      return new Response(
        JSON.stringify({ error: "승인자 인증 확인 실패" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: approverProfile, error: approverProfileError } =
      await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", approverUser.id)
        .maybeSingle();

    if (approverProfileError || !approverProfile) {
      return new Response(
        JSON.stringify({ error: "승인자 프로필 조회 실패" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (approverProfile.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "super_admin만 승인할 수 있습니다." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = (await req.json()) as ApproveAdminSignupPayload;
    const requestId = String(body?.request_id || "").trim();

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: "request_id가 필요합니다." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: signupRequest, error: signupRequestError } =
      await supabaseAdmin
        .from("admin_signup_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

    if (signupRequestError || !signupRequest) {
      return new Response(
        JSON.stringify({ error: "가입신청 정보를 찾지 못했습니다." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (signupRequest.status === "approved" && signupRequest.approved_user_id) {
      return new Response(
        JSON.stringify({
          error: "이미 승인된 요청입니다.",
          approved_user_id: signupRequest.approved_user_id,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!signupRequest.email || !signupRequest.password) {
      return new Response(
        JSON.stringify({ error: "이메일 또는 비밀번호가 비어 있습니다." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: createdUserData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: signupRequest.email,
        password: signupRequest.password,
        email_confirm: true,
        user_metadata: {
          name: signupRequest.name || "",
        },
      });

    if (createUserError || !createdUserData.user) {
      return new Response(
        JSON.stringify({
          error: createUserError?.message || "관리자 계정 생성 실패",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const createdUser = createdUserData.user;

    const { error: profileInsertError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: createdUser.id,
          name: signupRequest.name || null,
          role: "admin",
          admin_id: createdUser.id,
          account_status: "active",
          approved_at: new Date().toISOString(),
          approved_by: approverUser.id,
        },
      ]);

    if (profileInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(createdUser.id);

      return new Response(
        JSON.stringify({
          error: `profiles 생성 실패: ${profileInsertError.message}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { error: requestUpdateError } = await supabaseAdmin
      .from("admin_signup_requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approverUser.id,
        approved_user_id: createdUser.id,
        password: "APPROVED_AND_CLEARED",
      })
      .eq("id", signupRequest.id);

    if (requestUpdateError) {
      return new Response(
        JSON.stringify({
          error: `가입신청 상태 업데이트 실패: ${requestUpdateError.message}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "관리자 계정 생성 및 승인 완료",
        approved_user_id: createdUser.id,
        email: signupRequest.email,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});