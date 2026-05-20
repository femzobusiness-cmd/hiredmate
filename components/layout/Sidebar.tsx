'use client';

import Logo from '@/components/ui/Logo';
import { RankBadge } from '@/components/ui/RankBadge';
import { XPCounter } from '@/components/ui/XPCounter';
import { getRankForXp, getRankProgress } from '@/lib/gamification';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Building2,
  DollarSign,
  LayoutDashboard,
  Map,
  Mic,
  Mic2,
  Settings,
  Target,
  TreePine,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/practice', label: 'Practice Sessions', icon: BookOpen },
  { href: '/learn', label: 'Learn', icon: Map, showLearnBadge: true },
  {
    href: '/mock-interview',
    label: 'Mock Interview',
    icon: Mic,
    showGoldNewBadge: true,
  },
  {
    href: '/voice-practice',
    label: 'Voice Practice',
    icon: Mic2,
    showGoldNewBadge: true,
  },
  { href: '/quests', label: 'Quests', icon: Target, showQuestBadge: true },
  { href: '/progress', label: 'My Progress', icon: TrendingUp },
  { href: '/skills', label: 'Skill Tree', icon: TreePine },
  { href: '/hospitals', label: 'Hospitals', icon: Building2, showNewBadge: true },
  { href: '/salary-prep', label: 'Salary Prep', icon: DollarSign },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const sections = [
  { label: 'MAIN', items: navItems.slice(0, 7) },
  { label: 'TOOLS', items: navItems.slice(7, 10) },
  { label: 'ACCOUNT', items: navItems.slice(10) },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  plan?: string;
  rankTitle?: string;
  totalXp?: number;
  incompleteQuestCount?: number;
  stagesCompletedCount?: number;
  totalStages?: number;
}

export default function Sidebar({
  userName,
  userEmail,
  plan = 'free',
  rankTitle,
  totalXp = 0,
  incompleteQuestCount = 0,
  stagesCompletedCount = 0,
  totalStages = 26,
}: SidebarProps) {
  const pathname = usePathname();
  const isFreePlan = plan === 'free';
  const rank = getRankForXp(totalXp);
  const rankProgress = getRankProgress(totalXp);
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'HM';

  return (
    <aside className="fixed inset-y-0 hidden w-[260px] flex-col border-r border-border bg-sidebar text-text-primary shadow-[2px_0_12px_rgba(124,92,191,0.06)] lg:flex">
      <motion.div className="flex h-full flex-col p-5">
        <div className="mb-8 rounded-card bg-sidebar-gradient p-4">
          <Logo size="md" showText className="text-text-primary" />
        </div>

        <nav className="flex-1 space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isHospitals = item.href === '/hospitals';
                  const isMockInterview = item.href === '/mock-interview';
                  const isVoicePractice = item.href === '/voice-practice';
                  const isActive = isHospitals
                    ? pathname.startsWith('/hospitals')
                    : isMockInterview
                      ? pathname.startsWith('/mock-interview')
                      : isVoicePractice
                        ? pathname === '/voice-practice'
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                  const showQuestBadge =
                    'showQuestBadge' in item &&
                    item.showQuestBadge &&
                    incompleteQuestCount > 0;
                  const showLearnBadge = 'showLearnBadge' in item && item.showLearnBadge;
                  const showNewBadge =
                    'showNewBadge' in item && item.showNewBadge;
                  const showGoldNewBadge =
                    'showGoldNewBadge' in item && item.showGoldNewBadge;

                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={cn(
                          'group relative flex h-11 items-center gap-3 overflow-hidden rounded-[12px] px-4 text-sm transition-all',
                          isActive
                            ? isHospitals || isMockInterview || isVoicePractice
                              ? 'font-bold bg-[#7C5CBF]/10 text-[#7C5CBF]'
                              : 'font-bold text-primary shadow-nav'
                            : 'text-body-text hover:text-text-primary'
                        )}
                      >
                        {isActive &&
                          !isHospitals &&
                          !isMockInterview &&
                          !isVoicePractice && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 rounded-xl bg-purple-50"
                          />
                        )}
                        {isActive &&
                          (isHospitals || isMockInterview || isVoicePractice) && (
                          <div className="absolute inset-0 rounded-xl bg-[#7C5CBF]/10" />
                        )}
                        <Icon
                          className={cn(
                            'relative z-10 h-4 w-4 transition-colors',
                            isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'
                          )}
                        />
                        <span className="relative z-10 flex-1">{item.label}</span>
                        {showQuestBadge && (
                          <span className="relative z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                            {incompleteQuestCount}
                          </span>
                        )}
                        {showLearnBadge && (
                          <span className="relative z-10 rounded-pill bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {stagesCompletedCount}/{totalStages}
                          </span>
                        )}
                        {showNewBadge && (
                          <span className="relative z-10 rounded-full bg-[#00C6B2] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        )}
                        {showGoldNewBadge && (
                          <span className="relative z-10 rounded-full bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {isFreePlan && (
          <div className="mb-4 rounded-[18px] bg-purple-gradient p-4 text-white shadow-card">
            <p className="text-sm font-black">🚀 Upgrade to Pro</p>
            <p className="mt-1 text-xs font-medium text-white/80">
              Unlock unlimited sessions
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex w-full items-center justify-center rounded-pill bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-white/90"
            >
              Upgrade →
            </Link>
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 rounded-[16px] border border-border bg-white p-3">
          <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-gradient text-sm font-bold text-white">
            {initials}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{userName || 'Nurse'}</p>
            <p className="truncate text-xs text-text-muted">{userEmail}</p>
            <div className="mt-2">
              <RankBadge rank={rank.level} title={rankTitle || rank.title} animated />
              <div className="mt-2">
                <XPCounter
                  value={totalXp}
                  max={rankProgress.next?.xp || totalXp || 1}
                />
              </div>
            </div>
          </div>
          <Settings className="h-4 w-4 text-text-muted" />
        </div>
      </motion.div>
    </aside>
  );
}
