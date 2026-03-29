import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const { token, password, display_name } = await req.json()

    // 1. Verify Invitation
    const { data: invite, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) throw new Error("Invalid invitation link.")
    if (invite.status !== 'pending') throw new Error(`Invitation is ${invite.status}.`)
    if (new Date(invite.expires_at) < new Date()) throw new Error("Invitation has expired.")

    // 2. Create Auth User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: display_name }
    })

    if (authError) throw authError

    // 3. Create Org User
    await supabase.from('org_users').insert({
      id: authUser.user.id,
      org_id: invite.org_id,
      email: invite.email,
      role: invite.role,
      display_name,
      is_active: true,
      invited_by: invite.invited_by
    })

    // 4. Update Invitation
    await supabase.from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invite.id)

    // 5. Log Action
    await supabase.from('audit_log').insert({
      org_id: invite.org_id,
      actor_id: authUser.user.id,
      actor_email: invite.email,
      action: 'user.accepted_invitation',
      target_type: 'user',
      target_id: authUser.user.id
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})