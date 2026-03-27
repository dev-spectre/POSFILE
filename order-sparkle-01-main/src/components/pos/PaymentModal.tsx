import { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/posStore';

type PaymentMethod = 'upi' | 'card' | 'cash' | 'wallet';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Cash', icon: <Banknote size={24} /> },
  { id: 'upi', label: 'UPI', icon: <Smartphone size={24} /> },
  { id: 'card', label: 'Card', icon: <CreditCard size={24} /> },
];

const PaymentModal = ({ open, onClose }: PaymentModalProps) => {
  const { cart, getTotal, clearCart } = useStore();
  const [selected, setSelected] = useState<any | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paid, setPaid] = useState(false);
  const total = getTotal();

  const handlePay = () => {
    if (!selected) return;
    
    if (selected === 'cash' && customerPhone) {
      const orderId = Math.floor(100000 + Math.random() * 900000);
      let text = `*✨ Fast Billing Receipt ✨*\n\nOrder ID: #${orderId}\n`;
      cart.forEach((item: any) => {
        text += `• ${item.quantity}x ${item.name} - ₹${(item.finalPrice * item.quantity).toFixed(2)}\n`;
      });
      text += `\n*Total Paid: ₹${total.toFixed(2)}*\n\nThank you for your visit! 🍽️`;
      window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }

    setPaid(true);
    setTimeout(() => {
      clearCart();
      setPaid(false);
      setSelected(null);
      setCustomerPhone('');
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (paid) return;
    setSelected(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md p-6"
          >
            {paid ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8 gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                >
                  <CheckCircle2 size={64} className="text-pos-success" />
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-foreground">Payment Successful!</h3>
                <p className="text-muted-foreground text-sm">Order has been processed</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">Complete Payment</h3>
                  <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-display text-4xl font-bold text-primary">₹{total.toFixed(2)}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp Number</p>
                  <input
                    type="tel"
                    placeholder="Enter customer number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <motion.button
                        key={method.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelected(method.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          selected === method.id
                            ? 'border-primary bg-accent text-primary'
                            : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {method.icon}
                        <span className="text-sm font-medium">{method.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePay}
                  disabled={!selected}
                  className="pos-btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Payment
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
