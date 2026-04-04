import Link from "next/link";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const linkClass = "text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors";

    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] pt-16 pb-8">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Kolom 1: Diensten */}
                    <div>
                        <h4 className="text-[var(--text-primary)] font-medium mb-4 font-display">Diensten</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href="/saas" className={linkClass}>Power BI voor SaaS & software</Link></li>
                            <li><Link href="/publieke-sector" className={linkClass}>Power BI voor zorg & overheid</Link></li>
                            <li><Link href="/fabric-migratie" className={linkClass}>Fabric migratie</Link></li>
                            <li><Link href="/copilot-readiness" className={linkClass}>Copilot readiness</Link></li>
                            <li><Link href="/procesverbetering" className={linkClass}>Procesverbetering</Link></li>
                        </ul>
                    </div>

                    {/* Kolom 2: Producten & Tools */}
                    <div>
                        <h4 className="text-[var(--text-primary)] font-medium mb-4 font-display">Producten & Tools</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href="/dashportal" className={linkClass}>DashPortal</Link></li>
                            <li><Link href="/tools/report-auditor" className={linkClass}>Report Auditor</Link></li>
                            <li><Link href="/tools/dax-assistant" className={linkClass}>DAX Formula Assistant</Link></li>
                            <li><Link href="/tools/readiness-scan" className={linkClass}>Power BI Readiness Scan</Link></li>
                        </ul>
                    </div>

                    {/* Kolom 3: Over & Cases */}
                    <div>
                        <h4 className="text-[var(--text-primary)] font-medium mb-4 font-display">Over & Cases</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href="/over" className={linkClass}>Over Jan Willem</Link></li>
                            <li><Link href="/cases" className={linkClass}>Cases</Link></li>
                            <li><Link href="/blog" className={linkClass}>Blog</Link></li>
                            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
                        </ul>
                    </div>

                    {/* Kolom 4: Contact */}
                    <div>
                        <h4 className="text-[var(--text-primary)] font-medium mb-4 font-display">Contact</h4>
                        <ul className="flex flex-col gap-3 text-[var(--text-secondary)]">
                            <li>
                                <a href="mailto:info@powerbistudio.nl" className="hover:text-[var(--text-primary)] transition-colors">
                                    info@powerbistudio.nl
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-[var(--text-primary)] transition-colors"
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Beschikbaar voor opdrachten
                            </li>
                            <li className="mt-2 text-xs opacity-70">KVK: 62432168</li>
                        </ul>
                        <div className="flex items-center gap-3 mt-4">
                            <a
                                href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 bg-gray-100 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a
                                href="mailto:info@powerbistudio.nl"
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 bg-gray-100 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
                                aria-label="Email"
                            >
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logo.png"
                            alt="Power BI Studio"
                            width={140}
                            height={32}
                            className="h-6 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                    </Link>
                    <p className="text-[var(--text-secondary)] text-sm">
                        &copy; {currentYear} PowerBIStudio.nl — Jan Willem den Hollander
                    </p>
                </div>
            </div>
        </footer>
    );
}
