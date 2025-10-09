import type { Metadata } from "next";
import { Inter, Doto } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const doto = Doto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-doto"
});

export const metadata: Metadata = {
  title: "CulturaBuilder - AI Readiness Assessment",
  description: "Enterprise AI & Voice Coding Readiness Assessment - Professional consulting-grade analysis for C-suite decision makers",
  keywords: ["AI transformation", "voice coding", "developer productivity", "ROI assessment", "digital maturity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${doto.variable}`}>
        {children}
      </body>
    </html>
  );
}
