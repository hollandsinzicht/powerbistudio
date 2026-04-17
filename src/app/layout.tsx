import type { Metadata } from "next";
import { Geist, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Power BI Studio — Power BI architectuur, AI-tools en procesverbetering",
  description: "Power BI Studio: een Nederlands collectief voor Power BI architectuur, Fabric-migratie en transparante AI-tools. 15 jaar ervaring, LSS-methodiek, eigen productstack (ADA & LEX).",
  metadataBase: new URL('https://www.powerbistudio.nl'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-YHED8H8DHL" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YHED8H8DHL');
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1197212833963947');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1197212833963947&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://www.powerbistudio.nl/#organization',
              name: 'Power BI Studio',
              url: 'https://www.powerbistudio.nl',
              logo: 'https://www.powerbistudio.nl/logo.png',
              description: 'Nederlandse studio voor Power BI architectuur, procesverbetering en eigen AI-tools (ADA, LEX). 15 jaar ervaring, LSS Black Belt-methodiek, bewezen in publieke sector, energie en finance.',
              founder: {
                '@type': 'Person',
                name: 'Jan Willem den Hollander',
                jobTitle: 'Oprichter & Power BI architect',
                url: 'https://www.powerbistudio.nl/over',
              },
              knowsAbout: ['Power BI', 'DAX', 'Microsoft Fabric', 'Azure', 'SQL', 'Data Engineering', 'ETL', 'Business Intelligence', 'Lean Six Sigma', 'Power BI Embedded', 'Copilot'],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Diensten',
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Power BI voor SaaS & ISV' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Power BI voor zorg & overheid' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fabric migratie' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Copilot Readiness Audit' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Procesverbetering met Power BI' } },
                ],
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
