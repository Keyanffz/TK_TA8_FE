import type { Metadata } from "next";
import Link from "next/link";

import { KontenHtml } from "@/components/shared/konten-html";
import { JudulHalaman } from "@/components/shared/judul-halaman";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { buttonVariants } from "@/components/ui/button";
import { ambilPpdbPublik } from "@/lib/api/publik";
import { formatTanggal } from "@/lib/format";

export const metadata: Metadata = { title: "Info PPDB" };

const TUJUAN_PENDAFTARAN = "/login?tab=wali&next=%2Fdashboard%2Fppdb";

export default async function PpdbPage() {
  const ppdb = await ambilPpdbPublik();
  const tahunAjaran = ppdb.tahun_ajaran?.nama;
  const { tanggal_buka: tanggalBuka, tanggal_tutup: tanggalTutup } = ppdb;
  const jadwal = tanggalBuka && tanggalTutup ? `${formatTanggal(tanggalBuka)} – ${formatTanggal(tanggalTutup)}` : null;

  return (
    <>
      <JudulHalaman
        judul="Penerimaan Murid Baru"
        deskripsi={tahunAjaran ? `Pendaftaran murid baru untuk Tahun Ajaran ${tahunAjaran}.` : undefined}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1fr_320px] md:py-14">
        <div className="order-2 md:order-1">
          {ppdb.info ? <KontenHtml html={ppdb.info} /> : <p className="text-muted-foreground">Informasi syarat dan alur pendaftaran belum diisi sekolah.</p>}
        </div>

        <aside className="order-1 h-fit rounded-xl border border-border bg-card p-6 shadow-sm md:order-2">
          {ppdb.dibuka ? (
            <>
              <p className="text-sm font-semibold text-primary-strong">Pendaftaran dibuka</p>
              {jadwal ? <p className="mt-1 text-sm text-muted-foreground">{jadwal}</p> : null}
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Kuota</dt>
                  <dd className="font-heading text-xl font-semibold">{ppdb.kuota}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Sisa tempat</dt>
                  <dd className="font-heading text-xl font-semibold">{ppdb.sisa_kuota}</dd>
                </div>
              </dl>
              {ppdb.sisa_kuota > 0 ? (
                <>
                  <Link href={TUJUAN_PENDAFTARAN} className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}>
                    Daftarkan Anak
                  </Link>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Pendaftaran diisi wali murid di dashboard setelah masuk dengan akun Google.
                  </p>
                </>
              ) : (
                <KotakPesan nada="menunggu" className="mt-6">
                  Kuota tahun ini sudah penuh. Hubungi sekolah untuk menanyakan daftar tunggu.
                </KotakPesan>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Pendaftaran sedang ditutup</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {jadwal ? `Jadwal pendaftaran: ${jadwal}.` : "Jadwal pendaftaran berikutnya akan diumumkan sekolah."}
              </p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
