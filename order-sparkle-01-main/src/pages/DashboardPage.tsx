import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/posStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { salesAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShoppingCart, BarChart3, Settings, PlusCircle, TrendingUp, DollarSign, Zap, LogOut, LayoutDashboard, ChevronRight, Activity } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
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
  }, [isAuthenticated, navigate]);

  const stats = [
    {
      title: 'Today\'s Revenue',
      value: `₹${dailySales?.dailyTotal || 0}`,
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
    {
      title: 'Active Tables',
      value: '14/20',
      trend: 'Peak',
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-emerald-500',
    },
  ];

  const quickActions = [
    {
      title: 'POS Terminal',
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
    navigate('/login');
  };

  return (
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
              onClick={() => action.path !== '#' && navigate(action.path)}
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Hello, <span className="text-orange-500">{restaurant?.restaurantName}</span>! 👋
            </h1>
            <p className="text-slate-500 font-medium">Here's what's happening in your restaurant today.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
               <Settings className="h-6 w-6 text-slate-400" />
             </div>
             <Button onClick={() => navigate('/pos')} className="pos-btn-primary h-14 px-8 shadow-orange-500/20">
               Go to POS <ChevronRight className="h-5 w-5 ml-2" />
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

        {/* Main Analytics Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <Card className="xl:col-span-2 p-8 pos-card border-none bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black tracking-tight">Revenue Analytics</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Weekly Progression</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold transition-all">Today</button>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20">7 Days</button>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'Mon', sales: 4000 },
                  { day: 'Tue', sales: 3000 },
                  { day: 'Wed', sales: 2000 },
                  { day: 'Thu', sales: 2780 },
                  { day: 'Fri', sales: 1890 },
                  { day: 'Sat', sales: 2390 },
                  { day: 'Sun', sales: 3490 },
                ]}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f080" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#f97316" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Side Module: Quick Actions */}
          <div className="space-y-6">
            <Card className="p-8 pos-card border-none bg-orange-600 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4">Fast Billing</h3>
                <p className="text-orange-100 text-sm font-medium mb-8 leading-relaxed">
                  Ready to serve? Skip the noise and jump straight to the POS terminal.
                </p>
                <Button 
                   onClick={() => navigate('/pos')}
                   className="w-full h-14 bg-white text-orange-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
                >
                  Start Billing <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-[40px] group-hover:bg-white/20 transition-all duration-700" />
            </Card>

            <Card className="p-8 pos-card border-none bg-white dark:bg-slate-900">
               <h3 className="text-lg font-black tracking-tight mb-6">Recent Activities</h3>
               <div className="space-y-6">
                 {[1, 2, 3].map((_, i) => (
                   <div key={i} className="flex gap-4 items-center">
                     <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                       <ShoppingCart className="h-5 w-5 text-slate-400" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold truncate">New Order #8821</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">2 mins ago • ₹450</p>
                     </div>
                   </div>
                 ))}
               </div>
               <Button variant="ghost" className="w-full mt-6 text-orange-500 font-black text-xs uppercase tracking-widest">View All Transaction History</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
