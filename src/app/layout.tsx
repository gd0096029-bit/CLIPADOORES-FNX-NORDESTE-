import type { Metadata, Viewport } from "next";
import { Anton, Barlow } from "next/font/google";
import "./globals.css";

// Mesmas fontes do "QG dos Clipadores": Anton nos títulos, Barlow no texto
const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-title", display: "swap" });

export const metadata: Metadata = {
  title: "Fênix · Clipadores",
  description: "Área do clipador Fênix: envie clipes, acompanhe suas views e o ranking do mês.",
};

export const viewport: Viewport = {
  themeColor: "#0D0906",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
