'use client';

import { useEffect, useRef, useState } from 'react';

function parseStatValue(raw: string): {
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
} {
  const match = raw.match(/^([^0-9]*)([\d,.]+)(.*)$/);
  if (!match) {
    return { prefix: '', target: 0, suffix: raw, decimals: 0 };
  }
  const numStr = match[2].replace(/,/g, '');
  const target = parseFloat(numStr) || 0;
  const decimals = numStr.includes('.') ? (numStr.split('.')[1]?.length ?? 0) : 0;
  return { prefix: match[1], target, suffix: match[3], decimals };
}

function formatValue(value: number, decimals: number, suffix: string): string {
  if (suffix.includes('+') && value >= 1000) {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: decimals,
    });
  }
  if (decimals > 0) {
    return value.toFixed(decimals);
  }
  return String(Math.round(value));
}

export function CountUpStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');
  const { prefix, target, suffix, decimals } = parseStatValue(value);
  const hasStarted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return;
        hasStarted.current = true;

        const duration = 1500;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          setDisplay(
            `${prefix}${formatValue(current, decimals, suffix)}${suffix}`
          );
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, prefix, suffix, decimals]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black text-white">{display}</p>
      <p className="mt-1 text-sm text-white/50">{label}</p>
    </div>
  );
}
