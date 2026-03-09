"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Over", href: "/over" },
        { name: "Tools", href: "/tools" },
        { name: "Cases", href: "/cases" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled
                ? "bg-[rgba(255,255,255,0.9)] backdrop-blur-md border-[var(--border)] py-4"
                : "bg-transparent border-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-warm)] rounded-sm flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                        <span className="text-[var(--primary)] font-bold font-display leading-none">PB</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">
                        PowerBIStudio
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <ul className="flex items-center gap-8 text-sm font-medium">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`transition-colors hover:text-[var(--primary)] ${pathname === link.href ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/contact"
                        className="text-sm font-medium bg-[var(--accent)] text-[var(--primary)] px-5 py-2.5 rounded hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    >
                        Plan een gesprek
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[var(--surface)] border-b border-[var(--border)] py-4 px-6 flex flex-col gap-4 shadow-xl">
                    <ul className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block text-lg font-medium transition-colors ${pathname === link.href ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2 border-t border-[var(--border)]">
                        <Link
                            href="/contact"
                            className="inline-block text-center w-full font-medium bg-[var(--accent)] text-[var(--primary)] px-5 py-3 rounded hover:bg-blue-600 transition-colors mt-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Plan een gesprek
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
