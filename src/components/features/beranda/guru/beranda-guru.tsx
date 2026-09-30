"use client";

import { ArrowRight, UsersRound, Wallet } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { AgendaRingkas, PengumumanRingkas } from "@/components/features/beranda/daftar-ringkas";
import { ProgresRapor } from "@/components/features/beranda/guru/progres-rapor";
import { KegiatanRingkas } from "@/components/features/beranda/kegiatan-ringkas";
import { PanelBeranda } from "@/components/features/beranda/panel-beranda";
import { SapaanBeranda } from "@/components/features/beranda/sapaan-beranda";
import { AngkaNaik } from "@/components/shared/angka-naik";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardGuru, type DashboardGuru } from "@/lib/api/dashboard";
import { BERANDA_STAFF } from "@/lib/auth/path";

const KELAS_ISI = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

export function BerandaGuru({ namaGuru }: { namaGuru: string }) {
  const { data, isPending, isError, error, refetch } = useDashboardGuru();
  const namaKelas = data?.kelas_saya.map((kelas) => kelas.nama).join(", ");

  return (
    <>
      <SapaanBeranda nama={namaGuru} keterangan={namaKelas ? `Kelas yang Anda ampu: ${namaKelas}.` : undefined}>
        {data ? <KelasSaya data={data} /> : <Skeleton className="h-24 bg-primary-foreground/15" />}
      </SapaanBeranda>
      <div className={`${KELAS_ISI} mt-2`}>
        {isPending ? (
          <Skeleton aria-label="Memuat beranda" className="h-96 rounded-xl" />
        ) : isError ? (
          <GalatMuat error={error} onCobaLagi={() => void refetch()} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <PanelBeranda judul="Progres Rapor" tautan={{ href: "/mudarris/rapor", label: "Buka rapor" }}>
                <ProgresRapor progres={data.progres_rapor} />
              </PanelBeranda>
              <PanelBeranda judul="Tagihan Jatuh Tempo Bulan Ini" tautan={{ href: "/mudarris/tagihan", label: "Lihat status" }}>
                <KeuanganKelas lunas={data.keuangan_kelas.lunas} belum={data.keuangan_kelas.belum} />
              </PanelBeranda>
            </div>
            <PanelBeranda judul="Kegiatan Kelas Terbaru" tautan={{ href: "/mudarris/kegiatan", label: "Semua kegiatan" }}>
              <KegiatanRingkas kegiatan={data.kegiatan_terbaru} beranda={BERANDA_STAFF} tampilkanKelas />
            </PanelBeranda>
            <div className="grid gap-6 lg:grid-cols-2">
              <PanelBeranda judul="Pengumuman" tautan={{ href: "/mudarris/pengumuman", label: "Semua" }}>
                <PengumumanRingkas pengumuman={data.pengumuman_terbaru} beranda={BERANDA_STAFF} />
              </PanelBeranda>
              <PanelBeranda judul="Agenda Sekolah" tautan={{ href: "/mudarris/agenda", label: "Kalender" }}>
                <AgendaRingkas agenda={data.agenda_mendatang} />
              </PanelBeranda>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Kartu kelas yang diampu, ditambah antrean verifikasi untuk guru petugas keuangan. */
function KelasSaya({ data }: { data: DashboardGuru }) {
  if (data.kelas_saya.length === 0 && data.pembayaran_menunggu === null) {
    return (
      <EmptyState
        ringkas
        className="border-primary-foreground/40 text-foreground"
        judul="Anda belum mengampu kelas di tahun ajaran aktif."
        deskripsi="Kepala Sekolah menentukan wali kelas dan guru pendamping di menu Kelas."
      />
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {data.kelas_saya.map((kelas, indeks) => (
        <li key={kelas.id} className="gerak-masuk" style={{ "--i": indeks + 2 } as CSSProperties}>
          <Link
            href={`/mudarris/kelas/${kelas.id}`}
            className="angkat group flex h-full flex-col rounded-xl bg-card p-4 text-foreground shadow-sm"
          >
            <span className="font-heading text-lg font-extrabold text-primary-strong">{kelas.nama}</span>
            <span className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <UsersRound aria-hidden="true" className="size-4" />
              <span>
                <AngkaNaik nilai={kelas.jumlah_murid} className="font-bold text-foreground" /> murid
              </span>
            </span>
          </Link>
        </li>
      ))}
      {data.pembayaran_menunggu !== null ? (
        <li className="gerak-masuk" style={{ "--i": data.kelas_saya.length + 2 } as CSSProperties}>
          <Link
            href="/mudarris/pembayaran"
            className="angkat group flex h-full flex-col rounded-xl bg-highlight p-4 text-highlight-foreground shadow-sm"
          >
            <span className="flex items-center gap-2 font-heading font-extrabold">
              <Wallet aria-hidden="true" className="size-5" />
              Verifikasi Pembayaran
            </span>
            <span className="mt-2 flex items-center gap-1 text-sm">
              <AngkaNaik nilai={data.pembayaran_menunggu} className="font-bold" /> menunggu
              <ArrowRight aria-hidden="true" className="ml-auto size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      ) : null}
    </ul>
  );
}

function KeuanganKelas({ lunas, belum }: { lunas: number; belum: number }) {
  const total = lunas + belum;
  if (total === 0) {
    return <EmptyState ringkas judul="Belum ada tagihan bulan ini untuk kelas Anda." />;
  }
  const persen = Math.round((lunas / total) * 100);
  return (
    <div>
      <p className="font-heading text-2xl leading-none font-extrabold text-primary-strong">
        {persen}
        <span className="text-lg">%</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">tagihan murid kelas Anda sudah lunas</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-status-bahaya-soft" aria-hidden="true">
        <span className="gerak-tumbuh block h-full origin-left rounded-full bg-primary" style={{ width: `${persen}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Lunas</dt>
          <dd className="font-bold">{lunas} tagihan</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Belum lunas</dt>
          <dd className="font-bold">{belum} tagihan</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">Hanya untuk dilihat. Pembayaran diurus petugas keuangan.</p>
    </div>
  );
}
