import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/posStore';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    restaurantName: '',
    password: '',
  });

  // Register state
  const [registerData, setRegisterData] = useState({
    restaurantName: '',
    adminUsername: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        restaurantName: loginData.restaurantName,
        password: loginData.password,
      });

      const { token, restaurant } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('restaurant', JSON.stringify(restaurant));

      setAuth(token, restaurant);

      toast({
        title: 'Success',
        description: `Welcome back, ${restaurant.restaurantName}!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        restaurantName: registerData.restaurantName,
        adminUsername: registerData.adminUsername,
        adminEmail: registerData.adminEmail,
        password: registerData.password,
        phoneNumber: registerData.phoneNumber,
        address: registerData.address,
      });

      const { token, restaurant } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('restaurant', JSON.stringify(restaurant));

      setAuth(token, restaurant);

      toast({
        title: 'Success',
        description: 'Restaurant registered successfully!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Registration failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
          <div className="p-8">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">OrderSparkle</h1>
              <p className="text-white/80">Restaurant POS Management</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  isLogin
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  !isLogin
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Restaurant Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your restaurant name"
                    value={loginData.restaurantName}
                    onChange={(e) =>
                      setLoginData({ ...loginData, restaurantName: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* Register Form */}
            {!isLogin && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Restaurant Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Restaurant name"
                    value={registerData.restaurantName}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, restaurantName: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Admin username"
                    value={registerData.adminUsername}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, adminUsername: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@restaurant.com"
                    value={registerData.adminEmail}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, adminEmail: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={registerData.phoneNumber}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, phoneNumber: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Restaurant address"
                    value={registerData.address}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, address: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, confirmPassword: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
