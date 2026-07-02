"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FolderKanban, BarChart3, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const NAV = [
    { label: "Projecten", href: "/studio", icon: FolderKanban },
    { label: "Verbruik", href: "/studio/verbruik", icon: BarChart3 },
] as const;

function isActive(pathname: string | null, href: string): boolean {
    if (!pathname) return false;
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
}

// SaaS-shell voor de studio-omgeving: vaste sidebar op desktop, topbar+drawer op
// mobiel. De marketing-navbar/footer wordt op /studio verborgen (ChromeGate),
// dus dit is de enige navigatie binnen het product.
export default function StudioShell({
    email,
    children,
}: {
    email: string | null;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const logout = async () => {
        await supabaseBrowser().auth.signOut();
        router.refresh();
    };

    // Uitgelogd (landing/login): geen app-sidebar, alleen een strak topbalkje.
    if (!email) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)]">
                <header className="flex items-center justify-between border-b border-[var(--color-neutral-200)] bg-white px-6 h-14">
                    <Link href="/studio" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Power BI Studio" width={160} height={40} className="h-6 w-auto" priority />
                    </Link>
                    <div className="flex items-center gap-4 text-sm">
                        <Link href="/" className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors">
                            Naar de website
                        </Link>
                        <Link
                            href="/studio/login"
                            className="rounded-md bg-[var(--color-action-600)] hover:bg-[var(--color-action-700)] px-4 py-2 font-medium text-white transition-colors"
                        >
                            Inloggen
                        </Link>
                    </div>
                </header>
                {children}
            </div>
        );
    }

    const navLinks = (onClick?: () => void) =>
        NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClick}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                            ? "bg-[var(--color-primary-900)] text-white"
                            : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
                    }`}
                >
                    <item.icon size={17} />
                    {item.label}
                </Link>
            );
        });

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)]">
            {/* Sidebar (desktop) */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-[var(--color-neutral-200)] bg-white">
                <Link href="/studio" className="flex items-center gap-2 px-5 h-16 border-b border-[var(--color-neutral-100)]">
                    <Image src="/logo.png" alt="Power BI Studio" width={160} height={40} className="h-6 w-auto" priority />
                </Link>
                <nav className="flex-1 flex flex-col gap-1 p-3">{navLinks()}</nav>
                <div className="border-t border-[var(--color-neutral-100)] p-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
                    >
                        <ExternalLink size={14} /> Naar de website
                    </Link>
                    <p className="px-3 pt-2 text-xs text-[var(--color-neutral-500)] truncate" title={email}>
                        {email}
                    </p>
                    <button
                        onClick={logout}
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] transition-colors"
                    >
                        <LogOut size={17} /> Uitloggen
                    </button>
                </div>
            </aside>

            {/* Topbar (mobiel) */}
            <header className="md:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--color-neutral-200)] bg-white px-4 h-14">
                <Link href="/studio" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Power BI Studio" width={140} height={35} className="h-6 w-auto" priority />
                </Link>
                <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="p-1 text-[var(--color-neutral-700)]">
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </header>
            {menuOpen && (
                <div className="md:hidden fixed inset-x-0 top-14 z-40 border-b border-[var(--color-neutral-200)] bg-white p-3 shadow-lg flex flex-col gap-1">
                    {navLinks(() => setMenuOpen(false))}
                    <p className="px-3 pt-2 text-xs text-[var(--color-neutral-500)] truncate">{email}</p>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
                    >
                        <LogOut size={17} /> Uitloggen
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="md:pl-60">
                <div className="pt-14 md:pt-0">{children}</div>
            </div>
        </div>
    );
}
