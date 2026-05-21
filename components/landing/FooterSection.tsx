import { HiredMateBrand } from '@/components/landing/brand';
import Link from 'next/link';

const PRODUCT_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/practice', label: 'Mock Interview' },
  { href: '/practice', label: 'Voice Practice' },
  { href: '/practice', label: 'Hospitals' },
  { href: '/battle', label: 'Battle Mode' },
  { href: '/resume-builder', label: 'Resume Builder' },
];

const RESOURCE_LINKS = [
  { href: '#', label: 'Blog (coming soon)' },
  { href: '#features', label: 'Interview Tips' },
  { href: '#hospitals', label: 'Hospital Guides' },
];

export function FooterSection() {
  return (
    <footer className="border-t border-white/10 bg-black/40 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <HiredMateBrand href="/" />
          <p className="mt-4 text-sm text-white/60">
            The #1 AI interview prep for nurses.
          </p>
          <p className="mt-4 text-xs text-white/30">
            © {new Date().getFullYear()} HiredMate
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Product</h4>
          <ul className="mt-4 space-y-2">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Resources</h4>
          <ul className="mt-4 space-y-2">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li>
              <a
                href="mailto:support@hiredmate.online"
                className="transition hover:text-white"
              >
                support@hiredmate.online
              </a>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl border-t border-white/5 px-4 pt-8 text-center text-sm text-white/30 sm:px-6">
        © 2026 HiredMate. All rights reserved.
      </p>
    </footer>
  );
}
