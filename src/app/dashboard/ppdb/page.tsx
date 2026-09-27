import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PendaftaranSaya } from "@/components/features/ppdb/pendaftaran-saya";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { buttonVariants } from "@/components/ui/button";
import { ambilPpdbPublik } from "@/lib/api/publik";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "PPDB" };

export default async function PpdbDashboardPage() {
  const user = await wajibSesi();
  // Halaman PPDB Kepala Sekolah (tabel pendaftar, verifikasi) dikerjakan di Fase 7.
  if (user.role !== "wali_murid") notFound();
  const ppdb = await ambilPpdbPublik();
  const bisaDaftar = ppdb.dibuka && ppdb.sisa_kuota > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="PPDB"
        deskripsi="Daftarkan kakak atau adik yang belum bersekolah di sini. Kalau diterima, anak langsung tertaut ke akun Anda."
        aksi={
          bisaDaftar ? (
            <Link href="/dashboard/ppdb/daftar" className={buttonVariants({ size: "lg" })}>
              Daftarkan Anak
            </Link>
          ) : null
        }
      />
      {bisaDaftar ? null : (
        <KotakPesan nada="menunggu" className="mb-6">
          {ppdb.dibuka ? "Kuota murid baru tahun ini sudah penuh." : "Pendaftaran murid baru sedang ditutup."}{" "}
          <Link href="/ppdb" className="font-bold underline">
            Lihat info PPDB
          </Link>
        </KotakPesan>
      )}
      <h2 className="mb-4 text-lg font-extrabold">Pendaftaran Anda</h2>
      <PendaftaranSaya />
    </div>
  );
}
