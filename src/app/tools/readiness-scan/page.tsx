"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";

type Question = {
    id: number;
    question: string;
    options: { value: number; label: string }[];
};

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "Hoe slaat jouw organisatie data op?",
        options: [
            { value: 1, label: "Vooral in Excel-bestanden op lokale schijven" },
            { value: 2, label: "In een mix van Excel, e-mail en gedeelde mappen" },
            { value: 3, label: "In een CRM/ERP systeem, maar niet centraal ontsloten" },
            { value: 4, label: "In een centrale database of datawarehouse" }
        ]
    },
    {
        id: 2,
        question: "Hoeveel mensen in jouw organisatie maken beslissingen op basis van data?",
        options: [
            { value: 1, label: "Vrijwel niemand — we werken op gevoel" },
            { value: 2, label: "Enkele managers, maar niet structureel" },
            { value: 3, label: "Veel managers, maar ieder met eigen bestanden" },
            { value: 4, label: "De meeste beslissingen zijn datagedreven en gedeeld" }
        ]
    },
    {
        id: 3,
        question: "Gebruikt jullie organisatie al Power BI?",
        options: [
            { value: 1, label: "Nee, nog nooit van gehoord" },
            { value: 2, label: "We hebben er een licentie voor maar doen er weinig mee" },
            { value: 3, label: "We gebruiken het, maar zonder structuur of standaard" },
            { value: 4, label: "We hebben een volwassen Power BI omgeving" }
        ]
    },
    {
        id: 4,
        question: "Hoe worden jullie rapporten nu gedeeld?",
        options: [
            { value: 1, label: "Via e-mail als PDF of Excel" },
            { value: 2, label: "Via gedeelde mappen of SharePoint" },
            { value: 3, label: "Via een BI-tool maar handmatig geüpdatet" },
            { value: 4, label: "Automatisch, real-time beschikbaar voor de juiste mensen" }
        ]
    },
    {
        id: 5,
        question: "Is er iemand verantwoordelijk voor data kwaliteit?",
        options: [
            { value: 1, label: "Nee" },
            { value: 2, label: "Dat regelt iedereen zelf" },
            { value: 3, label: "Er is een informele eigenaar" },
            { value: 4, label: "Ja, formeel belegd" }
        ]
    },
    {
        id: 6,
        question: "Hoe lang duurt het om een managementrapportage te maken?",
        options: [
            { value: 1, label: "Meer dan een week" },
            { value: 2, label: "Enkele dagen" },
            { value: 3, label: "Een halve dag" },
            { value: 4, label: "Het gaat automatisch / real-time" }
        ]
    },
    {
        id: 7,
        question: "Heeft jullie organisatie KPI's gedefinieerd?",
        options: [
            { value: 1, label: "Nee" },
            { value: 2, label: "Informeel, niet schriftelijk vastgelegd" },
            { value: 3, label: "Ja, maar niet consistent gebruikt" },
            { value: 4, label: "Ja, SMART gedefinieerd en gemeten" }
        ]
    },
    {
        id: 8,
        question: "Hoeveel budget is er voor data en BI?",
        options: [
            { value: 1, label: "Geen budget" },
            { value: 2, label: "Ad hoc, geen structureel budget" },
            { value: 3, label: "Beperkt budget, reactief ingezet" },
            { value: 4, label: "Structureel budget, proactief ingezet" }
        ]
    },
    {
        id: 9,
        question: "Wat is de technische volwassenheid van jullie IT-omgeving?",
        options: [
            { value: 1, label: "Geen IT-afdeling, alles ad hoc" },
            { value: 2, label: "Basale IT, weinig cloud" },
            { value: 3, label: "Microsoft 365 omgeving aanwezig" },
            { value: 4, label: "Azure / cloud-first, moderne infrastructuur" }
        ]
    },
    {
        id: 10,
        question: "Wat is jouw grootste pijn rondom data en rapportage nu?",
        options: [
            { value: 1, label: "We hebben geen inzicht in onze eigen cijfers" },
            { value: 2, label: "Iedereen heeft andere cijfers" },
            { value: 3, label: "Rapporten kosten te veel tijd" },
            { value: 4, label: "We missen de vertaalslag van data naar actie" }
        ]
    }
];

