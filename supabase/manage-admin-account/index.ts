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
    const action = String(body?.action || '').trim()
    const note = String(body?.note || '').trim()

    if (!targetAdminId || !action) {
      return new Response(JSON.stringify({ error: 'target_admin_id and action are required.' }), {
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

    if (action === 'deactivate') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          account_status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetAdminId)

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await supabase.from('admin_account_action_logs').insert([{
        action_type: 'deactivate_admin',
        target_admin_id: targetProfile.id,
        target_email: targetProfile.email,
        target_name: targetProfile.name,
        action_by: user.id,
        note: note || '관리자 비활성화',
      }])

      return new Response(JSON.stringify({ success: true, action: 'deactivate' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      await supabase.from('admin_account_action_logs').insert([{
        action_type: 'delete_admin',
        target_admin_id: targetProfile.id,
        target_email: targetProfile.email,
        target_name: targetProfile.name,
        action_by: user.id,
        note: note || '관리자 삭제',
      }])

      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetAdminId)

      if (authDeleteError) {
        return new Response(JSON.stringify({ error: authDeleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .update({
          account_status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetAdminId)

      if (profileDeleteError) {
        return new Response(JSON.stringify({ error: profileDeleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, action: 'delete' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unsupported action.' }), {
      status: 400,
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
