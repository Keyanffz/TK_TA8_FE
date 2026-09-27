import type { Metadata, Viewport } from "next";
import { Andika, Baloo_2 } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

// Andika dirancang SIL untuk pembaca pemula (bentuk a dan g seperti tulisan tangan
// di sekolah, l/I/1 mudah dibedakan). Hanya punya bobot 400 dan 700.
const andika = Andika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-andika",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
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
  themeColor: "#0d8905",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${andika.variable} ${baloo.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
