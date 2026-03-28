"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/posStore';
import { salesAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { ArrowLeft, Loader2, TrendingUp, BarChart3 } from 'lucide-react';

export default function SalesPage() {
  const router = useRouter();
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
    fetchSalesData();
  }, []);

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
      toast({ title: 'Error', description: 'Failed to load sales data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#ef4444'];

  const renderCurrentStats = () => {
    const data = timeframe === 'daily' ? dailySales : timeframe === 'weekly' ? weeklySales : monthlySales;
    const total = timeframe === 'daily' ? data?.dailyTotal : timeframe === 'weekly' ? data?.weeklyTotal : data?.monthlyTotal;
    const count = timeframe === 'daily' ? data?.orderCount : timeframe === 'weekly' ? data?.weeklyOrderCount : data?.monthlyOrderCount;
    const totalRounded = fmt(total);
    
    return (
    <ProtectedRoute>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <Card className="p-6 sm:p-8 pos-card border-none bg-white dark:bg-slate-900 group">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Revenue</p>
          <p className="text-4xl font-black tracking-tighter text-orange-600">₹{totalRounded || 0}</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <TrendingUp className="h-4 w-4" /> +12.5% vs last week
          </div>
        </Card>
        <Card className="p-6 sm:p-8 pos-card border-none bg-white dark:bg-slate-900">
           <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Order Volume</p>
           <p className="text-4xl font-black tracking-tighter">{count || 0}</p>
           <p className="mt-4 text-xs text-slate-500 font-bold italic">Completed transactions</p>
        </Card>
      </div>
        </ProtectedRoute>
  );
  };

  // Helper: always show up to 2 decimal places, dropping trailing zeros
  const fmt = (n: number) => parseFloat((n || 0).toFixed(2));

  const currentData = timeframe === 'daily' ? dailySales : timeframe === 'weekly' ? weeklySales : monthlySales;
  const upiAmountRounded = fmt(currentData?.paymentSummary?.upi);
  const cashAmountRounded = fmt(currentData?.paymentSummary?.cash);
  const cardAmountRounded = fmt(currentData?.paymentSummary?.card);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => router.push('/dashboard')} className="rounded-full h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800">
               <ArrowLeft className="h-6 w-6" />
             </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Sales Lab</h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">Deep insights into your restaurant's pulse.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center opacity-30">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="font-bold">Aggregating big data...</p>
          </div>
        ) : (
          <>
            {renderCurrentStats()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">

              <Card className="p-6 sm:p-8 pos-card border-none bg-white dark:bg-slate-900">
                <h3 className="text-xl font-black tracking-tight mb-6 sm:mb-8">Payment Mix</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'UPI', value: upiAmountRounded || 0 },
                          { name: 'Cash', value: cashAmountRounded || 0 },
                          { name: 'Card', value: cardAmountRounded || 0 },
                        ]}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-4">
                   {['UPI', 'Cash', 'Card'].map((p, i) => (
                     <div key={p} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                         <span className="text-xs font-bold text-slate-500">{p}</span>
                       </div>
                        <span className="text-xs font-black">₹{fmt(currentData?.paymentSummary?.[p.toLowerCase()])}</span>
                     </div>
                   ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 auto-rows-max">
               <Card className="p-6 sm:p-8 pos-card border-none bg-white dark:bg-slate-900">
                  <h3 className="text-xl font-black tracking-tight mb-6 sm:mb-8">Top Performer Items</h3>
                  <div className="space-y-4">
                     {topItems.slice(0, 5).map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-orange-50 transition-colors">
                         <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-orange-500 shadow-sm border border-slate-100 dark:border-slate-700">
                             #{i+1}
                           </div>
                           <div>
                             <p className="font-black text-sm">{item.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.quantity} units sold</p>
                           </div>
                         </div>
                         <div className="text-right">
                            <p className="font-black text-orange-600">₹{fmt(item.revenue)}</p>
                           <p className="text-[10px] text-emerald-500 font-bold uppercase">Trending</p>
                         </div>
                       </div>
                     ))}
                  </div>
               </Card>

               <Card className="p-6 sm:p-8 pos-card border-none bg-white dark:bg-slate-900">
                 <div className="flex items-center justify-between mb-6 sm:mb-8">
                   <h3 className="text-xl font-black tracking-tight">Category Distribution</h3>
                   <BarChart3 className="h-5 w-5 text-slate-300" />
                 </div>
                 <div className="space-y-6">
                    {categorySales.map((cat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="text-slate-500">{cat.category}</span>
                           <span className="text-orange-600">₹{fmt(cat.revenue)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.revenue / (categorySales[0]?.revenue || 1)) * 100}%` }}
                            className="h-full bg-orange-500 rounded-full" 
                          />
                        </div>
                      </div>
                    ))}
                 </div>
               </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
