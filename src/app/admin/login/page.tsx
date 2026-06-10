'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

/**
 * Admin-login. Valideert het wachtwoord server-side via /api/admin/login,
 * dat een httpOnly sessie-cookie zet (gecontroleerd door proxy.ts).
 *
 * Het wachtwoord gaat daarnaast in localStorage omdat de admin-tabs hun
 * API-calls authenticeren met de x-admin-token header. Die twee sporen
 * (cookie voor de UI-gate, header voor de API) delen dezelfde bron.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Inloggen mislukt.');
        return;
      }
      localStorage.setItem('admin_token', password);
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Inloggen mislukt. Controleer je verbinding.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-neutral-50)] px-6">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-neutral-200)] bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Lock size={24} className="text-[var(--color-primary-900)]" />
          <h1 className="text-xl">Admin</h1>
        </div>
        <form onSubmit={handleLogin}>
          <label htmlFor="admin-password" className="sr-only">
            Wachtwoord
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wachtwoord"
            autoFocus
            autoComplete="current-password"
            className="mb-4 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-[var(--color-neutral-900)] transition-colors focus:border-[var(--color-primary-700)] focus:outline-none"
          />
          {error && (
            <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || password.length === 0}
            className="btn-primary w-full justify-center py-3 font-medium disabled:opacity-60"
          >
            {busy ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
