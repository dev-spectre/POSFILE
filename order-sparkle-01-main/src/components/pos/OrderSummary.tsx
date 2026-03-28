"use client";

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/posStore';

interface OrderSummaryProps {
  onProceedToPay: () => void;
}

const OrderSummary = ({ onProceedToPay }: OrderSummaryProps) => {
  const { cart, updateQuantity, clearCart, getTotal } = useStore();
  const [tableNumber, setTableNumber] = useState('');

  const total = getTotal();

  const getItemTotal = (item: any) => item.finalPrice * item.quantity;

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={20} className="text-primary" />
          <h2 className="font-display font-bold text-lg text-foreground">Current Order</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Table #"
            className="text-xs bg-secondary px-2 py-1 rounded-md text-foreground placeholder:text-muted-foreground w-20 outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">₹{item.finalPrice.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                  className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                </motion.button>
                <span className="text-sm font-semibold w-6 text-center text-foreground">
                  {item.quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                  className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center"
                >
                  <Plus size={13} />
                </motion.button>
              </div>
              <p className="text-sm font-bold text-foreground w-20 text-right">
                ₹{getItemTotal(item).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShoppingBag size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No items added yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-display text-xl font-bold text-foreground">
            ₹{total.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="pos-btn-ghost flex-1 text-sm disabled:opacity-40"
          >
            Clear
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onProceedToPay}
            disabled={cart.length === 0}
            className="pos-btn-primary flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pay ₹{total.toFixed(2)}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
