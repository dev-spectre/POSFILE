import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MenuItem } from '@/store/posStore';
import { getFoodImage } from '@/lib/imageHelper';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col cursor-pointer group"
      onClick={() => onAdd(item)}
    >
      {/* Image Section */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={getFoodImage(item.name, item.category)} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        {item.isVeg && (
          <div className="absolute top-4 left-4 h-6 w-6 rounded-md bg-white flex items-center justify-center shadow-md ring-1 ring-black/5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black tracking-widest text-orange-500 uppercase mb-1 block">
              {item.category}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">
              {item.name}
            </h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(item);
            }}
          >
            <Plus size={20} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-xl font-black text-slate-900 dark:text-white">
            ₹{item.price.toFixed(2)}
          </p>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
            Instock
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