type ResultType = {
    level: number;
    title: string;
    message: string;
    recommendations: string[];
};

export default function ReadinessScan() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(0));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<ResultType | null>(null);

    const handleOptionSelect = (value: number) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = value;
        setAnswers(newAnswers);

        // Auto advance after short delay
        if (currentStep < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        }
    };

    const handleNext = () => {
        if (currentStep < QUESTIONS.length - 1 && answers[currentStep] !== 0) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const calculateResult = async () => {
        if (answers.includes(0)) return; // Ensure all answered

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/readiness-scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Failed to calculate results:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = ((currentStep) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-[var(--background)] pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-3xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <Link href="/tools" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 mb-6 text-sm transition-colors">
                        <ArrowLeft size={16} /> Terug naar Tools
                    </Link>
                    <h1 className="text-4xl font-display font-bold mb-4">Power BI Readiness Scan</h1>
                    {!result && (
                        <p className="text-[var(--text-secondary)]">Beantwoord 10 vragen om te zien hoe volwassen jouw datafundament is.</p>
                    )}
                </div>

                {/* Form Container */}
                <div className="glass-card rounded-2xl overflow-hidden relative">

                    {!result ? (
                        <>
                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-[rgba(255,255,255,0.05)]">
                                <div
                                    className="h-full bg-[var(--accent)] transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="p-8 md:p-12">
                                <div className="mb-8">
                                    <span className="text-[var(--accent)] font-mono text-sm tracking-wider uppercase mb-2 block">
                                        Vraag {currentStep + 1} van {QUESTIONS.length}
                                    </span>
                                    <h2 className="text-2xl font-bold font-display leading-snug">
                                        {QUESTIONS[currentStep].question}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {QUESTIONS[currentStep].options.map((option, index) => {
                                        const isSelected = answers[currentStep] === option.value;
                                        const letters = ['A', 'B', 'C', 'D'];
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleOptionSelect(option.value)}
                                                className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ${isSelected
                                                        ? "border-[var(--accent)] bg-[rgba(59,130,246,0.1)] shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                        : "border-[var(--border)] hover:border-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[#1f2937]"
                                                    }`}
                                            >
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm shrink-0 ${isSelected ? "bg-[var(--accent)] text-[var(--text-primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]"
                                                    }`}>
                                                    {letters[index]}
                                                </span>
                                                <span className={`text-base font-medium ${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Navigation */}
                                <div className="mt-12 flex items-center justify-between pt-6 border-t border-[var(--border)]">
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentStep === 0}
                                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] transition-colors"
                                    >
                                        <ArrowLeft size={18} /> Vorige
                                    </button>

                                    {currentStep < QUESTIONS.length - 1 ? (
                                        <button
                                            onClick={handleNext}
                                            disabled={answers[currentStep] === 0}
                                            className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Volgende <ArrowRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={calculateResult}
                                            disabled={answers[currentStep] === 0 || isSubmitting}
                                            className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Bezig met berekenen..." : "Bekijk Resultaat"} <CheckCircle2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Results View */
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-10">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(59,130,246,0.1)] text-[var(--accent)] font-mono text-sm font-bold border border-[rgba(59,130,246,0.2)] mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                    Niveau {result.level}
                                </span>
                                <h2 className="text-4xl font-display font-bold mb-6 text-[var(--text-primary)]">{result.title}</h2>
                                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mx-auto max-w-xl">
                                    {result.message}
                                </p>
                            </div>

                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 md:p-8 mb-10">
                                <h3 className="text-xl font-display font-bold mb-6 text-[var(--text-primary)] border-b border-[var(--border)] pb-4">
                                    Aanbevolen Volgende Stappen
                                </h3>
                                <ul className="space-y-4">
                                    {result.recommendations.map((rec, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-[rgba(245,158,11,0.1)] text-[var(--accent-warm)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center font-bold text-xs">
                                                {i + 1}
                                            </div>
                                            <p className="text-[var(--text-secondary)] leading-relaxed">{rec}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link href="/contact" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                    Plan direct een gesprek <ArrowRight size={18} />
                                </Link>
                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setCurrentStep(0);
                                        setAnswers(Array(QUESTIONS.length).fill(0));
                                    }}
                                    className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={18} /> Plan opnieuw
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
