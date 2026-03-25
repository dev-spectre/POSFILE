import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePOSStore } from '@/store/posStore';
import MenuItemCard from './MenuItemCard';

interface MenuListProps {
  activeCategory: string;
}

const MenuList = ({ activeCategory }: MenuListProps) => {
  const { menuItems, addItem, searchQuery } = usePOSStore();

  const filtered = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== 'All') {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <AnimatePresence mode="popLayout">
        {filtered.map((item) => (
          <MenuItemCard key={item.id} item={item} onAdd={addItem} />
        ))}
      </AnimatePresence>
      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No items found
        </div>
      )}
    </div>
  );
};

export default MenuList;
