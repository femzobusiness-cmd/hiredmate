'use client';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  plan?: string;
  rankTitle?: string;
  totalXp?: number;
  incompleteQuestCount?: number;
  stagesCompletedCount?: number;
  totalStages?: number;
}

export default function AppShell({
  children,
  userName,
  userEmail,
  plan,
  rankTitle,
  totalXp,
  incompleteQuestCount,
  stagesCompletedCount,
  totalStages,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-page-bg page-fade">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        plan={plan}
        rankTitle={rankTitle}
        totalXp={totalXp}
        incompleteQuestCount={incompleteQuestCount}
        stagesCompletedCount={stagesCompletedCount}
        totalStages={totalStages}
      />
      <div className="lg:pl-[260px]">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
