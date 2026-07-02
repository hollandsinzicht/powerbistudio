"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// De studio-omgeving (/studio) is een apart product met een eigen shell
// (StudioShell). Daar horen de marketing-navbar en -footer niet; op alle andere
// pagina's wel. Eén plek die dat beslist.
export default function ChromeGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isStudio = pathname?.startsWith("/studio") ?? false;

    if (isStudio) {
        return <main className="flex-grow">{children}</main>;
    }

    return (
        <>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </>
    );
}
