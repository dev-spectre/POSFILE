import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/posStore';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useStore();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send identifier as email, restaurantName, AND adminUsername to backend
      // for universal login support and to satisfy backend validation
      const res = await authAPI.login({ 
        email: identifier,
        restaurantName: identifier,
        adminUsername: identifier,
        password 
      });
      
      setAuth(res.data.token, res.data.restaurant);
      toast({
        title: "Welcome Back",
        description: `Logged in as ${res.data.restaurant.restaurantName}`,
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.error || "Invalid credentials",
        variant: "destructive",
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 mb-6 -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Zap size={40} className="fill-white/20" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">Fast Billing</h1>
            <p className="text-slate-500 font-medium text-center">Your restaurant's command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email / Username / Restaurant</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                  placeholder="admin@restaurant.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <>Login <ArrowRight size={20} /></>
              )}
            </Button>

            <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 font-medium">
                New to Fast Billing?{' '}
                <Link to="/signup" className="text-orange-500 font-black hover:underline underline-offset-4">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Powered by Fast Billing Engine &bull; v2.4.0
        </p>
      </motion.div>
    </div>
  );
}
