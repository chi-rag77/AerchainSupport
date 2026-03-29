import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabase } from "@/components/SupabaseProvider";
import { OrgUser, OrgSettings } from "@/types";

interface OrgData {
  user: OrgUser | null;
  settings: OrgSettings | null;
}

export function useOrgData() {
  const { session } = useSupabase();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const { data, isLoading, error } = useQuery<OrgData, Error>({
    queryKey: ["orgData", userId],
    queryFn: async () => {
      if (!userId || !userEmail) {
        return { user: null, settings: null };
      }

      // 1. Fetch current user's role and profile using ID (Primary Key)
      const { data: userData, error: userError } = await supabase
        .from('org_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let userRole: OrgUser | null = userData as OrgUser;

      if (!userData) {
        // Fallback to email lookup if ID doesn't match (legacy or manual entry)
        const { data: emailData } = await supabase
          .from('org_users')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();
        
        if (emailData) {
          // Sync the ID if it was missing or different
          const { data: updated } = await supabase
            .from('org_users')
            .update({ id: userId })
            .eq('email', userEmail)
            .select()
            .single();
          userRole = updated as OrgUser;
        } else {
          // First user logic: if no users exist, make this user an admin
          const { count } = await supabase.from('org_users').select('*', { count: 'exact', head: true });
          
          if (count === 0) {
            const { data: newUser } = await supabase
              .from('org_users')
              .insert({
                id: userId,
                org_id: userId,
                email: userEmail,
                role: 'admin',
                is_active: true,
                display_name: session?.user?.user_metadata?.full_name || userEmail.split('@')[0]
              })
              .select()
              .single();
            userRole = newUser as OrgUser;
          } else {
            // Default to viewer for unapproved signups
            userRole = {
              id: userId,
              org_id: userId,
              email: userEmail,
              role: 'viewer',
              is_active: true,
              created_at: new Date().toISOString(),
            } as OrgUser;
          }
        }
      }

      // 2. Fetch organization settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('org_settings')
        .select('*')
        .eq('org_id', userRole?.org_id)
        .maybeSingle();

      return {
        user: userRole,
        settings: settingsData as OrgSettings || null,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  } as UseQueryOptions<OrgData, Error>);

  return {
    orgUser: data?.user,
    orgSettings: data?.settings,
    isOrgLoading: isLoading,
    orgError: error,
    isAdmin: data?.user?.role === 'admin',
    orgId: data?.user?.org_id,
  };
}