import { createClient } from '@supabase/supabase-js'

type ApproveAdminSignupPayload = {
  request_id: string
}

type JsonRecord = Record<string, unknown>

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          error: '서버 환경변수 설정이 누락되었습니다.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '인증 헤더가 없습니다.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: '사용자 인증 확인에 실패했습니다.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: approverProfile, error: approverProfileError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (approverProfileError || !approverProfile) {
      return new Response(
        JSON.stringify({ error: '승인자 프로필을 찾지 못했습니다.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (approverProfile.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'super_admin만 승인할 수 있습니다.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const body = (await req.json()) as ApproveAdminSignupPayload
    const requestId = String(body?.request_id || '').trim()

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'request_id가 필요합니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: signupRequest, error: signupError } = await adminClient
      .from('admin_signup_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle()

    if (signupError || !signupRequest) {
      return new Response(
        JSON.stringify({ error: '가입신청 정보를 찾지 못했습니다.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (signupRequest.status === 'approved' && signupRequest.approved_user_id) {
      return new Response(
        JSON.stringify({
          error: '이미 승인된 요청입니다.',
          approved_user_id: signupRequest.approved_user_id,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!signupRequest.email || !signupRequest.password) {
      return new Response(
        JSON.stringify({ error: '이메일 또는 비밀번호가 없습니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: createdUserData, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email: signupRequest.email,
        password: signupRequest.password,
        email_confirm: true,
        user_metadata: {
          name: signupRequest.name || '',
          approved_from_signup_request: signupRequest.id,
        },
      })

    if (createUserError || !createdUserData.user) {
      return new Response(
        JSON.stringify({
          error: createUserError?.message || '관리자 계정 생성에 실패했습니다.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const createdUser = createdUserData.user

    const profileInsertPayload: JsonRecord = {
      id: createdUser.id,
      name: signupRequest.name || null,
      role: 'admin',
      admin_id: createdUser.id,
      account_status: 'active',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    }

    const { error: profileInsertError } = await adminClient
      .from('profiles')
      .insert([profileInsertPayload])

    if (profileInsertError) {
      await adminClient.auth.admin.deleteUser(createdUser.id)

      return new Response(
        JSON.stringify({
          error: `profiles 생성 실패: ${profileInsertError.message}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { error: requestUpdateError } = await adminClient
      .from('admin_signup_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        approved_user_id: createdUser.id,
        password: 'APPROVED_AND_CLEARED',
      })
      .eq('id', signupRequest.id)

    if (requestUpdateError) {
      return new Response(
        JSON.stringify({
          error: `가입신청 상태 업데이트 실패: ${requestUpdateError.message}`,
          created_user_id: createdUser.id,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '관리자 계정 생성 및 승인 완료',
        request_id: signupRequest.id,
        approved_user_id: createdUser.id,
        email: signupRequest.email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
