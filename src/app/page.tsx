import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, BarChart3, Database, BrainCircuit, LineChart } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.08),transparent_40%)]" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
              Power BI. <span className="text-[var(--accent)]">AI.</span> Resultaat.
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 leading-relaxed max-w-3xl mx-auto">
              Jan Willem den Hollander — 15 jaar Power BI specialist. Ik help
              organisaties die klaar zijn voor de volgende stap: van losse
              Excel-bestanden naar een Power BI omgeving die écht werkt,
              versterkt met AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/over" className="btn-primary w-full sm:w-auto text-lg flex items-center justify-center gap-2">
                Bekijk mijn aanpak <ArrowRight size={20} />
              </Link>
              <Link href="/tools" className="btn-secondary w-full sm:w-auto text-lg">
                Probeer de tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 border-y border-[var(--border)] bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <p className="text-center text-sm font-medium text-[var(--text-secondary)] mb-6 uppercase tracking-wider">
            Vertrouwd door organisaties die data serieus nemen
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {/* Using text representation for now instead of actual SVGs to keep it clean */}
            {["GGDGHOR", "Lyreco", "Vattenfall", "Renewi", "iO", "Technische Unie"].map((client) => (
              <span key={client} className="font-display font-bold text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default">
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning / Expertise */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            <div className="glass-card p-8 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database size={120} />
              </div>
              <Database className="text-[var(--accent)] mb-6" size={32} />
              <h3 className="text-2xl font-display font-bold mb-4">Expertise</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                Specialist in de volledige Microsoft Data stack. Van ruwe data tot board-level inzichten.
              </p>
              <ul className="space-y-2">
                {["Power BI & DAX", "SQL & Datamodellering", "Python & ETL", "Fabric & Azure"].map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-[var(--accent)]" /> {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 size={120} />
              </div>
              <BarChart3 className="text-[var(--accent)] mb-6" size={32} />
              <h3 className="text-2xl font-display font-bold mb-4">Aanpak</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Interim + advies. Geen standaard traject, maar een aanpak die past bij jouw organisatie. Ik bouw dashboards die niet na 6 maanden in de la verdwijnen, maar het fundament worden van jullie besluitvorming.
              </p>
            </div>

            <div className="glass-card p-8 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={120} />
              </div>
              <BrainCircuit className="text-[var(--accent-warm)] mb-6" size={32} />
              <h3 className="text-2xl font-display font-bold mb-4">Visie</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                AI + Power BI is geen toekomstmuziek. Het is nu. De meeste organisaties missen de expertise om die stap te zetten. Dat is precies waar ik help om de brug te slaan tussen data analytics en artificial intelligence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section className="py-24 bg-[var(--surface)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)] rounded-full blur-[150px] opacity-10 pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Tools die voor je werken</h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Ontdek de volwassenheid van jouw data-organisatie, of laat AI je helpen met complexe DAX formules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Tool 1 */}
            <div className="group border border-[var(--border)] bg-[var(--surface)] p-8 rounded-xl hover:border-[var(--accent)] hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all flex flex-col h-full cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-mono px-3 py-1 border border-[var(--border)] rounded">Gratis tool</span>
              </div>
              <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-[var(--accent)] transition-colors">Power BI Readiness Scan</h3>
              <p className="text-[var(--text-secondary)] mb-8 flex-grow">
                Weet jij waar jouw organisatie staat? Beantwoord vragen en ontvang een persoonlijk rapport met jouw BI-volwassenheidsniveau en concrete stappen.
              </p>
              <div className="mt-auto">
                <Link href="/tools/readiness-scan" className="text-[var(--text-primary)] font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  Start de scan <ArrowRight size={18} className="text-[var(--accent)]" />
                </Link>
              </div>
            </div>

            {/* Tool 2 */}
            <div className="group border border-[var(--border)] bg-[var(--surface)] p-8 rounded-xl hover:border-[var(--accent-warm)] hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all flex flex-col h-full cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[rgba(245,158,11,0.1)] text-[var(--accent-warm)] text-xs font-mono px-3 py-1 border border-[rgba(245,158,11,0.2)] rounded flex items-center gap-1">
                  <BrainCircuit size={12} /> AI-powered
                </span>
              </div>
              <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-[var(--accent-warm)] transition-colors">DAX Formula Assistant</h3>
              <p className="text-[var(--text-secondary)] mb-8 flex-grow">
                Beschrijf in gewone taal wat je wilt berekenen, en ontvang de juiste DAX-formule. Of plak een bestaande formule in voor een heldere uitleg.
              </p>
              <div className="mt-auto">
                <Link href="/tools/dax-assistant" className="text-[var(--text-primary)] font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  Open de assistant <ArrowRight size={18} className="text-[var(--accent-warm)]" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cases Preview */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">Impact in de praktijk</h2>
              <p className="text-[var(--text-secondary)] text-lg max-w-xl">
                Van publieke gezondheid tot groothandel. Dashboarding die direct invloed heeft op de resultaten.
              </p>
            </div>
            <Link href="/cases" className="hidden md:flex items-center gap-2 hover:text-[var(--accent)] transition-colors">
              Bekijk alle cases <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-0">
            {[
              {
                name: "GGDGHOR",
                desc: "Centraal dataportaal in Power BI voor 25 GGD-regio's.",
                challenge: "Eén bron van waarheid voor alle gezondheidsdata in Nederland."
              },
              {
                name: "Technische Unie",
                desc: "Complete Power BI structuur met meerdere apps per afdeling.",
                challenge: "Gefragmenteerde data inzichtelijk maken over sales, finance en voorraad."
              },
              {
                name: "Lyreco",
                desc: "Geautomatiseerde finance dashboards en SMT-rapportage.",
                challenge: "Snellere besluitvorming realiseren op basis van real-time financiële data."
              }
            ].map(kase => (
              <div key={kase.name} className="glass-card p-6 flex flex-col">
                <LineChart className="text-[var(--text-secondary)] mb-4 opacity-50" size={24} />
                <h4 className="text-xl font-display font-bold mb-2">{kase.name}</h4>
                <p className="text-sm font-medium text-[var(--accent)] mb-3">{kase.challenge}</p>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{kase.desc}</p>
              </div>
            ))}
          </div>

          <Link href="/cases" className="md:hidden flex items-center justify-center mt-8 gap-2 hover:text-[var(--accent)] transition-colors text-center font-medium">
            Bekijk alle cases <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(59,130,246,0.1)] to-transparent" />
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <h2 className="text-5xl font-display font-bold mb-8">Klaar om te beginnen?</h2>
          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Laten we samen kijken hoe we jouw data voor je kunnen laten werken.
            Geen vrijblijvende rapporten, maar direct resultaat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg">
              Neem direct contact op
            </Link>
            <span className="text-[var(--text-secondary)] sm:mx-4 font-mono">of</span>
            <a href="mailto:info@powerbistudio.nl" className="hover:text-[var(--text-primary)] hover:underline transition-all">
              info@powerbistudio.nl
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
