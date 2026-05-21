import Image from 'next/image';
import Link from 'next/link';

const PRODUCT = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/practice', label: 'Mock Interview' },
  { href: '/practice', label: 'Voice Practice' },
  { href: '/practice', label: 'Hospitals' },
  { href: '/battle', label: 'Battle Mode' },
  { href: '/resume-builder', label: 'Resume Builder' },
];

export function ImmersiveFooter() {
  return (
    <footer className="relative border-t border-white/8 bg-[#04000F]/80 py-20">
      <p
        className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 select-none text-7xl text-white/[0.05] sm:text-8xl"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        aria-hidden
      >
        HiredMate
      </p>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/hiredmate-logo.png"
              alt=""
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span style={{ fontFamily: "'Fredoka One', cursive" }} className="text-white">
              HiredMate
            </span>
          </div>
          <p className="mt-3 text-sm text-white/50">
            The #1 AI interview prep for nurses.
          </p>
          <div className="mt-4 flex gap-3">
            {['𝕏', 'in', '▶'].map((icon) => (
              <span
                key={icon}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-sm text-white/40 transition hover:border-purple-400/50 hover:text-white hover:shadow-[0_0_16px_rgba(124,92,191,0.4)]"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Product</h4>
          <ul className="mt-4 space-y-2">
            {PRODUCT.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Resources</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/50">
            <li>Blog (coming soon)</li>
            <li>
              <a href="#features" className="hover:text-white">
                Interview Tips
              </a>
            </li>
            <li>
              <a href="#hospitals" className="hover:text-white">
                Hospital Guides
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/50">
            <li>
              <a href="mailto:support@hiredmate.online" className="hover:text-white">
                support@hiredmate.online
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 px-4 pt-8 text-sm text-white/20 sm:flex-row sm:px-6">
        <span>© 2026 HiredMate. All rights reserved.</span>
        <span>
          <Link href="/privacy" className="hover:text-white/40">
            Privacy
          </Link>
          {' · '}
          <Link href="/terms" className="hover:text-white/40">
            Terms
          </Link>
          {' · '}
          <a href="mailto:support@hiredmate.online" className="hover:text-white/40">
            Contact
          </a>
        </span>
      </div>
    </footer>
  );
}
