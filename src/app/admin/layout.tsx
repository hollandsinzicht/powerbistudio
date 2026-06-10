'use client';

import { usePathname, useRouter } from 'next/navigation';

/**
 * Admin-layout. De toegangscontrole zit NIET hier maar in src/proxy.ts:
 * elke /admin-request wordt server-side gecontroleerd op de httpOnly
 * sessie-cookie vóór er ook maar iets rendert. Dit layout doet alleen
 * de chrome (header + uitloggen).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // De login-pagina krijgt geen admin-chrome — die staat buiten de sessie.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } finally {
      localStorage.removeItem('admin_token');
      router.replace('/admin/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pt-20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-4">
          <h1 className="text-2xl">Blog Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--color-neutral-700)] transition-colors hover:text-[var(--color-error)]"
          >
            Uitloggen
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
