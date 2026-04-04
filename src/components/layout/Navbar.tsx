"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

const dienstenLinks = [
    { name: "Power BI voor SaaS & software", href: "/saas" },
    { name: "Power BI voor zorg & overheid", href: "/publieke-sector" },
    { name: "Fabric migratie", href: "/fabric-migratie" },
    { name: "Copilot readiness", href: "/copilot-readiness" },
    { name: "Procesverbetering met Power BI", href: "/procesverbetering" },
];

const navLinks = [
    { name: "Over", href: "/over" },
    { name: "DashPortal", href: "/dashportal" },
    { name: "Tools", href: "/tools" },
    { name: "Cases", href: "/cases" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDienstenOpen, setIsMobileDienstenOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isDienstenActive = dienstenLinks.some((l) => pathname === l.href);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled
                ? "bg-[rgba(255,255,255,0.9)] backdrop-blur-md border-[var(--border)] py-4"
                : "bg-transparent border-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/logo.png"
                        alt="Power BI Studio"
                        width={180}
                        height={40}
                        className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
                        priority
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <ul className="flex items-center gap-8 text-sm font-medium">
                        <li>
                            <Link
                                href="/over"
                                className={`transition-colors hover:text-[var(--primary)] ${pathname === "/over" ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}
                            >
                                Over
                            </Link>
                        </li>

                        {/* Diensten Dropdown */}
                        <li className="relative" ref={dropdownRef}>
                            <button
                                className={`flex items-center gap-1 transition-colors hover:text-[var(--primary)] ${isDienstenActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                onMouseEnter={() => setIsDropdownOpen(true)}
                            >
                                Diensten
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {isDropdownOpen && (
                                <div
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl py-2 z-50"
                                    onMouseLeave={() => setIsDropdownOpen(false)}
                                >
                                    {dienstenLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${pathname === link.href
                                                ? "text-[var(--primary)] border-l-2 border-[var(--accent)]"
                                                : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
                                                }`}
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </li>

                        {navLinks.slice(1).map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`transition-colors hover:text-[var(--primary)] ${pathname === link.href ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}
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
                        <li>
                            <Link
                                href="/over"
                                className={`block text-lg font-medium transition-colors ${pathname === "/over" ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Over
                            </Link>
                        </li>

                        {/* Diensten uitklapbaar */}
                        <li>
                            <button
                                className={`flex items-center gap-2 text-lg font-medium transition-colors w-full ${isDienstenActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}
                                onClick={() => setIsMobileDienstenOpen(!isMobileDienstenOpen)}
                            >
                                Diensten
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${isMobileDienstenOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {isMobileDienstenOpen && (
                                <ul className="flex flex-col gap-2 mt-2 ml-4 border-l-2 border-[var(--border)] pl-4">
                                    {dienstenLinks.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className={`block text-[0.95rem] transition-colors ${pathname === link.href ? "text-[var(--primary)]" : "text-[var(--text-secondary)] hover:text-[var(--primary)]"}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>

                        {navLinks.slice(1).map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block text-lg font-medium transition-colors ${pathname === link.href ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}
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
