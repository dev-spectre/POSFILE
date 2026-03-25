import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/posStore';
import { menuAPI, orderAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Zap } from 'lucide-react';
import { MenuItem } from '@/store/posStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Combos', 'Other'];

export default function POSPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, cart, addToCart, removeFromCart, updateQuantity, clearCart, discount, setDiscount, getSubtotal, getTax, getTotal } = useStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash' | 'wallet'>('cash');
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMenu = async () => {
      try {
        const response = await menuAPI.getItems();
        setMenuItems(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].category);
        }
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
  }, [isAuthenticated, navigate, toast]);

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  const handleCheckout = async () => {
    if (!customerPhone) {
      toast({
        title: 'Error',
        description: 'Please enter customer phone number',
        variant: 'destructive',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Cart is empty',
        variant: 'destructive',
      });
      return;
    }

    setProcessingPayment(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
        customerPhone,
        customerName: customerName || 'Guest',
        paymentMethod,
        discount,
      };

      const response = await orderAPI.createOrder(orderData);
      const order = response.data.order;

      if (paymentMethod === 'upi') {
        // Handle Razorpay payment
        const options = {
          key: response.data.razorpayKeyId,
          order_id: response.data.razorpayOrderId,
          amount: order.totalAmount * 100,
          currency: 'INR',
          name: 'OrderSparkle',
          description: `Order ${order.orderId}`,
          prefill: {
            contact: customerPhone,
            name: customerName,
          },
          handler: async (response: any) => {
            try {
              await orderAPI.verifyPayment({
                orderId: order.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              toast({
                title: 'Success',
                description: `Order ${order.orderId} confirmed!`,
              });

              clearCart();
              setCustomerPhone('');
              setCustomerName('');
              setShowPayment(false);
            } catch (error) {
              toast({
                title: 'Error',
                description: 'Payment verification failed',
                variant: 'destructive',
              });
            }
          },
        };

        // @ts-ignore
        if (window.Razorpay) {
          // @ts-ignore
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } else {
        // Cash or Card - mark as paid
        await orderAPI.markAsPaid(order.orderId);

        toast({
          title: 'Success',
          description: `Order ${order.orderId} created!`,
        });

        clearCart();
        setCustomerPhone('');
        setCustomerName('');
        setShowPayment(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Menu Items Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200 hover:border-blue-500">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                          {item.discountPercentage! > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                              -{item.discountPercentage!}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 line-through">₹{item.price}</p>
                            <p className="text-xl font-bold text-blue-600">₹{item.finalPrice}</p>
                          </div>
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Cart Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 shadow-lg sticky top-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              <ShoppingCart className="h-6 w-6 text-blue-500" />
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.finalPrice}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item._id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount */}
                <div className="border-t pt-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (₹)
                  </label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="border-gray-300"
                  />
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%):</span>
                    <span className="font-semibold">₹{getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-600">
                    <span>Total:</span>
                    <span>₹{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg"
                >
                  Proceed to Payment
                </Button>
              </>
            )}

            {/* Clear Cart */}
            {cart.length > 0 && (
              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full mt-2"
              >
                Clear Cart
              </Button>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-md p-6">
              <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI (Razorpay)</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-blue-600">₹{getTotal().toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowPayment(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={processingPayment}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {processingPayment ? 'Processing...' : 'Confirm Order'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
