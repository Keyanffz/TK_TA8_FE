"use client";

import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AlurAbsen, type ModeAbsen } from "@/components/features/absensi/alur-absen";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { kelompokkanPerHari, langkahAbsen, type LangkahAbsen } from "@/lib/absensi";
import { useAbsensiHariIni, useRiwayatAbsensi } from "@/lib/api/absensi";
import { LABEL_STATUS_ABSENSI } from "@/lib/constants/label";
import { NADA_STATUS_ABSENSI } from "@/lib/constants/status";
import { formatHariTanggal, formatJam } from "@/lib/format";
import { geserBulan } from "@/lib/tanggal";
import type { Absensi, AbsensiHariIni } from "@/types/domain";

const JUMLAH_RIWAYAT_TERBARU = 5;

function BarisJenis({ judul, jam, absensi, teksKosong = "Belum absen" }: { judul: string; jam: string; absensi: Absensi | null; teksKosong?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="font-heading font-bold">{judul}</p>
        <p className="text-sm text-muted-foreground">{jam}</p>
      </div>
      {absensi === null ? (
        <p className="shrink-0 text-sm whitespace-nowrap text-muted-foreground">{teksKosong}</p>
      ) : (
        <div className="flex shrink-0 flex-col items-end gap-1">
          {absensi.waktu ? <p className="font-heading text-lg leading-none font-extrabold tabular-nums">{formatJam(absensi.waktu)}</p> : null}
          {absensi.status ? <StatusBadge nada={NADA_STATUS_ABSENSI[absensi.status]}>{LABEL_STATUS_ABSENSI[absensi.status]}</StatusBadge> : null}
          {absensi.pulang_awal ? <StatusBadge nada="menunggu">Lebih awal</StatusBadge> : null}
        </div>
      )}
    </div>
  );
}

function KartuStatus({ status }: { status: AbsensiHariIni }) {
  const { masuk, pulang } = status;
  const tidakMasuk = masuk.absensi?.status === "izin" || masuk.absensi?.status === "sakit";
  return (
    <section aria-labelledby="judul-status-absensi" className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-primary px-4 py-3 text-primary-foreground sm:px-5">
        <p className="text-sm text-primary-foreground/90">Hari ini</p>
        <h2 id="judul-status-absensi" className="text-lg font-extrabold">
          {formatHariTanggal(status.tanggal)}
        </h2>
      </div>
      <div className="divide-y divide-border px-4 sm:px-5">
        <BarisJenis judul="Masuk" jam={`${masuk.buka}–${masuk.tutup}, terlambat setelah ${masuk.batas_terlambat}`} absensi={masuk.absensi} />
        <BarisJenis judul="Pulang" jam={`${pulang.buka}–${pulang.tutup}`} absensi={pulang.absensi} teksKosong={tidakMasuk ? "Tidak perlu" : undefined} />
      </div>
    </section>
  );
}

function jamAbsen(absensi: Absensi | null): string {
  return absensi?.waktu ? formatJam(absensi.waktu) : "-";
}

