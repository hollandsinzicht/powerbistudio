import type { Metadata } from 'next';
import { Geist, DM_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HR analytics in Power BI — vaste prijzen, AVG-proof | PowerBIStudio',
  description:
    'HR analytics-specialist voor mid-market werkgevers met AFAS, Visma of Nmbrs. Quick Scan €1.950, Foundation €34.500 vast. AVG-by-design. 15 jaar Power BI ervaring.',
  metadataBase: new URL('https://www.powerbistudio.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'PowerBIStudio',
    url: 'https://www.powerbistudio.nl',
  },
};

// Schema.org — ProfessionalService (was Organization). Inclusief NAW,
// founder, kennisgebieden en services-catalogus voor de drie HR-pakketten.
const professionalServiceLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://www.powerbistudio.nl/#organization',
  name: 'Power BI Studio',
  alternateName: 'PowerBIStudio.nl',
  legalName: 'Think Different Media',
  url: 'https://www.powerbistudio.nl',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.powerbistudio.nl/logo.png',
    width: 600,
    height: 60,
  },
  image: 'https://www.powerbistudio.nl/logo.png',
  description:
    'HR analytics-specialist voor mid-market werkgevers (250-2.000 FTE) met AFAS, Visma of Nmbrs. Vaste prijzen, AVG-proof, doorlopende hosting via DashPortal HR.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Papendrecht',
    addressCountry: 'NL',
  },
  taxID: 'NL-KVK-62432168',
  founder: {
    '@type': 'Person',
    '@id': 'https://www.powerbistudio.nl/over#jan-willem',
    name: 'Jan Willem den Hollander',
    jobTitle: 'HR analytics-specialist',
    url: 'https://www.powerbistudio.nl/over',
  },
  sameAs: ['https://www.linkedin.com/in/jan-willem-den-hollander/'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@powerbistudio.nl',
    url: 'https://www.powerbistudio.nl/contact',
    availableLanguage: ['Dutch', 'English'],
  },
  knowsAbout: [
    'Power BI',
    'DAX',
    'Microsoft Fabric',
    'HR analytics',
    'AVG / GDPR',
    'Row-level security',
    'Type-2 historiek',
    'Lean Six Sigma',
    'AFAS',
    'Visma',
    'Nmbrs',
    'Power BI Embedded',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'HR Analytics-pakketten',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'HR Analytics Quick Scan',
          description:
            'Audit van bestaand HR-model in Power BI. 1,5 dag, vaste prijs.',
        },
        price: '1950',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'HR Analytics Foundation',
          description:
            'Volledige implementatie HR-rapportage in Power BI. 6-8 weken, vaste prijs.',
        },
        price: '34500',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'HR Analytics Foundation Plus',
          description:
            'Multi-bron HR-rapportage met maatwerk-dashboards. 8-10 weken.',
        },
        price: '58500',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'DashPortal HR Hosting',
          description:
            'Doorlopende hosting voor HR-dashboards. AVG-proof, branded portaal, monitoring.',
        },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '1250',
          priceCurrency: 'EUR',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        {/* Google Analytics 4 — keuze: behoud GA4, geen Plausible-migratie in
         * deze branch. Cookie-banner voor opt-in volgt in feat/microcopy. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YHED8H8DHL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YHED8H8DHL');
          `}
        </Script>
        {/* Facebook/Meta Pixel verwijderd in feat/seo-metadata —
         * past niet bij AVG-positionering. */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(professionalServiceLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
