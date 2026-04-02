import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Disclaimer } from "@/components/shared/disclaimer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Signal Hub — Market Signal Aggregator",
  description: "Agregateur de signaux de marche : crypto, prediction markets, macro, sentiment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-[#0a0a0a] text-white flex">
        <Sidebar />
        <div className="flex flex-1 flex-col min-h-screen">
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
          <Disclaimer />
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
