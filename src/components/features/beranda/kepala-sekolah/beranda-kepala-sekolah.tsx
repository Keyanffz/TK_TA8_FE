"use client";

import { GraduationCap, School, Users, UsersRound } from "lucide-react";
import type { CSSProperties } from "react";

import { AgendaRingkas, PengumumanRingkas } from "@/components/features/beranda/daftar-ringkas";
import { KartuAngka } from "@/components/features/beranda/kartu-angka";
import { GrafikPemasukan } from "@/components/features/beranda/kepala-sekolah/grafik-pemasukan";
import { PerluTindakan } from "@/components/features/beranda/kepala-sekolah/perlu-tindakan";
import { PanelBeranda } from "@/components/features/beranda/panel-beranda";
import { SapaanBeranda } from "@/components/features/beranda/sapaan-beranda";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardKepalaSekolah, type DashboardKepalaSekolah } from "@/lib/api/dashboard";
import { BERANDA_STAFF } from "@/lib/auth/path";
import { formatRupiah } from "@/lib/format";

const KELAS_ISI = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

export function BerandaKepalaSekolah({ nama }: { nama: string }) {
  const { data, isPending, isError, error, refetch } = useDashboardKepalaSekolah();

  return (
    <>
      <SapaanBeranda nama={nama} keterangan="Ringkasan sekolah dan hal yang menunggu keputusan Anda.">
        {data ? <PerluTindakan tertunda={data.tertunda} /> : <Skeleton className="h-28 bg-primary-foreground/15" />}
      </SapaanBeranda>
      <div className={`${KELAS_ISI} mt-2`}>
        {isPending ? (
          <Skeleton aria-label="Memuat beranda" className="h-96 rounded-xl" />
        ) : isError ? (
          <GalatMuat error={error} onCobaLagi={() => void refetch()} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KartuAngka label="Murid aktif" nilai={data.statistik.murid_aktif} ikon={UsersRound} urutan={1} />
              <KartuAngka label="Guru aktif" nilai={data.statistik.guru_aktif} ikon={GraduationCap} urutan={2} />
              <KartuAngka label="Kelas" nilai={data.statistik.kelas} ikon={School} urutan={3} />
              <KartuAngka label="Wali murid" nilai={data.statistik.wali_murid} ikon={Users} urutan={4} />
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
              <PanelBeranda judul="Keuangan Bulan Ini" tautan={{ href: "/mudarris/keuangan/laporan", label: "Laporan" }}>
                <KeuanganBulanIni keuangan={data.keuangan_bulan_ini} />
              </PanelBeranda>
              <PanelBeranda judul="Pemasukan 12 Bulan Terakhir">
                <GrafikPemasukan data={data.grafik_pemasukan} />
              </PanelBeranda>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <PanelBeranda judul="Pengumuman Terbaru" tautan={{ href: "/mudarris/pengumuman", label: "Kelola" }}>
                <PengumumanRingkas pengumuman={data.pengumuman_terbaru} beranda={BERANDA_STAFF} />
              </PanelBeranda>
              <PanelBeranda judul="Agenda Mendatang" tautan={{ href: "/mudarris/agenda", label: "Kelola" }}>
                <AgendaRingkas agenda={data.agenda_mendatang} />
              </PanelBeranda>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function KeuanganBulanIni({ keuangan }: { keuangan: DashboardKepalaSekolah["keuangan_bulan_ini"] }) {
  const persen = Math.min(Math.max(keuangan.persen_lunas, 0), 100);

  return (
    <div>
      <p className="text-sm text-muted-foreground">Tagihan yang jatuh tempo bulan ini</p>
      <p className="font-heading text-xl leading-tight font-extrabold tabular-nums">{formatRupiah(keuangan.total_tagihan)}</p>
      <div
        role="progressbar"
        aria-label="Persentase lunas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={persen}
        className="mt-4 h-3 overflow-hidden rounded-full bg-status-bahaya-soft"
      >
        <span className="gerak-tumbuh block h-full origin-left rounded-full bg-primary" style={{ width: `${persen}%`, "--i": 2 } as CSSProperties} />
      </div>
      <p className="mt-1 text-sm font-bold text-primary-strong">{persen.toLocaleString("id-ID")}% lunas</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-md bg-status-sukses-soft p-3">
          <dt className="text-status-sukses">Terbayar</dt>
          <dd className="font-bold tabular-nums">{formatRupiah(keuangan.terbayar)}</dd>
        </div>
        <div className="rounded-md bg-status-bahaya-soft p-3">
          <dt className="text-status-bahaya">Belum terbayar</dt>
          <dd className="font-bold tabular-nums">{formatRupiah(keuangan.belum_terbayar)}</dd>
        </div>
      </dl>
    </div>
  );
}
