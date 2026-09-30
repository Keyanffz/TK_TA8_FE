import type { Metadata } from "next";
import Link from "next/link";

import { DaftarAnak } from "@/components/features/wali/daftar-anak";
import { FormTambahAnak } from "@/components/features/wali/form-tambah-anak";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Anak Saya" };

export default function AnakPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Anak Saya" deskripsi="Anak yang sudah tertaut dengan akun Anda." />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <DaftarAnak />
        <section aria-labelledby="judul-tambah-anak" className="rounded-xl bg-card p-5 shadow-sm ring-2 ring-highlight">
          <h2 id="judul-tambah-anak" className="text-lg font-extrabold">
            Tambah kakak atau adik
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Untuk anak yang sudah bersekolah di sini. Setelah ditambahkan, semua anak bisa dilihat dari akun ini. Anak yang
            belum terdaftar bisa didaftarkan lewat{" "}
            <Link href="/dashboard/ppdb" className="font-bold text-primary-strong hover:underline">
              PPDB
            </Link>
            .
          </p>
          <FormTambahAnak />
        </section>
      </div>
    </div>
  );
}
