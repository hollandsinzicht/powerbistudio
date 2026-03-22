import Link from "next/link";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] pt-16 pb-8">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Col */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
                            <Image
                                src="/logo.png"
                                alt="Power BI Studio"
                                width={180}
                                height={40}
                                className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
                            Power BI & AI specialist voor organisaties die de volgende stap willen zetten.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 bg-gray-100 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href="mailto:info@powerbistudio.nl"
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 bg-gray-100 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
                                aria-label="Email"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links Col */}
                    <div>
                        <h4 className="text-[var(--text-primary)] font-medium mb-4 font-display">Navigatie</h4>
                        <ul className="flex flex-col gap-3">
                            <li>
                                <Link href="/over" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                                    Over
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                                    Tools
                                </Link>
                            </li>
                            <li>
                                <Link href="/cases" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                                    Cases
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Col */}
                    <div>
                        <h4 className="text-[var(--text-primary)] font-medium mb-4 font-display">Contact</h4>
                        <ul className="flex flex-col gap-3 text-[var(--text-secondary)]">
                            <li>Jan Willem den Hollander</li>
                            <li><a href="mailto:info@powerbistudio.nl" className="hover:text-[var(--text-primary)] transition-colors">info@powerbistudio.nl</a></li>
                            <li className="mt-2 text-xs opacity-70">KVK: 62432168 — Think Different Media</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[var(--text-secondary)] text-sm">
                        &copy; {currentYear} PowerBIStudio.nl — Jan Willem den Hollander
                    </p>
                </div>
            </div>
        </footer>
    );
}
