import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy statement | PowerBIStudio',
  description:
    'Privacyverklaring van Power BI Studio (Think Different Media). Welke gegevens worden verwerkt, hoe lang bewaard, en hoe je een verzoek tot inzage of verwijdering doet.',
  alternates: { canonical: 'https://www.powerbistudio.nl/privacy' },
};

/**
 * Privacy statement — placeholder versie.
 *
 * STOP-POINT: definitieve tekst moet door AVG-jurist gecheckt worden voor
 * go-live. Deze placeholder dekt de basis maar is geen juridisch advies.
 *
 * Tot validatie blijven concrete bewaartermijnen, doelbinding en
 * sub-processors-lijst placeholders.
 */
export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-16 md:px-12 md:py-20">
          <p className="eyebrow mb-4">Juridisch</p>
          <h1 className="mb-4">Privacy statement</h1>
          <p className="lead">
            Power BI Studio is een handelsnaam van Think Different Media (KVK
            62432168). Deze pagina beschrijft welke persoonsgegevens worden
            verwerkt op powerbistudio.nl en hoe je je rechten kunt uitoefenen.
          </p>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Laatst bijgewerkt: mei 2026 · Concept-versie — definitieve tekst is in
            review bij een AVG-jurist.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-6 md:px-12">
          <div className="space-y-10 leading-relaxed text-[var(--text-secondary)]">
            <div>
              <h2 className="mb-3">Verwerkingsverantwoordelijke</h2>
              <p>
                Think Different Media, handelend onder de naam Power BI Studio,
                gevestigd in Papendrecht (NL), KVK 62432168. Contact voor
                privacy-vragen via{' '}
                <a
                  href="mailto:info@powerbistudio.nl"
                  className="text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
                >
                  info@powerbistudio.nl
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="mb-3">Welke gegevens verzameld worden</h2>
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  <strong className="text-[var(--text-primary)]">
                    Contactformulier:
                  </strong>{' '}
                  naam, e-mailadres, organisatie (optioneel) en de inhoud van je
                  bericht. Verwerkt op basis van toestemming, doel: beantwoorden
                  van je vraag.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">
                    Lead-magnet downloads (AVG-checklist HR):
                  </strong>{' '}
                  e-mailadres en naam. Verwerkt op basis van toestemming, doel:
                  PDF leveren en relevante vervolg-content sturen. Uitschrijven
                  kan via elke e-mail.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">
                    Tools (Readiness Scan, Kosten Calculator):
                  </strong>{' '}
                  bij doorgeven via e-mail: naam, e-mail en de ingevulde
                  antwoorden. Anders: geen persoonsgegevens, alleen anoniem
                  Google Analytics.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">
                    Analytics:
                  </strong>{' '}
                  Google Analytics 4 met geanonimiseerd IP. Geen
                  cross-site-tracking. Cookie alleen na opt-in via banner.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">
                    Klant-trajecten (na opdracht):
                  </strong>{' '}
                  alle gegevens die jij aanlevert blijven in jouw eigen Microsoft-
                  tenant. Power BI Studio krijgt tijdelijke toegang via guest-
                  account; geen kopie buiten jouw omgeving.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Bewaartermijnen</h2>
              <p>
                E-mail-correspondentie wordt 7 jaar bewaard (fiscale
                bewaarplicht). Lead-magnet contacten worden 2 jaar bewaard, of
                korter als je uitschrijft. Analytics-data wordt 14 maanden
                bewaard volgens GA4-standaard. Klant-projectdata blijft in jouw
                eigen tenant en is niet onder Power BI Studio beheer.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Sub-processors</h2>
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  Brevo (Sendinblue) — e-mail-verzending. Servers in EU.
                </li>
                <li>
                  Supabase — database voor lead-data en blog-content. EU-region.
                </li>
                <li>
                  Vercel — hosting van deze website. EU-region.
                </li>
                <li>
                  Google Analytics 4 — anonieme website-statistieken (alleen na
                  cookie-opt-in).
                </li>
                <li>
                  Anthropic — Claude API voor de DAX Formula Assistant tool.
                  Geen persoonsgegevens verstuurd.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Jouw rechten</h2>
              <p>
                Je hebt het recht op inzage, rectificatie, verwijdering, beperking
                van verwerking, dataportabiliteit en bezwaar. Stuur een verzoek
                naar{' '}
                <a
                  href="mailto:info@powerbistudio.nl"
                  className="text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
                >
                  info@powerbistudio.nl
                </a>
                . Reactie binnen één werkdag. Klacht? De Autoriteit Persoonsgegevens
                is de toezichthouder.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Beveiliging</h2>
              <p>
                Alle data-verwerking gebeurt op TLS-versleutelde verbindingen.
                Lead-data staat in Supabase met row-level security. E-mail-credentials
                worden in versleutelde environment variables bewaard. Geen
                wachtwoorden of credit-cards op deze site — Power BI Studio
                accepteert geen betaling via de website.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-warning)] bg-[var(--color-neutral-50)] p-5 text-sm">
              <p className="mb-2 font-semibold text-[var(--text-primary)]">
                Concept-versie
              </p>
              <p>
                Deze tekst is een werkversie. De definitieve privacy-verklaring
                wordt geverifieerd door een AVG-jurist vóór go-live. Voor concrete
                AVG-vragen tijdens een opdracht: stel ze direct via{' '}
                <Link
                  href="/contact?type=verkennend"
                  className="text-[var(--color-primary-700)] underline underline-offset-4"
                >
                  een verkennend gesprek
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
