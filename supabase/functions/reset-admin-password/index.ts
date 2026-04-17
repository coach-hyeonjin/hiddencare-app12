import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPER_ADMIN_UID = 'c3e35f5c-3f1e-4c62-b098-482ebcd805fa'

function makeTempPassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header is missing.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Failed to verify current user.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (user.id !== SUPER_ADMIN_UID) {
      return new Response(JSON.stringify({ error: 'Not super admin.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => null)
    const targetAdminId = String(body?.target_admin_id || '').trim()

    if (!targetAdminId) {
      return new Response(JSON.stringify({ error: 'target_admin_id is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, role, account_status')
      .eq('id', targetAdminId)
      .single()

    if (profileError || !targetProfile) {
      return new Response(JSON.stringify({ error: 'Target admin profile not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (targetProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admin accounts can be reset.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tempPassword = makeTempPassword(10)

    const { error: updateUserError } = await supabase.auth.admin.updateUserById(targetAdminId, {
      password: tempPassword,
    })

    if (updateUserError) {
      return new Response(JSON.stringify({ error: updateUserError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('admin_account_action_logs').insert([{
      action_type: 'reset_password',
      target_admin_id: targetProfile.id,
      target_email: targetProfile.email,
      target_name: targetProfile.name,
      action_by: user.id,
      note: '임시 비밀번호 발급',
      extra: { account_status: targetProfile.account_status },
    }])

    return new Response(JSON.stringify({
      success: true,
      target_admin_id: targetProfile.id,
      email: targetProfile.email,
      temp_password: tempPassword,
      message: '임시 비밀번호가 발급되었습니다.',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
