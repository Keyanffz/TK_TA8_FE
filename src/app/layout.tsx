import type { Metadata, Viewport } from "next";

import { KELAS_FONT } from "@/app/fonts";
import { Providers } from "@/components/providers";

import "./globals.css";

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
    <html lang="id" className={KELAS_FONT}>
      <body className="min-h-dvh" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
