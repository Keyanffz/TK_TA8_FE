import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

// Nilai cadangan. Halaman publik mengganti judul dengan profil.nama_sekolah dari CMS.
export const metadata: Metadata = {
  title: {
    default: "TK Tarbiyathul Athfal 8",
    template: "%s | TK Tarbiyathul Athfal 8",
  },
  description: "Sistem informasi sekolah untuk wali murid, guru, dan Kepala Sekolah.",
};

export const viewport: Viewport = {
  themeColor: "#0a7a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
