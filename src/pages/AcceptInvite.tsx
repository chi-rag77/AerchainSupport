"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Sparkles, ShieldCheck, ArrowRight, 
  Loader2, Lock, User, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from "@/components/ui/card";
import Logo from '@/components/Logo';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { toast } from 'sonner';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid invitation link. Please check your email.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await invokeEdgeFunction<any>('get-invitation-details', {
          body: { token }
        });
        setInvitation(data);
      } catch (err: any) {
        setError(err.message || "This invitation is invalid or has expired.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await invokeEdgeFunction('accept-invitation', {
        body: { token, password, display_name: displayName }
      });

      toast.success("Welcome to Aerchain! Your account is ready.");
      navigate('/');
    } catch (err: any) {
      toast.error(`Failed to create account: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-black uppercase tracking-widest text-muted-foreground">Verifying Invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 p-6">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-gray-900">
          <div className="p-8 text-center space-y-6">
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 inline-block">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Invitation Error</h2>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{error}</p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold">
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-gray-950 font-sans">
      {/* Left: Brand Experience */}
      <div className="relative lg:w-[40%] hidden lg:flex flex-col items-center justify-center p-16 bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        <div className="relative z-10 w-full max-w-lg space-y-12">
          <Logo className="h-12 w-auto text-white fill-current mb-12" />
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-white leading-[1.1]">
              Join the Team
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-tight">
              You've been invited to join <span className="text-white font-bold">Aerchain Support</span> as a <span className="text-indigo-400 font-bold capitalize">{invitation.role}</span>.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: ShieldCheck, text: "Secure enterprise-grade access." },
              { icon: Sparkles, text: "AI-powered support intelligence." },
              { icon: CheckCircle2, text: "Collaborative ticket resolution." }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <item.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-slate-300 font-semibold tracking-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Setup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[440px]"
        >
          <div className="p-10 rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl border border-white/20 dark:border-slate-800">
            <div className="flex flex-col items-center mb-10">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 mb-6">
                <Logo className="h-8 w-auto" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-center">Create Account</h2>
              <p className="text-sm text-muted-foreground font-medium mt-2">Complete your profile to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-none shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-none shadow-inner"
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-none shadow-inner"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Account"}
                {!isSubmitting && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AcceptInvite;