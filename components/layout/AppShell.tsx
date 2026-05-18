'use client';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export default function AppShell({
  children,
  userName,
  userEmail,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-page-bg">
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="lg:pl-64">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
