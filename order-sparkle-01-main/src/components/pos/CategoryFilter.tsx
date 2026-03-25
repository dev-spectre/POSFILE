import { motion } from 'framer-motion';

const categories = ['All', 'Starters', 'Main Course', 'Drinks', 'Desserts'];

interface CategoryFilterProps {
  active: string;
  onSelect: (cat: string) => void;
}

const CategoryFilter = ({ active, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => (
        <motion.button
          key={cat}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat)}
          className={`category-chip ${active === cat ? 'category-chip-active' : 'category-chip-inactive'}`}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
