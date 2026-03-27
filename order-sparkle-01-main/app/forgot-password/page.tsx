"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Mock API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      toast({ title: "Email Sent", description: "Password reset instructions have been sent to your email." });
    } catch (error: any) {
      toast({ 
        title: "Request Failed", 
        description: "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12 border border-white/20">
          <div className="mb-10 flex flex-col items-center">
             <Link href="/login" className="self-start mb-6 p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 font-bold text-sm">
               <ArrowLeft size={18} /> Back to Login
             </Link>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 mb-6 -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Mail size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-slate-500 font-medium text-center">Enter your email and we'll send you instructions.</p>
          </div>

          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-slate-500 mb-8">We have sent password recovery instructions to {email}.</p>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold"
              >
                Back to Login
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Account Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                    placeholder="admin@restaurant.com"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                  <>Send Instructions <Send size={18} /></>
                )}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
