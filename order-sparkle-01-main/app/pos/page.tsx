"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/posStore';
import { menuAPI, orderAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Zap, ArrowLeft, CheckCircle2, Phone, User, CreditCard, Banknote, Wallet, QrCode } from 'lucide-react';
import { MenuItem } from '@/store/posStore';
import { getFoodImage } from '@/lib/imageHelper';
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const CATEGORIES = ['All', 'Pizza', 'Burger', 'Beverages', 'Desserts', 'South Indian', 'Main Course', 'Appetizers', 'Fresh Juice', 'Combos', 'Other'];

export default function POSPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    isAuthenticated, cart, addToCart, removeFromCart, updateQuantity, 
    clearCart, discount, setDiscount, getSubtotal, getTax, getTotal 
  } = useStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash' | 'wallet'>('cash');
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await menuAPI.getItems();
        setMenuItems(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load menu items',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [toast]);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  const handleCheckout = async () => {
    if (!customerPhone) {
      toast({ title: 'Phone Required', description: 'Please enter customer phone number', variant: 'destructive' });
      return;
    }

    setProcessingPayment(true);
    try {
      const orderData = {
        items: cart.map((item) => ({ menuItemId: item.id || item._id, quantity: item.quantity })),
        customerPhone,
        customerName: customerName || 'Guest',
        paymentMethod,
        discount,
      };

      const response = await orderAPI.createOrder(orderData);
      const order = response.data.order;

      if (paymentMethod === 'upi') {
        // Handle Razorpay (Mock logic or actual integration)
        const options = {
          key: response.data.razorpayKeyId,
          order_id: response.data.razorpayOrderId,
          amount: order.totalAmount * 100,
          currency: 'INR',
          name: 'Fast Billing',
          handler: async (res: any) => {
            await orderAPI.verifyPayment({
              orderId: order.orderId,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
            });
            finalizeOrder(order);
          },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await orderAPI.markAsPaid(order.orderId);
        finalizeOrder(order);

        if (paymentMethod === 'cash' && customerPhone) {
          window.open(generateWhatsAppLink(order, cart, customerPhone, order.totalAmount), '_blank');
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to create order', variant: 'destructive' });
    } finally {
      setProcessingPayment(false);
    }
  };

  const finalizeOrder = (order: any) => {
    setCompletedOrder({ order, items: [...cart], customerPhone, total: order.totalAmount, customerName });
    setShowSuccessModal(true);
    setShowPayment(false);
  };

  const generateWhatsAppLink = (orderInfo: any, cartItems: any[], phone: string, totalAmount: number) => {
    let text = `*✨ Fast Billing Receipt ✨*\n\nOrder ID: #${orderInfo.orderId}\n`;
    cartItems.forEach((item: any) => {
      text += `• ${item.quantity}x ${item.name} - ₹${(item.finalPrice * item.quantity).toFixed(2)}\n`;
    });
    text += `\n*Total Paid: ₹${totalAmount.toFixed(2)}*\n\nThank you for your visit! 🍽️`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const sendWhatsAppBill = () => {
    if (!completedOrder) return;
    const { order, items, customerPhone, total } = completedOrder;
    window.open(generateWhatsAppLink(order, items, customerPhone, total), '_blank');
  };

  const handleNewOrder = () => {
    clearCart();
    setCustomerPhone('');
    setCustomerName('');
    setDiscount(0);
    setShowSuccessModal(false);
    setCompletedOrder(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="rounded-full h-10 w-10 p-0 hidden sm:flex">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-lg font-bold tracking-tight">Fast Billing</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight">Counter #01 • Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-orange-500">Live Status</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Synchronized</span>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-orange-500 fill-orange-500/20" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden lg:max-h-[calc(100vh-5rem)]">
        {/* Left: Menu Side */}
        <section className="flex-1 flex flex-col p-4 sm:p-8 lg:overflow-y-auto scrollbar-thin">
          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-chip ${selectedCategory === cat ? 'category-chip-active' : 'category-chip-inactive'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
              <p className="font-bold text-slate-400">Loading your menu...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={(item.id || item._id) || `item-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    onClick={() => addToCart(item)}
                    className="group cursor-pointer overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-2xl transition-all duration-500 ring-1 ring-slate-100 dark:ring-slate-800"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img 
                        src={item.image || getFoodImage(item.name, item.category)} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={item.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.discountPercentage! > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                          -{item.discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-through">₹{item.price}</p>
                        <p className="text-xl font-black text-orange-600">₹{item.finalPrice}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Popular Choice</span>
                        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                        <div className="h-7 w-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 transition-transform">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Right: Cart Side */}
        <aside className="w-full lg:w-[420px] bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col relative z-20 lg:shadow-2xl lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)]">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" /> Current Order
            </h2>
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">{cart.length} Items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[50vh] lg:max-h-full">
            {cart.length === 0 ? (
              <div className="h-40 lg:h-full flex flex-col items-center justify-center text-center opacity-30">
                <div className="h-16 w-16 lg:h-20 lg:w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <p className="font-bold">Cart is empty</p>
                <p className="text-xs mt-1">Add items to start billing</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id || item._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 items-center group"
                  >
                    <div className="h-16 w-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                      <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm truncate pr-2">{item.name}</h4>
                        <button onClick={() => removeFromCart((item.id || item._id)!)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                          <button onClick={() => updateQuantity((item.id || item._id)!, item.quantity - 1)} className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm flex items-center justify-center transition-all"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity((item.id || item._id)!, item.quantity + 1)} className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm flex items-center justify-center transition-all"><Plus className="h-3 w-3" /></button>
                        </div>
                        <span className="font-bold text-sm">₹{(item.finalPrice * item.quantity).toFixed(0)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Tax (5.0%)</span>
                <span>₹{getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Add Discount</span>
                <input 
                  type="number" 
                  value={discount || ''} 
                  placeholder="₹0"
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-16 sm:w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-right font-black text-orange-600 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                <span className="text-base sm:text-lg font-black uppercase tracking-tight">Total Payable</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{getTotal().toFixed(0)}</span>
              </div>
            </div>

            <Button
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
              className="pos-btn-primary w-full h-14 sm:h-16 text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-orange-500/20"
            >
              Checkout Now <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            </Button>
            <Button variant="ghost" className="w-full text-slate-400 hover:text-red-500 text-sm" onClick={clearCart}>Cancel Order</Button>
          </div>
        </aside>
      </main>

      {/* Modern Payment Drawer/Modal */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center sm:justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-[90vh] sm:h-full bg-white dark:bg-slate-950 shadow-2xl p-6 sm:p-12 overflow-y-auto rounded-t-3xl sm:rounded-none mt-auto sm:mt-0"
            >
              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Payment Details</h2>
              <p className="text-slate-500 mb-6 sm:mb-10 font-medium text-sm sm:text-base">Almost there! Finalize your customer's order.</p>

              <div className="space-y-8">
                {/* Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User className="h-3 w-3" /> Customer Name
                    </label>
                    <input 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="input-premium w-full px-5 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Phone className="h-3 w-3 text-orange-500" /> WhatsApp Number *
                    </label>
                    <input 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="9XXXXXXXXX"
                      className="input-premium w-full px-5 outline-none border-orange-500/30 bg-orange-50/10"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Channel</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'cash', icon: <Banknote className="h-5 w-5" />, label: 'Cash' },
                      { id: 'card', icon: <CreditCard className="h-5 w-5" />, label: 'Card' },
                      { id: 'upi', icon: <QrCode className="h-5 w-5" />, label: 'UPI' },
                      { id: 'wallet', icon: <Wallet className="h-5 w-5" />, label: 'Wallet' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                          paymentMethod === method.id 
                            ? 'border-orange-500 bg-orange-50/20 text-orange-600 shadow-lg shadow-orange-500/10' 
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {method.icon}
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">Total Payable</span>
                    <span className="text-5xl font-black tracking-tighter">₹{getTotal().toFixed(0)}</span>
                  </div>
                  <Button 
                    onClick={handleCheckout} 
                    disabled={processingPayment}
                    className="pos-btn-primary h-16 text-xl shadow-orange-500/30"
                  >
                    {processingPayment ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowPayment(false)} className="text-slate-400">Go Back</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Animation Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 text-center shadow-2xl"
            >
              <div className="h-24 w-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tighter">Transaction Success!</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Order <span className="text-slate-900 dark:text-white font-black">#{completedOrder?.order.orderId}</span> has been processed successfully.
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={sendWhatsAppBill} 
                  className="w-full h-14 bg-[#25D366] hover:bg-[#1fb355] text-white rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-xl shadow-green-500/10"
                >
                  <QrCode className="h-5 w-5" /> WhatsApp Digital Bill
                </Button>
                <Button 
                   onClick={handleNewOrder}
                   className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg"
                >
                  Start Next Order
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
      </ProtectedRoute>
  );
}
