import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import * as dateFns from "https://esm.sh/date-fns@2.30.0";

const PRIORITY_MAP: { [key: number]: string } = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent" };
const STATUS_MAP: { [key: number]: string } = { 2: "Open (Being Processed)", 3: "Pending (Awaiting your Reply)", 4: "Resolved", 5: "Closed", 8: "Waiting on Customer", 7: "On Tech", 9: "On Product" };

export async function syncTicketsForOrg(supabase: any, orgId: string, options: { updatedSince?: string, ticketId?: string, trigger: string }) {
  // 1. Create Sync Job Record
  const { data: job, error: jobError } = await supabase
    .from('sync_jobs')
    .insert({ org_id: orgId, trigger: options.trigger, status: 'running' })
    .select()
    .single();

  if (jobError) throw jobError;

  try {
    // 2. Get Org Settings
    const { data: settings } = await supabase
      .from("org_settings")
      .select("freshdesk_domain, freshdesk_api_key")
      .eq("org_id", orgId)
      .single();

    if (!settings?.freshdesk_api_key) throw new Error("Freshdesk API key not configured.");

    const { freshdesk_api_key: apiKey, freshdesk_domain: domain } = settings;
    const authHeader = { "Authorization": "Basic " + btoa(apiKey + ":X") };

    let ticketsToUpsert: any[] = [];

    if (options.ticketId) {
      // Single Ticket Sync (Webhook)
      const res = await fetch(`https://${domain}.freshdesk.com/api/v2/tickets/${options.ticketId}?include=requester,stats,company,description`, { headers: authHeader });
      if (res.ok) ticketsToUpsert.push(await res.json());
    } else {
      // Bulk Sync (Cron/Manual)
      let page = 1;
      let hasMore = true;
      const since = options.updatedSince || dateFns.subMinutes(new Date(), 30).toISOString();

      while (hasMore && page <= 10) { // Limit to 10 pages per run for safety
        const url = `https://${domain}.freshdesk.com/api/v2/tickets?include=requester,stats,company,description&updated_since=${encodeURIComponent(since)}&page=${page}&per_page=100`;
        const res = await fetch(url, { headers: authHeader });
        if (!res.ok) break;
        const data = await res.json();
        if (!data || data.length === 0) { hasMore = false; break; }
        ticketsToUpsert = [...ticketsToUpsert, ...data];
        page++;
      }
    }

    // 3. Transform and Upsert
    const transformed = ticketsToUpsert.map(t => ({
      freshdesk_id: t.id.toString(),
      subject: t.subject || "No Subject",
      priority: PRIORITY_MAP[t.priority] || "Medium",
      status: STATUS_MAP[t.status] || "Open (Being Processed)",
      type: t.type || null,
      requester_email: t.requester?.email || "unknown@freshdesk.com",
      created_at: t.created_at,
      updated_at: t.updated_at,
      due_by: t.due_by || null,
      description_text: t.description_text || null,
      cf_company: t.custom_fields?.cf_company || null,
      cf_module: t.custom_fields?.cf_module || null,
      custom_fields: t.custom_fields || {}
    }));

    if (transformed.length > 0) {
      const { error: upsertError } = await supabase
        .from('freshdesk_tickets')
        .upsert(transformed, { onConflict: 'freshdesk_id' });
      if (upsertError) throw upsertError;
    }

    // 4. Update Job and Org Settings
    await supabase.from('sync_jobs').update({ 
      status: 'success', 
      tickets_synced: transformed.length, 
      completed_at: new Date().toISOString() 
    }).eq('id', job.id);

    await supabase.from('org_settings').update({ last_sync_at: new Date().toISOString() }).eq('org_id', orgId);

    return { success: true, count: transformed.length };

  } catch (err: any) {
    await supabase.from('sync_jobs').update({ 
      status: 'failed', 
      error_message: err.message, 
      completed_at: new Date().toISOString() 
    }).eq('id', job.id);
    throw err;
  }
}