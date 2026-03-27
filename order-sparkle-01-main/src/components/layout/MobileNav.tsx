"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, List, BarChart3 } from 'lucide-react';

const MobileNav = () => {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'POS', path: '/pos', icon: ShoppingCart },
    { name: 'Menu', path: '/menu', icon: List },
    { name: 'Sales', path: '/sales', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe md:hidden">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === item.path ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
