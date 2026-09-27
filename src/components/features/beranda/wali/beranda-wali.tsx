"use client";

import Link from "next/link";

import { IlustrasiWali } from "@/components/features/auth/ilustrasi-login";
import { AgendaRingkas, PengumumanRingkas } from "@/components/features/beranda/daftar-ringkas";
import { KegiatanRingkas } from "@/components/features/beranda/kegiatan-ringkas";
import { PanelBeranda } from "@/components/features/beranda/panel-beranda";
import { SapaanBeranda } from "@/components/features/beranda/sapaan-beranda";
import { KartuAnak } from "@/components/features/beranda/wali/kartu-anak";
import { KartuRapor } from "@/components/features/beranda/wali/kartu-rapor";
import { KartuTagihan } from "@/components/features/beranda/wali/kartu-tagihan";
import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { GalatMuat } from "@/components/shared/galat-muat";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardWali } from "@/lib/api/dashboard";
import type { AnakRingkas } from "@/lib/auth/anak-aktif";

const KELAS_ISI = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

export function BerandaWali({ namaWali }: { namaWali: string }) {
  const { anakAktif } = useAnakAktif();

  if (!anakAktif) return <BelumAdaAnak namaWali={namaWali} />;
  return <BerandaAnak namaWali={namaWali} anak={anakAktif} />;
}

function BerandaAnak({ namaWali, anak }: { namaWali: string; anak: AnakRingkas }) {
  const { data, isPending, isError, error, refetch } = useDashboardWali(anak.id);

  return (
    <>
      <SapaanBeranda nama={namaWali}>
        <KartuAnak
          namaPanggilan={data?.anak?.nama_panggilan ?? anak.nama_panggilan}
          namaLengkap={data?.anak?.nama_lengkap}
          kelas={data?.anak ? (data.anak.kelas?.nama ?? null) : anak.kelas}
          fotoUrl={data?.anak ? data.anak.foto_url : anak.foto_url}
          hubungan={data?.anak?.hubungan}
        />
      </SapaanBeranda>
      <div className={`${KELAS_ISI} mt-2 flex flex-col gap-6`}>
        {isPending ? (
          <KerangkaBeranda />
        ) : isError ? (
          <GalatMuat error={error} onCobaLagi={() => void refetch()} />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
              <div className="flex flex-col gap-6">
                <KartuTagihan
                  namaAnak={data.anak?.nama_panggilan ?? anak.nama_panggilan}
                  tagihan={data.tagihan_aktif}
                  totalBelumBayar={data.total_belum_bayar}
                />
                {data.rapor_terbaru ? <KartuRapor rapor={data.rapor_terbaru} /> : null}
              </div>
              {/* Di desktop agenda mengisi kolom samping tagihan; di HP pindah ke paling bawah (B5). */}
              <PanelBeranda judul="Agenda Sekolah" tautan={{ href: "/dashboard/agenda", label: "Kalender" }} className="hidden lg:block">
                <AgendaRingkas agenda={data.agenda_mendatang} />
              </PanelBeranda>
            </div>
            <PanelBeranda judul="Kegiatan Kelas" tautan={{ href: "/dashboard/kegiatan", label: "Semua kegiatan" }}>
              <KegiatanRingkas kegiatan={data.kegiatan_terbaru} />
            </PanelBeranda>
            <PanelBeranda judul="Pengumuman" tautan={{ href: "/dashboard/pengumuman", label: "Semua" }}>
              <PengumumanRingkas pengumuman={data.pengumuman_terbaru} />
            </PanelBeranda>
            <PanelBeranda judul="Agenda Sekolah" tautan={{ href: "/dashboard/agenda", label: "Kalender" }} className="lg:hidden">
              <AgendaRingkas agenda={data.agenda_mendatang} />
            </PanelBeranda>
          </>
        )}
      </div>
    </>
  );
}

/** Wali yang belum menautkan anak (A6): tautkan dengan kode atau daftar PPDB. */
function BelumAdaAnak({ namaWali }: { namaWali: string }) {
  return (
    <>
      <SapaanBeranda nama={namaWali} keterangan="Akun Anda belum terhubung dengan data anak di sekolah." />
      <div className={`${KELAS_ISI} mt-2`}>
        <section className="gerak-masuk flex flex-col gap-6 rounded-xl border-2 border-primary bg-card p-6 shadow-md sm:flex-row sm:items-center">
          <IlustrasiWali className="w-36 shrink-0" />
          <div>
            <h2 className="text-lg font-extrabold">Hubungkan akun dengan anak Anda</h2>
            <p className="mt-1 text-muted-foreground">
              Kalau anak sudah bersekolah di sini, minta kode tautan ke sekolah lalu masukkan bersama tanggal lahir anak.
              Kalau anak belum terdaftar, daftarkan lewat PPDB.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/anak" className={buttonVariants({ size: "lg" })}>
                Tautkan Anak
              </Link>
              <Link href="/dashboard/ppdb" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Daftar PPDB
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function KerangkaBeranda() {
  return (
    <div aria-busy="true" aria-label="Memuat beranda" className="flex flex-col gap-6">
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
