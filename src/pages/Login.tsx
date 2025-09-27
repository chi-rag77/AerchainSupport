"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Logo from '@/components/Logo';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/hooks/use-theme';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, setError } = form;

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(`Login failed: ${error.message}`);
        setError("password", { type: "manual", message: error.message });
      } else {
        toast.success("Logged in successfully!");
        // SupabaseProvider handles navigation to '/' on successful sign-in
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    // This function is called after social login redirects,
    // the SupabaseProvider will handle the navigation to '/'
    toast.success("Successfully signed in!");
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
          {/* Left Section: Visuals (similar to Signup page) */}
          <div className="relative lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse-fast"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse-medium"></div>
            </div>
            <div className="relative z-10 text-center max-w-md">
              <Logo className="h-16 w-auto mx-auto mb-6 text-white fill-current" />
              <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                Welcome Back to Intelligent Support
              </h1>
              <p className="text-lg opacity-90">
                Access your dashboard and manage customer support tickets with ease.
              </p>
            </div>
          </div>

          {/* Right Section: Login Form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-xl border border-border">
              <div className="flex flex-col items-center mb-8">
                <Logo className="h-10 w-auto mb-4" />
                <h2 className="text-3xl font-bold text-center text-card-foreground">Sign In to Your Account</h2>
                <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access your dashboard.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  Forgot your password?
                </Link>
              </div>

              <Separator className="my-8" />

              <SocialAuthButtons onAuthSuccess={handleAuthSuccess} />

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default Login;