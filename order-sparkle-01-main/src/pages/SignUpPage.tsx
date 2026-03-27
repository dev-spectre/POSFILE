import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Building2, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { authAPI } from '@/lib/api';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    adminUsername: '',
    adminEmail: '',
    password: '',
    phoneNumber: '',
    address: '',
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { restaurantName, adminUsername, adminEmail, password, phoneNumber, address } = formData;

    if (!restaurantName || !adminUsername || !adminEmail || !password || !phoneNumber || !address) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (!validateEmail(adminEmail)) {
      toast({ title: "Error", description: "Invalid email format", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(formData);
      setSuccess(true);
      toast({ title: "Account Created", description: "Your restaurant has been registered successfully." });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      toast({ 
        title: "Registration Failed", 
        description: error.response?.data?.error || "Something went wrong. Please try again.", 
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
        className="w-full max-w-2xl"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12 border border-white/20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Building2 size={40} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">Fast Billing</h1>
            <p className="text-slate-500 font-medium">Register your restaurant to get started.</p>
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
              <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
              <p className="text-slate-500">Redirecting to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Details */}
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Restaurant Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        required
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                        placeholder="e.g. Spice Garden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                        placeholder="9XXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                        placeholder="e.g. 123 Food Street, City"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Details */}
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Admin Username</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        required
                        value={formData.adminUsername}
                        onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                        placeholder="e.g. rahul_admin"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        type="email"
                        required
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                        placeholder="admin@restaurant.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 ml-1 font-medium italic">Min. 6 characters required</p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                  <>Complete Registration <ArrowRight size={20} /></>
                )}
              </Button>

              <div className="text-center mt-8">
                <p className="text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link to="/login" className="text-orange-500 font-black hover:underline underline-offset-4">
                    Login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
        
        <p className="text-center mt-8 text-white/60 text-sm font-medium">
          &copy; 2026 Fast Billing POS System. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
