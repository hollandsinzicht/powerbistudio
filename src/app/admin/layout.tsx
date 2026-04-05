"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simpele client-side check — de echte auth zit in de API routes via x-admin-token header
    if (password.length >= 4) {
      localStorage.setItem("admin_token", password);
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <div className="glass-card rounded-xl p-8 border border-[var(--border)] max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} className="text-[var(--primary)]" />
            <h1 className="text-xl font-display font-bold">Admin</h1>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              autoFocus
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">Ongeldig wachtwoord</p>}
            <button type="submit" className="btn-primary w-full py-3 font-medium">
              Inloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
          <h1 className="text-2xl font-display font-bold">Blog Admin</h1>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              setIsAuthenticated(false);
            }}
            className="text-sm text-[var(--text-secondary)] hover:text-red-500 transition-colors"
          >
            Uitloggen
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
