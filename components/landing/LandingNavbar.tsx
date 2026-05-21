'use client';

import { HiredMateBrand } from '@/components/landing/brand';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#hospitals', label: 'Hospitals' },
  { href: '#pricing', label: 'Pricing' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white transition-shadow duration-300',
        scrolled && 'shadow-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
        <HiredMateBrand logoSize={32} />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-600 transition hover:text-[#7C5CBF]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-pill border-2 border-[#7C5CBF] px-5 py-2 text-sm font-bold text-[#7C5CBF] transition hover:bg-[#7C5CBF]/10"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] px-5 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-105"
          >
            Start Free →
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-700 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#F8F7FF]"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-pill border-2 border-[#7C5CBF] px-4 py-2.5 text-center text-sm font-bold text-[#7C5CBF]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] px-4 py-2.5 text-center text-sm font-bold text-white"
              >
                Start Free →
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
