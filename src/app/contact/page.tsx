"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2, Linkedin, Clock, Calendar } from "lucide-react";

const AANVRAAG_TYPES = [
    { value: "", label: "Selecteer een onderwerp..." },
    { value: "interim", label: "Interim opdracht" },
    { value: "saas", label: "Architectuurreview (ISV/SaaS)" },
    { value: "fabric", label: "Fabric migratie / QuickScan" },
    { value: "copilot", label: "Copilot Readiness Audit" },
    { value: "publieke-sector", label: "Power BI voor zorg & overheid" },
    { value: "dashportal", label: "DashPortal" },
    { value: "anders", label: "Iets anders" },
];

export default function ContactPage() {
    return (
        <Suspense>
            <ContactContent />
        </Suspense>
    );
}

function ContactContent() {
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        type: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        if (typeParam) {
            const match = AANVRAAG_TYPES.find((t) => t.value === typeParam);
            if (match) setFormData((prev) => ({ ...prev, type: match.value }));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsSubmitted(true);
                setFormData({ name: "", email: "", company: "", type: "", message: "" });
            } else {
                alert("Er ging iets mis. Probeer het opnieuw of mail direct naar info@powerbistudio.nl");
            }
        } catch {
            alert("Er ging iets mis. Probeer het opnieuw of mail direct naar info@powerbistudio.nl");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Laten we <span className="text-[var(--accent)]">kennismaken</span>
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                        Interim opdracht, architectuurreview, DashPortal of adviesgesprek?
                        Neem contact op. Jan Willem leest elk bericht zelf en reageert binnen één werkdag.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* Form */}
                    <div className="w-full lg:w-3/5">
                        <div className="glass-card p-8 md:p-12 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-5 blur-[100px] pointer-events-none rounded-full" />

                            <h2 className="text-2xl font-display font-bold mb-8 relative z-10">Stuur een bericht</h2>

                            {isSubmitted ? (
                                <div className="flex flex-col items-center justify-center h-80 text-center">
                                    <div className="w-20 h-20 bg-[rgba(34,197,94,0.1)] rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 size={40} className="text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Bericht verzonden</h3>
                                    <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                                        Bedankt! Jan Willem leest elk bericht zelf en reageert binnen één werkdag.
                                        Geen automatische opvolging, geen sales-funnel.
                                    </p>
                                    <button onClick={() => setIsSubmitted(false)} className="mt-8 text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
                                        Stuur nog een bericht
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Naam *</label>
                                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="Naam" />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">E-mailadres *</label>
                                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="E-mail" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Organisatie (optioneel)</label>
                                        <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="De naam van je bedrijf" />
                                    </div>

                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Waar gaat je vraag over? *</label>
                                        <select id="type" name="type" value={formData.type} onChange={handleChange} required className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors">
                                            {AANVRAAG_TYPES.map((t) => (
                                                <option key={t.value} value={t.value} disabled={t.value === ""}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Bericht *</label>
                                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" placeholder="Typ hier jouw vraag of omschrijf de opdracht..." />
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-lg font-medium flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
                                        {isSubmitting ? "Bezig met verzenden..." : (
                                            <>Verstuur bericht <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-2/5 flex flex-col gap-6">
                        {/* Calendly */}
                        <div className="glass-card p-8 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[rgba(245,158,11,0.1)] rounded-full flex items-center justify-center shrink-0 border border-[rgba(245,158,11,0.2)]">
                                    <Calendar size={24} className="text-[var(--accent)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-medium text-[var(--text-primary)] mb-2">Liever direct plannen?</h3>
                                    <p className="text-[var(--text-secondary)] text-sm mb-3">
                                        Kies zelf een moment — anders krijg je binnen één werkdag een reactie van Jan Willem.
                                    </p>
                                    <a href="https://calendly.com/powerbistudio-info/30min" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:gap-3 transition-all">
                                        Plan een gesprek via Calendly <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="glass-card p-8 rounded-2xl flex items-start gap-4 hover:border-[var(--accent)] transition-colors group cursor-pointer" onClick={() => window.location.href = "mailto:info@powerbistudio.nl"}>
                            <div className="w-12 h-12 bg-[rgba(59,130,246,0.1)] rounded-full flex items-center justify-center shrink-0 border border-[rgba(59,130,246,0.2)]">
                                <Mail size={24} className="text-[var(--accent)]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-medium text-[var(--text-primary)] mb-2">E-mail</h3>
                                <a href="mailto:info@powerbistudio.nl" className="text-[var(--accent)] font-medium hover:underline">
                                    info@powerbistudio.nl
                                </a>
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="glass-card p-8 rounded-2xl flex items-start gap-4 hover:border-[#0077b5] transition-colors group cursor-pointer" onClick={() => window.open("https://www.linkedin.com/in/jan-willem-den-hollander/", "_blank")}>
                            <div className="w-12 h-12 bg-[rgba(0,119,181,0.1)] rounded-full flex items-center justify-center shrink-0 border border-[rgba(0,119,181,0.2)]">
                                <Linkedin size={24} className="text-[#0077b5]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-medium text-[var(--text-primary)] mb-2">LinkedIn</h3>
                                <a href="https://www.linkedin.com/in/jan-willem-den-hollander/" target="_blank" rel="noreferrer" className="text-[#0077b5] font-medium hover:underline">
                                    Bekijk profiel
                                </a>
                            </div>
                        </div>

                        {/* Beschikbaarheid */}
                        <div className="glass-card p-8 rounded-2xl flex items-start gap-4">
                            <div className="w-12 h-12 bg-[rgba(34,197,94,0.1)] rounded-full flex items-center justify-center shrink-0 border border-[rgba(34,197,94,0.2)] relative">
                                <Clock size={24} className="text-green-500 relative z-10" />
                                <span className="absolute inset-0 border border-green-500 rounded-full animate-ping opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-medium text-[var(--text-primary)] mb-2">Beschikbaarheid</h3>
                                <p className="text-[var(--text-secondary)] text-sm">
                                    Beschikbaar voor interim opdrachten en adviesgesprekken.
                                </p>
                            </div>
                        </div>

                        {/* Reactietijd */}
                        <p className="text-xs text-[var(--text-secondary)] text-center">
                            Jan Willem leest alle berichten zelf en reageert binnen één werkdag.
                            Geen automatische opvolging, geen sales-funnel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
