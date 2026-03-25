import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MenuItem } from '@/store/posStore';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const categoryColors: Record<string, string> = {
  Starters: 'bg-accent text-accent-foreground',
  'Main Course': 'bg-primary/10 text-primary',
  Drinks: 'bg-pos-info/10 text-pos-info',
  Desserts: 'bg-pos-success/10 text-pos-success',
};

const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.97 }}
      className="pos-card p-4 flex flex-col gap-3 cursor-pointer group"
      onClick={() => onAdd(item)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">
            {item.name}
          </h3>
          <span
            className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[item.category] || 'bg-secondary text-muted-foreground'}`}
          >
            {item.category}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(item);
          }}
        >
          <Plus size={16} />
        </motion.button>
      </div>
      <p className="font-display text-lg font-bold text-foreground">
        ${item.price.toFixed(2)}
      </p>
    </motion.div>
  );
};

export default MenuItemCard;
