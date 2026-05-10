'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

// HR-rebrand: zeven nav-items zonder dropdown. Tools en Resources zijn naar
// de footer verplaatst — wat hier overblijft is alleen wat een eindbezoeker
// op de nav-balk verwacht.
const NAV_LINKS: Array<{ name: string; href: string }> = [
  { name: 'Over', href: '/over' },
  { name: 'HR Analytics', href: '/hr-analytics' },
  { name: 'DashPortal HR', href: '/dashportal' },
  { name: 'Methodiek', href: '/methodiek' },
  { name: 'Cases', href: '/cases' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const PRIMARY_CTA = {
  href: '/contact?type=quick-scan',
  label: 'Plan een Quick Scan',
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? 'border-[var(--border)] bg-white/95 py-3 backdrop-blur-md'
          : 'border-transparent bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Power BI Studio"
            width={180}
            height={40}
            className="h-7 w-auto opacity-90 transition-opacity group-hover:opacity-100"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-colors hover:text-[var(--color-primary-900)] ${
                      active
                        ? 'text-[var(--color-primary-900)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={PRIMARY_CTA.href}
            className="inline-flex items-center justify-center rounded-md bg-[var(--color-action-600)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
          >
            {PRIMARY_CTA.label}
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="text-[var(--text-secondary)] transition-colors hover:text-[var(--color-primary-900)] md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full flex w-full flex-col gap-4 border-b border-[var(--border)] bg-white px-6 py-4 shadow-lg md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block text-base font-medium transition-colors ${
                      active
                        ? 'text-[var(--color-primary-900)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--border)] pt-3">
            <Link
              href={PRIMARY_CTA.href}
              className="block w-full rounded-md bg-[var(--color-action-600)] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {PRIMARY_CTA.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
