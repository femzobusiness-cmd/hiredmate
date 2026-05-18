'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATS = [
  { label: '25 Clinical Scenarios Ready', icon: '🩺' },
  { label: '8 Behavioral Questions', icon: '💬' },
  { label: 'Salary Scripts Included', icon: '💰' },
];

export default function CompletionScreen() {
  const router = useRouter();
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ['#7C5CBF', '#9B7FD4', '#EDE9F7', '#F7B731', '#26de81'];
    setConfetti(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    );

    const timer = setTimeout(() => router.push('/dashboard'), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex flex-col items-center overflow-hidden text-center">
      {confetti.map((c) => (
        <span
          key={c.id}
          className="pointer-events-none absolute top-0 h-3 w-3 animate-confetti rounded-sm"
          style={{
            left: `${c.left}%`,
            backgroundColor: c.color,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}

      <div className="mb-6 text-6xl">🎉</div>
      <h1 className="mb-4 text-3xl font-bold text-dark-text">
        Your personalized prep is ready 🎉
      </h1>
      <p className="mb-10 text-body-text">
        We&apos;ve built a custom plan based on your profile
      </p>

      <div className="mb-10 grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <Card key={stat.label} className="text-center">
            <span className="mb-2 block text-2xl">{stat.icon}</span>
            <p className="text-sm font-semibold text-dark-text">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Button size="lg" onClick={() => router.push('/dashboard')}>
        Start Practicing →
      </Button>
      <p className="mt-4 text-sm text-body-text">Redirecting to dashboard...</p>
    </div>
  );
}
