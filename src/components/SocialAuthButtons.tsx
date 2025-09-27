"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Chrome, SquareM } from 'lucide-react'; // Changed SquareMicrosoft to SquareM
import { Provider } from '@supabase/supabase-js'; // Import Provider type

interface SocialAuthButtonsProps {
  onAuthSuccess: () => void;
}

const SocialAuthButtons = ({ onAuthSuccess }: SocialAuthButtonsProps) => {
  const handleSocialLogin = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/', // Redirect to home after login
        },
      });

      if (error) {
        toast.error(`Error signing in with ${provider}: ${error.message}`);
      } else {
        onAuthSuccess();
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('google')}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Chrome className="h-5 w-5" />
        Sign up with Google
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('azure')} {/* Changed 'microsoft' to 'azure' */}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <SquareM className="h-5 w-5" /> {/* Changed to SquareM */}
        Sign up with Microsoft
      </Button>
    </div>
  );
};

export default SocialAuthButtons;