import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import "./fonts/fonts.css";
import { TopNav } from "@/components/navigation/top-nav";
import Chatbot from "@/components/ui/chatbot";
import { HeroVisibilityProvider } from "@/lib/contexts/hero-visibility-context";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlanetStoryExplorer",
  description: "Explore satellite imagery stories with Planet Labs design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className={`${montserrat.variable} ${inter.variable} font-sans`}>
        <HeroVisibilityProvider>
          <TopNav />
          {children}
          <Chatbot />
        </HeroVisibilityProvider>
      </body>
    </html>
  );
}
