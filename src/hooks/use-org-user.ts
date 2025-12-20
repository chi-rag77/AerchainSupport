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

      // 1. Fetch current user's role
      const { data: userData, error: userError } = await supabase
        .from('org_users')
        .select('*')
        .eq('email', userEmail)
        .single();

      let userRole: OrgUser | null = null;
      if (userError && userError.code === 'PGRST116') {
        // User not found in org_users, assume viewer role for now, but prompt admin creation
        userRole = {
          id: userId,
          org_id: userId,
          email: userEmail,
          role: 'viewer', // Default to viewer if not explicitly set
          is_active: true,
          created_at: new Date().toISOString(),
        } as OrgUser;
      } else if (userError) {
        throw userError;
      } else {
        userRole = userData as OrgUser;
      }

      // 2. Fetch organization settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('org_settings')
        .select('*')
        .eq('org_id', userId) // Use auth.uid() as org_id
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      return {
        user: userRole,
        settings: settingsData as OrgSettings || null,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  } as UseQueryOptions<OrgData, Error>);

  return {
    orgUser: data?.user,
    orgSettings: data?.settings,
    isOrgLoading: isLoading,
    orgError: error,
    isAdmin: data?.user?.role === 'admin',
    orgId: userId, // Use userId as orgId
  };
}