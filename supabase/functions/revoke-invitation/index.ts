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

    const { invitation_id } = await req.json()

    // 1. Verify Admin
    const { data: actorOrg } = await supabase
      .from('org_users')
      .select('role, org_id')
      .eq('id', actor.id)
      .single()

    if (actorOrg?.role !== 'admin') throw new Error("Forbidden")

    // 2. Revoke
    const { data: invite } = await supabase
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', invitation_id)
      .select('email')
      .single()

    // 3. Log Action
    await supabase.from('audit_log').insert({
      org_id: actorOrg.org_id,
      actor_id: actor.id,
      actor_email: actor.email,
      action: 'user.invitation_revoked',
      target_type: 'invitation',
      target_id: invitation_id,
      target_email: invite?.email
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