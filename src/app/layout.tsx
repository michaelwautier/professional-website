import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist, Geist_Mono, Instrument_Serif, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Polices des sites clients : déclarées partout, mais téléchargées seulement quand un style les utilise.
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], preload: false });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  title: { default: "Site professionnel", template: "%s" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} ${playfair.variable} ${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
