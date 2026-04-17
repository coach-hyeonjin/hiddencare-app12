console.log('FUNCTION_VERSION: 2026-04-17-fix-approved-by-user-id')
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
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header exists:', !!authHeader)

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is missing.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    console.log('Token exists:', !!token)

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Access token is missing.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SERVICE_ROLE_KEY exists:', !!serviceRoleKey)

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    console.log('getUser result user.id:', user?.id ?? null)
    console.log('getUser result user.email:', user?.email ?? null)
    console.log('SUPER_ADMIN_UID:', SUPER_ADMIN_UID)
    console.log('userError:', userError)

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: userError?.message || 'Failed to verify current user.',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (user.id !== SUPER_ADMIN_UID) {
      return new Response(
        JSON.stringify({
          error: 'Not super admin.',
          current_user_id: user.id,
          expected_super_admin_uid: SUPER_ADMIN_UID,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const body = await req.json().catch(() => null)
    console.log('request body:', body)

    const requestId = body?.request_id

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'request_id is required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: signupRequest, error: signupRequestError } = await supabase
      .from('admin_signup_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    console.log('signupRequest:', signupRequest)
    console.log('signupRequestError:', signupRequestError)

    if (signupRequestError || !signupRequest) {
      return new Response(
        JSON.stringify({
          error: signupRequestError?.message || 'Signup request not found.',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (signupRequest.status === 'approved') {
      return new Response(
        JSON.stringify({ error: 'This request is already approved.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const email = String(signupRequest.email || '').trim()
    const password = String(signupRequest.password || '').trim()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Signup request email or password is missing.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: createdUserData, error: createUserError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    console.log('createdUserData:', createdUserData)
    console.log('createUserError:', createUserError)

    if (createUserError) {
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const createdUserId = createdUserData?.user?.id

    if (!createdUserId) {
      return new Response(
        JSON.stringify({ error: 'User was created but user id is missing.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { error: updateError } = await supabase
  .from('admin_signup_requests')
  .update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: user.id,
    approved_user_id: createdUserId,
  })
  .eq('id', requestId)

    console.log('updateError:', updateError)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        approved_user_id: createdUserId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('approve-admin-signup fatal error:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
