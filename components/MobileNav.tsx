'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Mic, Building2, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Learn', icon: BookOpen, href: '/learn' },
  { label: 'Mock', icon: Mic, href: '/mock-interview' },
  { label: 'Hospitals', icon: Building2, href: '/hospitals' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(124,92,191,0.08)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <motion.button
              key={item.href}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1 rounded-xl px-3 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="mb-0.5 h-1 w-1 rounded-full bg-[#7C5CBF]"
                />
              )}
              {!isActive && <div className="mb-0.5 h-1 w-1" />}
              <Icon
                className="h-5 w-5"
                style={{ color: isActive ? '#7C5CBF' : '#9CA3AF' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? '#7C5CBF' : '#9CA3AF' }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
