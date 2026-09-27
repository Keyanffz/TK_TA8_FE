import type { Metadata } from "next";
import Link from "next/link";

import { DaftarPpdbPublik } from "@/components/features/ppdb/daftar-ppdb-publik";
import { JudulHalaman } from "@/components/shared/judul-halaman";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { buttonVariants } from "@/components/ui/button";
import { ambilPpdbPublik } from "@/lib/api/publik";
import { RUTE_LOGIN, urlLogin } from "@/lib/auth/rute-login";

export const metadata: Metadata = { title: "Daftar PPDB" };

export default async function DaftarPpdbPage() {
  const ppdb = await ambilPpdbPublik();
  const bisaDaftar = ppdb.dibuka && ppdb.sisa_kuota > 0;

  return (
    <>
      <JudulHalaman
        judul="Formulir Pendaftaran Murid Baru"
        deskripsi={ppdb.tahun_ajaran ? `Tahun Ajaran ${ppdb.tahun_ajaran.nama}. Siapkan foto akta kelahiran, Kartu Keluarga, dan pas foto anak.` : undefined}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
        {bisaDaftar ? (
          <>
            <p className="mb-8 text-sm text-muted-foreground">
              Anak Anda yang lain sudah bersekolah di sini?{" "}
              <Link href={urlLogin(RUTE_LOGIN.wali, "/dashboard/ppdb")} className="font-bold text-primary-strong hover:underline">
                Masuk sebagai wali murid
              </Link>{" "}
              lalu daftarkan dari dashboard, supaya adiknya langsung tertaut ke akun Anda.
            </p>
            <DaftarPpdbPublik />
          </>
        ) : (
          <KotakPesan nada="menunggu" judul={ppdb.dibuka ? "Kuota sudah penuh" : "Pendaftaran sedang ditutup"}>
            <p>
              {ppdb.dibuka
                ? "Kuota murid baru tahun ini sudah terisi. Hubungi sekolah untuk menanyakan daftar tunggu."
                : "Formulir bisa diisi saat pendaftaran dibuka. Jadwalnya ada di halaman info PPDB."}
            </p>
            <Link href="/ppdb" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
              Lihat Info PPDB
            </Link>
          </KotakPesan>
        )}
      </div>
    </>
  );
}
