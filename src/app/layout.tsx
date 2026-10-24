import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import PwaRegistration from "@/components/PwaRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spectra Annual Exhibition 2026-27 | Advanced Academy Indore",
  description: "Spectra visitor passport, exhibition route, six Citizen missions, QR stamp quest and certificate for Advanced Academy Indore.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spectra Passport",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b2340",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-900 font-sans">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
