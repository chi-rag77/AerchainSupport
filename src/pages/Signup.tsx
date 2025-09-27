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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Logo from '@/components/Logo';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/hooks/use-theme'; // Import ThemeProvider

const formSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  workEmail: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the Terms and Privacy Policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const { session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      role: "",
      agreeToTerms: false,
    },
  });

  const { register, handleSubmit, watch, formState: { errors }, setError } = form;
  const password = watch("password");

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.workEmail,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            company_name: values.companyName,
            role: values.role,
          },
          emailRedirectTo: window.location.origin + '/', // Redirect to home after email confirmation
        },
      });

      if (error) {
        toast.error(`Sign up failed: ${error.message}`);
        if (error.message.includes("User already registered")) {
          setError("workEmail", { type: "manual", message: "This email is already registered. Please sign in." });
        }
      } else if (data.user) {
        toast.success("Account created successfully! Please check your email to verify your account.");
        navigate('/login'); // Redirect to login to await email verification
      } else {
        toast.info("Sign up initiated. Please check your email for verification.");
        navigate('/login');
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
          {/* Left Section: Visuals */}
          <div className="relative lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
              {/* Abstract shapes for visual appeal */}
              <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse-fast"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse-medium"></div>
            </div>
            <div className="relative z-10 text-center max-w-md">
              <Logo className="h-16 w-auto mx-auto mb-6 text-white fill-current" />
              <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                Unlock Intelligent Support Management
              </h1>
              <p className="text-lg opacity-90">
                Streamline your customer service with AI-powered insights and seamless Freshdesk integration.
              </p>
            </div>
          </div>

          {/* Right Section: Sign-up Form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-xl border border-border">
              <div className="flex flex-col items-center mb-8">
                <Logo className="h-10 w-auto mb-4" />
                <h2 className="text-3xl font-bold text-center text-card-foreground">Create Your Account</h2>
                <p className="text-sm text-muted-foreground mt-2">Start your journey to smarter support.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        {...register("fullName")}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter your full legal name.</TooltipContent>
                  </Tooltip>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="workEmail">Work Email</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="workEmail"
                        type="email"
                        placeholder="you@company.com"
                        {...register("workEmail")}
                        className={errors.workEmail ? "border-red-500" : ""}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Use your professional email address.</TooltipContent>
                  </Tooltip>
                  {errors.workEmail && <p className="text-red-500 text-xs mt-1">{errors.workEmail.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className={errors.password ? "border-red-500" : ""}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      Password must be at least 8 characters, include uppercase, lowercase, number, and special character.
                    </TooltipContent>
                  </Tooltip>
                  <PasswordStrengthIndicator password={password} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Re-enter your password to confirm.</TooltipContent>
                  </Tooltip>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="companyName"
                        placeholder="Acme Corp"
                        {...register("companyName")}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Your company's name.</TooltipContent>
                  </Tooltip>
                </div>

                <div>
                  <Label htmlFor="role">Role (Optional)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="role"
                        placeholder="Support Manager"
                        {...register("role")}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Your role within the company.</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="agreeToTerms" {...register("agreeToTerms")} />
                  <label
                    htmlFor="agreeToTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link to="/terms" className="underline text-primary hover:text-primary/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="underline text-primary hover:text-primary/80">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms.message}</p>}

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
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <Separator className="my-8" />

              <SocialAuthButtons onAuthSuccess={handleAuthSuccess} />

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default Signup;