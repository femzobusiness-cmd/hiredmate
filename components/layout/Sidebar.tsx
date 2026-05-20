'use client';

import { RankBadge } from '@/components/ui/RankBadge';
import { XPCounter } from '@/components/ui/XPCounter';
import { BETA_ALL_FEATURES_FREE } from '@/lib/access';
import { getRankForXp, getRankProgress } from '@/lib/gamification';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Building2,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Mic,
  Mic2,
  Settings,
  Target,
  TreePine,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

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
  {
    href: '/community',
    label: 'Community',
    icon: Users,
    showCommunityBadge: true,
  },
  {
    href: '/battle',
    label: 'Battle Mode',
    icon: Zap,
    showBattleBadge: true,
  },
  {
    href: '/resume-builder',
    label: 'Resume Builder',
    icon: FileText,
    showResumeBuilderBadge: true,
  },
  { href: '/skills', label: 'Skill Tree', icon: TreePine },
  { href: '/hospitals', label: 'Hospitals', icon: Building2, showNewBadge: true },
  { href: '/salary-prep', label: 'Salary Prep', icon: DollarSign },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const sections = [
  { label: 'MAIN', items: navItems.slice(0, 8) },
  { label: 'TOOLS', items: navItems.slice(8, 13) },
  { label: 'ACCOUNT', items: navItems.slice(13) },
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

function HiredMateBrand({ logoSize = 36 }: { logoSize?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/hiredmate-logo.png"
        alt="HiredMate"
        width={logoSize}
        height={logoSize}
        className={logoSize === 32 ? 'rounded-xl' : 'rounded-2xl'}
      />
      <span
        className="text-xl font-semibold tracking-tight"
        style={{ fontFamily: "'Fredoka One', cursive" }}
      >
        <span className="text-gray-900">Hired</span>
        <span className="ml-0.5 rounded-lg bg-[#7C5CBF] px-1.5 py-0.5 text-white">
          Mate
        </span>
      </span>
    </div>
  );
}

function SidebarPanel({
  pathname,
  isFreePlan,
  incompleteQuestCount,
  stagesCompletedCount,
  totalStages,
  userName,
  userEmail,
  rank,
  rankTitle,
  totalXp,
  rankProgress,
  initials,
  onNavClick,
  onSignOut,
  showCloseButton,
  onClose,
}: {
  pathname: string;
  isFreePlan: boolean;
  incompleteQuestCount: number;
  stagesCompletedCount: number;
  totalStages: number;
  userName?: string;
  userEmail?: string;
  rank: ReturnType<typeof getRankForXp>;
  rankTitle?: string;
  totalXp: number;
  rankProgress: ReturnType<typeof getRankProgress>;
  initials: string;
  onNavClick?: () => void;
  onSignOut: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col p-5">
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="mb-8 rounded-card bg-sidebar-gradient p-4">
        <HiredMateBrand />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
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
                const isCommunity = item.href === '/community';
                const isBattle = item.href === '/battle';
                const isResumeBuilder = item.href === '/resume-builder';
                const isTealHighlight =
                  isHospitals ||
                  isMockInterview ||
                  isVoicePractice ||
                  isCommunity ||
                  isResumeBuilder;
                const isActive = isHospitals
                  ? pathname.startsWith('/hospitals')
                  : isMockInterview
                    ? pathname.startsWith('/mock-interview')
                    : isVoicePractice
                      ? pathname === '/voice-practice'
                      : isCommunity
                        ? pathname.startsWith('/community')
                        : isBattle
                          ? pathname.startsWith('/battle')
                          : isResumeBuilder
                            ? pathname.startsWith('/resume-builder')
                            : pathname === item.href ||
                              pathname.startsWith(`${item.href}/`);
                const showQuestBadge =
                  'showQuestBadge' in item &&
                  item.showQuestBadge &&
                  incompleteQuestCount > 0;
                const showLearnBadge = 'showLearnBadge' in item && item.showLearnBadge;
                const showNewBadge = 'showNewBadge' in item && item.showNewBadge;
                const showGoldNewBadge =
                  'showGoldNewBadge' in item && item.showGoldNewBadge;
                const showCommunityBadge =
                  'showCommunityBadge' in item && item.showCommunityBadge;
                const showBattleBadge =
                  'showBattleBadge' in item && item.showBattleBadge;
                const showResumeBuilderBadge =
                  'showResumeBuilderBadge' in item && item.showResumeBuilderBadge;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block"
                    onClick={onNavClick}
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={cn(
                        'group relative flex h-11 items-center gap-3 overflow-hidden rounded-[12px] px-4 text-sm transition-all',
                        isActive
                          ? isBattle
                            ? 'bg-red-500/10 font-bold text-red-500'
                            : isTealHighlight
                            ? 'bg-[#7C5CBF]/10 font-bold text-[#7C5CBF]'
                            : 'font-bold text-primary shadow-nav'
                          : 'text-body-text hover:text-text-primary'
                      )}
                    >
                      {isActive && !isTealHighlight && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 rounded-xl bg-purple-50"
                          />
                        )}
                      {isActive && isTealHighlight && (
                          <div className="absolute inset-0 rounded-xl bg-[#7C5CBF]/10" />
                        )}
                      <Icon
                        className={cn(
                          'relative z-10 h-4 w-4 transition-colors',
                          isActive
                            ? isBattle
                              ? 'text-red-500'
                              : 'text-primary'
                            : 'text-text-muted group-hover:text-primary'
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
                        {showCommunityBadge && (
                          <span className="relative z-10 rounded-full bg-[#00C6B2] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        )}
                        {showBattleBadge && (
                          <span className="relative z-10 rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        )}
                        {showResumeBuilderBadge && (
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

      {isFreePlan && !BETA_ALL_FEATURES_FREE && (
        <div className="mb-4 rounded-[18px] bg-purple-gradient p-4 text-white shadow-card">
          <p className="text-sm font-black">🚀 Upgrade to Pro</p>
          <p className="mt-1 text-xs font-medium text-white/80">
            Unlock unlimited sessions
          </p>
          <Link
            href="/pricing"
            onClick={onNavClick}
            className="mt-3 inline-flex w-full items-center justify-center rounded-pill bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-white/90"
          >
            Upgrade →
          </Link>
        </div>
      )}

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-3 rounded-[16px] border border-border bg-white p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-gradient text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {userName || 'Nurse'}
            </p>
            <p className="truncate text-xs text-text-muted">{userEmail}</p>
            <motion.div className="mt-2">
              <RankBadge rank={rank.level} title={rankTitle || rank.title} animated />
              <div className="mt-2">
                <XPCounter
                  value={totalXp}
                  max={rankProgress.next?.xp || totalXp || 1}
                />
              </div>
            </motion.div>
          </div>
          <Link href="/settings" onClick={onNavClick}>
            <Settings className="h-4 w-4 text-text-muted" />
          </Link>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-input"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    closeMobile();
    router.push('/login');
    router.refresh();
  };

  const panelProps = {
    pathname,
    isFreePlan,
    incompleteQuestCount,
    stagesCompletedCount,
    totalStages,
    userName,
    userEmail,
    rank,
    rankTitle,
    totalXp,
    rankProgress,
    initials,
    onSignOut: handleSignOut,
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#7C5CBF]/10 bg-white px-4 shadow-[0_4px_20px_rgba(124,92,191,0.08)] lg:hidden">
        <HiredMateBrand logoSize={32} />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-2xl bg-[#7C5CBF]/10 p-2.5"
        >
          <Menu className="h-5 w-5 text-[#7C5CBF]" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 hidden w-[260px] flex-col border-r border-border bg-sidebar text-text-primary shadow-[2px_0_12px_rgba(124,92,191,0.06)] lg:flex">
        <SidebarPanel {...panelProps} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-72 border-r border-border bg-white shadow-2xl lg:hidden"
            >
              <SidebarPanel
                {...panelProps}
                onNavClick={closeMobile}
                showCloseButton
                onClose={closeMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
