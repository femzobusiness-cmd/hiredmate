import { HiredMateBrand } from '@/components/landing/brand';
import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Dashboard', href: '/signup' },
  { label: 'Mock Interview', href: '/signup' },
  { label: 'Voice Practice', href: '/signup' },
  { label: 'Hospitals', href: '#hospitals' },
  { label: 'Battle Mode', href: '/signup' },
  { label: 'Resume Builder', href: '/signup' },
];

const RESOURCE_LINKS = [
  { label: 'Blog (coming soon)', href: '#' },
  { label: 'Nursing Interview Tips', href: '#features' },
  { label: 'Hospital Culture Guides', href: '#hospitals' },
];

const SUPPORT_LINKS = [
  { label: 'Contact', href: 'mailto:support@hiredmate.online' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export function FooterSection() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <HiredMateBrand href="/" />
          <p className="mt-4 text-sm text-gray-500">
            The #1 AI interview prep for nurses.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Product
          </h4>
          <ul className="mt-4 space-y-2">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-[#7C5CBF]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Resources
          </h4>
          <ul className="mt-4 space-y-2">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-[#7C5CBF]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Support
          </h4>
          <ul className="mt-4 space-y-2">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-[#7C5CBF]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
        © 2026 HiredMate. All rights reserved.
      </p>
    </footer>
  );
}
