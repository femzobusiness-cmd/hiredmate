'use client';

import Logo from '@/components/ui/Logo';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/practice', label: 'Practice Sessions', icon: '📝' },
  { href: '/dashboard#progress', label: 'My Progress', icon: '🎯' },
  { href: '/dashboard#salary', label: 'Salary Prep', icon: '💰' },
  { href: '/dashboard#settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'HM';

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar-gradient text-white">
      <div className="flex flex-col h-full p-6">
        <Logo size="md" light className="mb-10" />

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/practice' && pathname.startsWith('/practice'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-pill px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white text-primary shadow-card'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-card bg-white/10 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName || 'Nurse'}</p>
            <p className="truncate text-xs text-white/70">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
