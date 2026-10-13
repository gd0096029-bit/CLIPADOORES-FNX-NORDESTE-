import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Fênix · Clipadores",
  description: "Área do clipador Fênix: envie clipes, acompanhe suas views e o ranking do mês.",
};

export const viewport: Viewport = {
  themeColor: "#E8552F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
