import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import "./fonts/fonts.css";
import Chatbot from "@/components/ui/chatbot";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Gotham+SSm:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${montserrat.variable} ${inter.variable} font-sans`}>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