/** Hari-hari sebelum hari ini. Di awal bulan, bulan lalu ikut diambil supaya tetap terisi lima hari. */
function RiwayatTerbaru({ hariIni }: { hariIni: string }) {
  const bulan = hariIni.slice(0, 7);
  const bulanIni = useRiwayatAbsensi(bulan, null);
  const hariBulanIni = kelompokkanPerHari(bulanIni.data ?? []).filter((hari) => hari.tanggal < hariIni);
  const perluBulanLalu = bulanIni.isSuccess && hariBulanIni.length < JUMLAH_RIWAYAT_TERBARU;
  const bulanLalu = useRiwayatAbsensi(geserBulan(bulan, -1), null, { aktif: perluBulanLalu });

  const memuat = bulanIni.isPending || (perluBulanLalu && bulanLalu.isPending);
  const galat = bulanIni.error ?? (perluBulanLalu ? bulanLalu.error : null);
  const hari = [...hariBulanIni, ...(perluBulanLalu ? kelompokkanPerHari(bulanLalu.data ?? []) : [])].slice(0, JUMLAH_RIWAYAT_TERBARU);

  return (
    <section aria-labelledby="judul-riwayat-terbaru" className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <h2 id="judul-riwayat-terbaru" className="px-4 pt-4 font-heading text-lg font-extrabold sm:px-5">
        Riwayat Terbaru
      </h2>
      {memuat ? (
        <div className="flex flex-col gap-2 p-4 sm:px-5">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : galat ? (
        <div className="p-4 sm:px-5">
          <GalatMuat error={galat} onCobaLagi={() => void (bulanIni.isError ? bulanIni.refetch() : bulanLalu.refetch())} />
        </div>
      ) : hari.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground sm:px-5">Belum ada absensi sebelum hari ini.</p>
      ) : (
        <ul className="divide-y divide-border px-4 sm:px-5">
          {hari.map(({ tanggal, masuk, pulang }) => (
            <li key={tanggal} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{formatHariTanggal(tanggal)}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  Masuk {jamAbsen(masuk)}, pulang {jamAbsen(pulang)}
                  {pulang?.pulang_awal ? " (lebih awal)" : ""}
                </p>
              </div>
              {masuk?.status ? <StatusBadge nada={NADA_STATUS_ABSENSI[masuk.status]}>{LABEL_STATUS_ABSENSI[masuk.status]}</StatusBadge> : null}
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/mudarris/absensi/riwayat"
        className="block border-t border-border px-4 py-3 text-center font-heading text-sm font-bold text-primary-strong hover:bg-muted"
      >
        Lihat semua riwayat
      </Link>
    </section>
  );
}

function alurMasihBerlaku(mode: ModeAbsen, langkah: LangkahAbsen, status: AbsensiHariIni): boolean {
  if (mode === "pulang_awal") return status.pulang.boleh_lebih_awal;
  return langkah.boleh && langkah.jenis === (mode === "pulang" ? "pulang" : "masuk");
}

/** Halaman absen guru dan Kepala Sekolah (B4), dirancang untuk dipakai dari HP. */
export function HalamanAbsensi({ kepalaSekolah, bisaLihatRekap }: { kepalaSekolah: boolean; bisaLihatRekap: boolean }) {
  const { data, isPending, isError, error, refetch } = useAbsensiHariIni();
  const [alur, setAlur] = useState<ModeAbsen | null>(null);

  if (isPending) return <Skeleton className="h-72 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const langkah = langkahAbsen(data, kepalaSekolah);
  // Kalau jamnya tutup saat alur masih terbuka, alur ditutup dan keterangan terbaru yang tampil.
  const alurAktif = alur !== null && alurMasihBerlaku(alur, langkah, data) ? alur : null;

  return (
    <div className="flex flex-col gap-4">
      <KartuStatus status={data} />

      {alurAktif ? (
        <AlurAbsen mode={alurAktif} status={data} kepalaSekolah={kepalaSekolah} onTutup={() => setAlur(null)} />
      ) : langkah.boleh ? (
        <div className="flex flex-col gap-2">
          <Button size="lg" className="h-16 text-lg" onClick={() => setAlur(langkah.jenis)}>
            {langkah.jenis === "masuk" ? <LogIn aria-hidden="true" className="size-5" /> : <LogOut aria-hidden="true" className="size-5" />}
            {langkah.jenis === "masuk" ? "Absen Masuk" : "Absen Pulang"}
          </Button>
          {langkah.jenis === "masuk" ? (
            <Button size="lg" variant="outline" className="h-12" onClick={() => setAlur("izin_sakit")}>
              Izin atau Sakit
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <KotakPesan nada="proses">{langkah.keterangan}</KotakPesan>
          {data.pulang.boleh_lebih_awal ? (
            <Button size="lg" variant="outline" className="h-12" onClick={() => setAlur("pulang_awal")}>
              Pulang Lebih Awal
            </Button>
          ) : null}
        </div>
      )}

      <RiwayatTerbaru hariIni={data.tanggal} />

      {bisaLihatRekap ? (
        <nav aria-label="Halaman absensi lain" className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/mudarris/absensi/rekap">Rekap Absensi</Link>
          </Button>
          {kepalaSekolah ? (
            <Button asChild variant="outline">
              <Link href="/mudarris/pengaturan/absensi">Pengaturan Absensi</Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
