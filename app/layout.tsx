import { CapacitorNativeInit } from '@/components/CapacitorNativeInit';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'HiredMate — AI Interview Prep for Nurses',
  description:
    'Practice nursing interviews with an AI hiring manager that pushes back on weak answers. Hospital-specific prep packs, voice analysis, and battle mode. Free to start.',
  keywords: [
    'nursing interview prep',
    'nurse interview',
    'AI mock interview',
    'nursing job',
    'RN interview questions',
    'travel nurse',
    'hospital interview',
  ],
  openGraph: {
    title: 'HiredMate — AI Interview Prep for Nurses',
    description:
      'The #1 AI interview prep platform for nurses. Mock interviews, voice practice, hospital packs.',
    url: 'https://hiredmate.online',
    siteName: 'HiredMate',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <CapacitorNativeInit />
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
