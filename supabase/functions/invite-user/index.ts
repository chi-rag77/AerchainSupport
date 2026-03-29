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

    const { data: { user: actor }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !actor) throw new Error("Unauthorized")

    console.log(`[invite-user] Request from user: ${actor.id} (${actor.email})`);

    // 1. Verify Admin
    const { data: actorOrg, error: orgError } = await supabase
      .from('org_users')
      .select('role, org_id')
      .eq('id', actor.id)
      .maybeSingle()

    if (orgError) {
      console.error(`[invite-user] DB Error checking role:`, orgError);
      throw new Error("Internal server error checking permissions");
    }

    console.log(`[invite-user] Actor role found: ${actorOrg?.role || 'NONE'}`);

    if (actorOrg?.role !== 'admin') {
      return new Response(JSON.stringify({ 
        error: "Forbidden: Admin access required",
        details: `Your current role is ${actorOrg?.role || 'not found'}.`
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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

    console.log(`[invite-user] Invitation created for ${email}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error(`[invite-user] Fatal Error:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})