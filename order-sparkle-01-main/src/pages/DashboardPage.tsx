import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/posStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { salesAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { ShoppingCart, BarChart3, Settings, PlusCircle, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { restaurant, isAuthenticated } = useStore();
  const [dailySales, setDailySales] = useState<any>(null);
  const [weeklySales, setWeeklySales] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

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
      title: 'Today\'s Sales',
      value: `₹${dailySales?.dailyTotal || 0}`,
      subtext: 'Total revenue',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Orders',
      value: dailySales?.orderCount || 0,
      subtext: 'Orders placed',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Weekly Revenue',
      value: `₹${weeklySales?.weeklyTotal || 0}`,
      subtext: '7 days revenue',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Avg Order Value',
      value: `₹${(dailySales?.dailyTotal || 0) / Math.max(dailySales?.orderCount || 1, 1)}`,
      subtext: 'Per order',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const quickActions = [
    {
      title: 'Start Billing',
      description: 'Create new order',
      icon: <ShoppingCart className="h-8 w-8" />,
      onClick: () => navigate('/pos'),
      color: 'from-blue-500 to-blue-600',
      delay: 0,
    },
    {
      title: 'Add Menu Items',
      description: 'Manage your menu',
      icon: <PlusCircle className="h-8 w-8" />,
      onClick: () => navigate('/menu'),
      color: 'from-purple-500 to-purple-600',
      delay: 0.1,
    },
    {
      title: 'View Analytics',
      description: 'Sales insights',
      icon: <BarChart3 className="h-8 w-8" />,
      onClick: () => navigate('/sales'),
      color: 'from-pink-500 to-pink-600',
      delay: 0.2,
    },
    {
      title: 'Settings',
      description: 'Configure restaurant',
      icon: <Settings className="h-8 w-8" />,
      onClick: () => {},
      color: 'from-green-500 to-green-600',
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-8 md:p-12"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Welcome, {restaurant?.restaurantName}!
          </h1>
          <p className="text-slate-400 text-lg">Manage your restaurant with powerful tools</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Quick Actions Section - TOP */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">⚡ Quick Actions</h2>
            <p className="text-slate-400">Access your most used features instantly</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: action.delay }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="cursor-pointer"
                onClick={action.onClick}
              >
                <Card className={`bg-gradient-to-br ${action.color} text-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-white/20 rounded-full p-4 mb-4 backdrop-blur-sm">
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard Analytics Section - BOTTOM */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">📊 Today's Performance</h2>
            <p className="text-slate-400">Real-time sales and order metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Card className={`bg-gradient-to-br ${stat.color} text-white p-6 shadow-xl border-0 rounded-2xl overflow-hidden relative group`}>
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                      <div className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm">
                        {stat.icon}
                      </div>
                    </div>
                    <p className="text-4xl font-bold mb-2">{stat.value}</p>
                    <p className="text-white/60 text-xs">{stat.subtext}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-800 border-slate-700 shadow-xl rounded-2xl p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">Sales Trend</h3>
                  <p className="text-slate-400 text-sm">Today's revenue progression</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[{ name: 'Today', sales: dailySales?.dailyTotal || 0 }]}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Payment Methods Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card className="bg-slate-800 border-slate-700 shadow-xl rounded-2xl p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">Payment Methods</h3>
                  <p className="text-slate-400 text-sm">Revenue by payment type</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'UPI', value: dailySales?.paymentSummary?.upi || 0 },
                        { name: 'Card', value: dailySales?.paymentSummary?.card || 0 },
                        { name: 'Cash', value: dailySales?.paymentSummary?.cash || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}` : ''}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
