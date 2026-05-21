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
    'Personalized AI-powered interview preparation for nurses and healthcare professionals.',
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
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"
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
