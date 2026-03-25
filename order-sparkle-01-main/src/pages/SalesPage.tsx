import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/posStore';
import { salesAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function SalesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useStore();

  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dailySales, setDailySales] = useState<any>(null);
  const [weeklySales, setWeeklySales] = useState<any>(null);
  const [monthlySales, setMonthlySales] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchSalesData();
  }, [isAuthenticated, navigate]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [daily, weekly, monthly, topItemsData, categoryData] = await Promise.all([
        salesAPI.getDailySales(new Date().toISOString()),
        salesAPI.getWeeklySales(),
        salesAPI.getMonthlySales(new Date().getMonth() + 1, new Date().getFullYear()),
        salesAPI.getTopItems(30),
        salesAPI.getCategorySales(30),
      ]);

      setDailySales(daily.data);
      setWeeklySales(weekly.data);
      setMonthlySales(monthly.data);
      setTopItems(topItemsData.data || []);
      setCategorySales(categoryData.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sales data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  const renderSalesCharts = () => {
    if (timeframe === 'daily') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Daily Revenue</h3>
            <div className="text-4xl font-bold text-blue-600 mb-4">
              ₹{dailySales?.dailyTotal || 0}
            </div>
            <p className="text-gray-600">Orders: {dailySales?.orderCount || 0}</p>
          </Card>

          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Payment Methods Today</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'UPI', value: dailySales?.paymentSummary?.upi || 0 },
                    { name: 'Card', value: dailySales?.paymentSummary?.card || 0 },
                    { name: 'Cash', value: dailySales?.paymentSummary?.cash || 0 },
                    { name: 'Wallet', value: dailySales?.paymentSummary?.wallet || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      );
    }

    if (timeframe === 'weekly') {
      return (
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Weekly Sales</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">₹{weeklySales?.weeklyTotal || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-purple-600">{weeklySales?.weeklyOrderCount || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{weeklySales?.weeklyOrderCount > 0 ? (weeklySales?.weeklyTotal / weeklySales?.weeklyOrderCount).toFixed(0) : 0}
              </p>
            </div>
          </div>

          <h4 className="font-bold mb-4">Payment Methods (Week)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(weeklySales?.paymentSummary || {}).map(([key, value]) => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              value,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      );
    }

    return (
      <Card className="p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Monthly Sales</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-pink-600">₹{monthlySales?.monthlyTotal || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-orange-600">{monthlySales?.monthlyOrderCount || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-3xl font-bold text-cyan-600">
              ₹{monthlySales?.monthlyOrderCount > 0 ? (monthlySales?.monthlyTotal / monthlySales?.monthlyOrderCount).toFixed(0) : 0}
            </p>
          </div>
        </div>

        {monthlySales?.dailyData && (
          <>
            <h4 className="font-bold mb-4">Daily Trend (This Month)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(monthlySales.dailyData).map(([date, value]) => ({
                date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric' }),
                revenue: value,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales Analytics</h1>
            <p className="text-gray-600">Track your restaurant's performance</p>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setTimeframe('daily')}
              variant={timeframe === 'daily' ? 'default' : 'outline'}
              className={timeframe === 'daily' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              Daily
            </Button>
            <Button
              onClick={() => setTimeframe('weekly')}
              variant={timeframe === 'weekly' ? 'default' : 'outline'}
              className={timeframe === 'weekly' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              Weekly
            </Button>
            <Button
              onClick={() => setTimeframe('monthly')}
              variant={timeframe === 'monthly' ? 'default' : 'outline'}
              className={timeframe === 'monthly' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              Monthly
            </Button>
            <Button
              onClick={fetchSalesData}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Main Charts */}
          <motion.div
            key={timeframe}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {renderSalesCharts()}
          </motion.div>

          {/* Top Items & Category Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Top Selling Items (30 Days)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topItems.length === 0 ? (
                  <p className="text-gray-500">No data available</p>
                ) : (
                  topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{index + 1}. {item.name}</p>
                        <p className="text-sm text-gray-600">Revenue: ₹{item.revenue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{item.quantity}</p>
                        <p className="text-xs text-gray-600">items sold</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Category Sales */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Sales by Category (30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, revenue }) => `${category}: ₹${revenue}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {COLORS.map((color) => (
                      <Cell key={color} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {categorySales.length > 0 && (
                <div className="mt-4 space-y-2">
                  {categorySales.map((cat, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-gray-600">₹{cat.revenue} ({cat.orderCount} orders)</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
