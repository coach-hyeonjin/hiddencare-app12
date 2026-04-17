import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPER_ADMIN_UID = 'c3e35f5c-3f1e-4c62-b098-482ebcd805fa'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('FUNCTION_VERSION: 2026-04-17-approve-final')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is missing.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Access token is missing.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: userError?.message || 'Failed to verify current user.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (user.id !== SUPER_ADMIN_UID) {
      return new Response(
        JSON.stringify({ error: 'Not super admin.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => null)
    const requestId = String(body?.request_id || '').trim()

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'request_id is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: signupRequest, error: signupRequestError } = await supabase
      .from('admin_signup_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (signupRequestError || !signupRequest) {
      return new Response(
        JSON.stringify({ error: signupRequestError?.message || 'Signup request not found.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (signupRequest.status === 'approved' && signupRequest.approved_user_id) {
      return new Response(
        JSON.stringify({
          error: 'This request is already approved.',
          approved_user_id: signupRequest.approved_user_id,
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const email = String(signupRequest.email || '').trim()
    const password = String(signupRequest.password || '').trim()
    const name = String(signupRequest.name || '').trim()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Signup request email or password is missing.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: createdUserData, error: createUserError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          approved_from_signup_request: signupRequest.id,
        },
      })

    if (createUserError || !createdUserData?.user?.id) {
      return new Response(
        JSON.stringify({ error: createUserError?.message || 'Failed to create auth user.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const createdUserId = createdUserData.user.id

    const profilePayload = {
      id: createdUserId,
      name: name || null,
      email,
      role: 'admin',
      admin_id: createdUserId,
      signup_request_id: signupRequest.id,
      account_status: 'active',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    }

    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert([profilePayload])

    if (profileInsertError) {
      await supabase.auth.admin.deleteUser(createdUserId)

      return new Response(
        JSON.stringify({ error: `profiles insert failed: ${profileInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updatePayload = {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      approved_user_id: createdUserId,
      password: null,
    }

    const { error: updateError } = await supabase
      .from('admin_signup_requests')
      .update(updatePayload)
      .eq('id', requestId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('admin_account_action_logs').insert([{
      action_type: 'approve_signup',
      target_admin_id: createdUserId,
      target_email: email,
      target_name: name || null,
      action_by: user.id,
      note: '관리자 가입 승인 완료',
      extra: { signup_request_id: signupRequest.id },
    }])

    return new Response(
      JSON.stringify({
        success: true,
        approved_user_id: createdUserId,
        email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
