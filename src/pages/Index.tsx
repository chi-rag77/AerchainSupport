"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/SupabaseProvider";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { session } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Freshdesk Ticket Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Welcome, {session?.user?.email}!
        </p>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;