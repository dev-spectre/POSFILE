"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/posStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { salesAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShoppingCart, BarChart3, Settings, PlusCircle, TrendingUp, DollarSign, Zap, LogOut, LayoutDashboard, ChevronRight, Activity } from 'lucide-react';
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function Dashboard() {
  const router = useRouter();
  const { restaurant, isAuthenticated, logout } = useStore();
  const [dailySales, setDailySales] = useState<any>(null);
  const [weeklySales, setWeeklySales] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daily, weekly] = await Promise.all([
          salesAPI.getDailySales(new Date().toISOString()),
          salesAPI.getWeeklySales(),
        ]);
        setDailySales(daily.data);
        setWeeklySales(weekly.data);
      } catch (error) {
        console.error('Failed to fetch sales data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, router]);

  const stats = [
    {
      title: 'Today\'s Revenue',
      value: `₹${dailySales?.dailyTotal != null ? (Number.isInteger(dailySales.dailyTotal) ? dailySales.dailyTotal : dailySales.dailyTotal.toFixed(2)) : 0}`,
      trend: '+12.5%',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Orders',
      value: dailySales?.orderCount || 0,
      trend: '+8.2%',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Weekly Sales',
      value: `₹${weeklySales?.weeklyTotal || 0}`,
      trend: '+15.3%',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-purple-500',
    },
  ];

  const quickActions = [
    {
      title: 'Fast Billing',
      desc: 'Launch billing interface',
      icon: <Zap className="h-6 w-6" />,
      path: '/pos',
      color: 'text-orange-500 bg-orange-500/10',
    },
    {
      title: 'Menu Manager',
      desc: 'Update items & pricing',
      icon: <PlusCircle className="h-6 w-6" />,
      path: '/menu',
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Sales Reports',
      desc: 'Deep dive into analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      path: '/sales',
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Store Settings',
      desc: 'Restaurant profile & staff',
      icon: <Settings className="h-6 w-6" />,
      path: '#',
      color: 'text-slate-500 bg-slate-500/10',
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="h-6 w-6 text-white fill-white/20" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">OrderSparkle</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl font-bold transition-all">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </button>
          {quickActions.map((action, i) => (
            <button 
              key={i} 
              onClick={() => action.path !== '#' && router.push(action.path)}
              className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-semibold transition-all"
            >
              {action.icon} {action.title}
            </button>
          ))}
        </nav>

        <button 
           onClick={handleLogout}
           className="mt-auto flex items-center gap-4 px-4 py-4 text-slate-400 hover:text-red-500 font-bold transition-all"
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 p-6 sm:p-10 lg:p-14">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Hello, <span className="text-orange-500">{restaurant?.restaurantName}</span>! 👋
            </h1>
            <p className="text-slate-500 font-medium">Here's what's happening in your restaurant today.</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
             <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
               <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
             </div>
             {/* Mobile Logout Button (Visible only on md screens and below) */}
             <button 
               onClick={handleLogout}
               className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex lg:hidden items-center justify-center shadow-sm text-red-500"
             >
               <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
             </button>
             <Button onClick={() => router.push('/pos')} className="pos-btn-primary h-12 sm:h-14 px-6 sm:px-8 shadow-orange-500/20 text-sm sm:text-base flex-1 sm:flex-none">
               Go to POS <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
             </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 pos-card border-none bg-white dark:bg-slate-900">
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
      </ProtectedRoute>
  );
}
