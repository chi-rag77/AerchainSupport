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

    const authHeader = req.headers.get('Authorization')
    const userSupabase = createClient(supabaseUrl!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader! } }
    })

    const { data: { user: actor } } = await userSupabase.auth.getUser()
    if (!actor) throw new Error("Unauthorized")

    // 1. Verify Admin
    const { data: actorOrg } = await supabase
      .from('org_users')
      .select('role, org_id')
      .eq('id', actor.id)
      .single()

    if (actorOrg?.role !== 'admin') throw new Error("Forbidden: Admin access required")

    const { email, role } = await req.json()

    // 2. Check existing member
    const { data: existing } = await supabase
      .from('org_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) throw new Error("This user is already a member.")

    // 3. Create Invitation
    const { data: invite, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        org_id: actorOrg.org_id,
        email,
        role,
        invited_by: actor.id,
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) throw inviteError

    // 4. Log Action
    await supabase.from('audit_log').insert({
      org_id: actorOrg.org_id,
      actor_id: actor.id,
      actor_email: actor.email,
      action: 'user.invited',
      target_type: 'invitation',
      target_email: email,
      new_value: { role }
    })

    // 5. Send Email (Simulated for now)
    console.log(`[invite-user] Invitation link: ${Deno.env.get('APP_URL')}/accept-invite?token=${invite.token}`)

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