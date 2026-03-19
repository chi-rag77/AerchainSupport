"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Logo from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/hooks/use-theme';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

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
    
    const handleCapsLock = (e: KeyboardEvent) => {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handleCapsLock);
    return () => window.removeEventListener('keydown', handleCapsLock);
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
        toast.success("Welcome back!");
        navigate('/');
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground overflow-hidden font-sans">
          
          {/* Focus Mode Overlay */}
          <AnimatePresence>
            {isFocused && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/5 dark:bg-black/20 z-0 pointer-events-none backdrop-blur-[2px]"
              />
            )}
          </AnimatePresence>

          {/* Left Section: Brand Experience Canvas */}
          <div className="relative lg:w-[45%] hidden lg:flex flex-col items-center justify-center p-16 bg-[#0F172A] overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
              {/* Base Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
              
              {/* Floating Blobs */}
              <motion.div 
                animate={{ 
                  x: [0, 30, 0], 
                  y: [0, 50, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" 
              />
              <motion.div 
                animate={{ 
                  x: [0, -40, 0], 
                  y: [0, -30, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" 
              />

              {/* Light Flow Streak */}
              <motion.div 
                initial={{ x: '-100%', y: '-100%' }}
                animate={{ x: '200%', y: '200%' }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 blur-sm"
              />
            </div>

            <div className="relative z-10 w-full max-w-lg space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Logo className="h-12 w-auto text-white fill-current mb-12" />
                <div className="space-y-4">
                  <h1 className="text-5xl font-black tracking-tighter text-white leading-[1.1]">
                    Welcome Back
                  </h1>
                  <p className="text-xl text-slate-400 font-medium tracking-tight">
                    Intelligent Support, Simplified.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="grid grid-cols-1 gap-6"
              >
                {[
                  { icon: Zap, text: "Manage tickets with precision." },
                  { icon: Sparkles, text: "Resolve faster with AI insights." },
                  { icon: ShieldCheck, text: "Stay in control of your operations." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                      <item.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-slate-300 font-semibold tracking-tight">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-12 left-16 z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Aerchain Enterprise Intelligence
              </p>
            </div>
          </div>

          {/* Right Section: Login Form */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
            <div className="absolute top-8 right-8">
              <ThemeToggle />
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[440px]"
            >
              <div className={cn(
                "relative p-10 rounded-[32px] transition-all duration-500",
                "bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50",
                "shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
                isFocused && "shadow-[0_30px_70px_rgba(99,102,241,0.15)] border-indigo-500/20"
              )}>
                
                <div className="flex flex-col items-center mb-10">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 mb-6">
                    <Logo className="h-8 w-auto" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-center">Enter Workspace</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-2">Access your operational command center.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Work Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        {...register("email")}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={cn(
                          "h-12 pl-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-none shadow-inner transition-all duration-300",
                          "focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:scale-[1.01]",
                          errors.email && "ring-2 ring-red-500/50"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="password" title="Password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Security Key
                      </Label>
                      <Link to="/forgot-password" title="Reset access" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors">
                        Reset access
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={cn(
                          "h-12 pl-11 pr-12 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-none shadow-inner transition-all duration-300",
                          "focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:scale-[1.01]",
                          errors.password && "ring-2 ring-red-500/50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      {errors.password ? (
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
                          {errors.password.message}
                        </motion.p>
                      ) : <div />}
                      
                      {isCapsLockOn && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Caps Lock On</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "relative w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden",
                      "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white",
                      "shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <div className="relative h-4 w-4">
                            <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border-2 border-white border-t-transparent rounded-full"
                            />
                          </div>
                          Signing you in...
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Enter Workspace <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>

                <p className="text-center text-xs font-bold text-muted-foreground mt-10">
                  New to Aerchain?{" "}
                  <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 transition-colors underline underline-offset-4">
                    Create account
                  </Link>
                </p>
              </div>
              
              {/* Footer Links */}
              <div className="flex justify-center gap-6 mt-8">
                <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Privacy</a>
                <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Terms</a>
                <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Support</a>
              </div>
            </motion.div>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default Login;