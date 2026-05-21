'use client';

import { useEffect, useRef, useState } from 'react';

function parseTarget(value: string): { num: number; suffix: string; prefix: string } {
  const match = value.match(/^([^0-9]*)([0-9,]+)(.*)$/);
  if (!match) return { prefix: '', num: 0, suffix: value };
  return {
    prefix: match[1],
    num: parseInt(match[2].replace(/,/g, ''), 10),
    suffix: match[3],
  };
}

function formatNum(n: number, original: string): string {
  if (original.includes(',')) {
    return n.toLocaleString();
  }
  return String(n);
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
  const { num, suffix, prefix } = parseTarget(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const duration = 1500;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(num * eased);
          setDisplay(`${prefix}${formatNum(current, value)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num, prefix, suffix, value]);

  return (
    <div ref={ref} className="text-center">
      <p
        className="text-4xl font-black text-[#7C5CBF] sm:text-5xl"
        style={{ fontFamily: "'Fredoka One', cursive" }}
      >
        {display}
      </p>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
    </div>
  );
}
