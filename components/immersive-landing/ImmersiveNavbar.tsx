'use client';

import { MagneticButton } from '@/components/immersive-landing/ui/MagneticButton';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#hospitals', label: 'Hospitals' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How it works' },
];

export function ImmersiveNavbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(
    scrollY,
    [0, 80],
    [
      'rgba(4,0,15,0)',
      'rgba(4,0,15,0.8)',
    ]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)']
  );

  return (
    <>
      <motion.header
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 z-50 h-16 w-full border-b backdrop-blur-2xl"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/hiredmate-logo.png"
              alt="HiredMate"
              width={32}
              height={32}
              className="rounded-xl"
              priority
            />
            <span style={{ fontFamily: "'Fredoka One', cursive" }} className="text-lg">
              <span className="text-white">Hired</span>
              <span className="ml-1 rounded-lg bg-[#7C5CBF] px-2 py-0.5 text-white">
                Mate
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav-link-underline text-sm text-white/60 transition-colors duration-200 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>
            <MagneticButton href="/signup" size="sm">
              Start Free →
            </MagneticButton>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-white md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="absolute inset-x-0 top-0 border-b border-white/10 bg-[#04000F]/95 px-6 pb-8 pt-20 backdrop-blur-2xl"
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-lg p-2 text-white"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
              {NAV.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/8 py-4 text-lg text-white/80"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-6 block rounded-full border border-white/15 py-3 text-center text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="mt-3 block rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#A78BFA] py-3 text-center font-semibold text-white"
              >
                Start Free →
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
