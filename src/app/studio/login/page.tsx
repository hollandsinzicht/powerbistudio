"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function StudioLogin() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const supabase = supabaseBrowser();
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    emailRedirectTo: `${window.location.origin}/studio/auth/callback`,
                },
            });
            if (error) throw error;
            setSent(true);
        } catch (err) {
            console.error(err);
            setError("Inloggen lukte niet. Controleer het e-mailadres en probeer het opnieuw.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-md">
                <Link
                    href="/studio"
                    className="text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)] inline-flex items-center gap-2 mb-6 text-sm transition-colors"
                >
                    <ArrowLeft size={16} /> Terug naar Studio
                </Link>

                <div className="bg-white rounded-lg border border-[var(--color-neutral-200)] p-8">
                    <h1 className="text-2xl font-bold text-[var(--color-primary-900)] mb-2">
                        Inloggen bij Studio
                    </h1>
                    <p className="text-sm text-[var(--color-neutral-700)] mb-6">
                        Geen wachtwoord nodig — je ontvangt een eenmalige inloglink per e-mail.
                    </p>

                    {sent ? (
                        <div className="rounded-md border border-[var(--color-accent-700)]/30 bg-[var(--color-accent-100)]/40 p-4 text-sm flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-[var(--color-accent-700)] mt-0.5 shrink-0" />
                            <p className="text-[var(--color-neutral-900)]">
                                Check je inbox: we hebben een inloglink gestuurd naar{" "}
                                <strong>{email}</strong>. De link is kort geldig.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-[var(--color-neutral-900)]">
                                    E-mailadres
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jij@bedrijf.nl"
                                    className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                                />
                            </label>
                            {error && (
                                <p className="text-sm text-[var(--color-error)]">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] hover:bg-[var(--color-action-700)] text-white font-semibold px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
                            >
                                <Mail size={16} />
                                {isLoading ? "Versturen…" : "Stuur inloglink"}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-xs text-[var(--color-neutral-500)] mt-4 text-center">
                    Door in te loggen ga je akkoord met ons{" "}
                    <Link href="/privacy" className="underline underline-offset-2">
                        privacybeleid
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
