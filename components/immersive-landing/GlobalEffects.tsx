'use client';

import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

function useDebouncedMouse() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rafRef = useRef<number | null>(null);
  const pending = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      pending.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        mouseX.set(pending.current.x);
        mouseY.set(pending.current.y);
        rafRef.current = null;
      });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handle);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
}

export function GlobalEffects({ children }: { children: ReactNode }) {
  const { mouseX, mouseY } = useDebouncedMouse();
  const cursorX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const cursorY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  const glowX = useTransform(mouseX, (v) => v);
  const glowY = useTransform(mouseY, (v) => v);

  return (
    <>
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="immersive-cursor pointer-events-none fixed z-[9999] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-400/50 mix-blend-difference md:block"
        aria-hidden
      />
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none fixed z-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/[0.08] blur-3xl"
        aria-hidden
      />
      {children}
    </>
  );
}
