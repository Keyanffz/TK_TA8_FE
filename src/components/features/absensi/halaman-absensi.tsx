"use client";

import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AlurAbsen } from "@/components/features/absensi/alur-absen";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { langkahAbsen } from "@/lib/absensi";
import { useAbsensiHariIni } from "@/lib/api/absensi";
import { LABEL_STATUS_ABSENSI } from "@/lib/constants/label";
import { NADA_STATUS_ABSENSI } from "@/lib/constants/status";
import { formatHariTanggal, formatJam } from "@/lib/format";
import type { Absensi, AbsensiHariIni, JenisAbsensi } from "@/types/domain";

function BarisJenis({ judul, jam, absensi }: { judul: string; jam: string; absensi: Absensi | null }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="font-heading font-bold">{judul}</p>
        <p className="text-sm text-muted-foreground">{jam}</p>
      </div>
      {absensi === null ? (
        <p className="shrink-0 text-sm whitespace-nowrap text-muted-foreground">Belum absen</p>
      ) : (
        <div className="flex shrink-0 flex-col items-end gap-1">
          {absensi.waktu ? <p className="font-heading text-lg leading-none font-extrabold tabular-nums">{formatJam(absensi.waktu)}</p> : null}
          {absensi.status ? <StatusBadge nada={NADA_STATUS_ABSENSI[absensi.status]}>{LABEL_STATUS_ABSENSI[absensi.status]}</StatusBadge> : null}
        </div>
      )}
    </div>
  );
}

function KartuStatus({ status }: { status: AbsensiHariIni }) {
  const { masuk, pulang } = status;
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
        <BarisJenis judul="Pulang" jam={`${pulang.buka}–${pulang.tutup}`} absensi={pulang.absensi} />
      </div>
    </section>
  );
}

/** Halaman absen guru dan Kepala Sekolah (B4), dirancang untuk dipakai dari HP. */
export function HalamanAbsensi({ kepalaSekolah }: { kepalaSekolah: boolean }) {
  const { data, isPending, isError, error, refetch } = useAbsensiHariIni();
  const [alur, setAlur] = useState<JenisAbsensi | null>(null);

  if (isPending) return <Skeleton className="h-72 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const langkah = langkahAbsen(data);
  // Kalau jamnya tutup saat alur masih terbuka, alur ditutup dan keterangan terbaru yang tampil.
  const alurAktif = alur !== null && langkah.boleh && langkah.jenis === alur ? alur : null;

  return (
    <div className="flex flex-col gap-4">
      <KartuStatus status={data} />

      {alurAktif ? (
        <AlurAbsen jenis={alurAktif} status={data} onTutup={() => setAlur(null)} />
      ) : langkah.boleh ? (
        <Button size="lg" className="h-16 text-lg" onClick={() => setAlur(langkah.jenis)}>
          {langkah.jenis === "masuk" ? <LogIn aria-hidden="true" className="size-5" /> : <LogOut aria-hidden="true" className="size-5" />}
          {langkah.jenis === "masuk" ? "Absen Masuk" : "Absen Pulang"}
        </Button>
      ) : (
        <KotakPesan nada="proses">{langkah.keterangan}</KotakPesan>
      )}

      <nav aria-label="Halaman absensi lain" className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/mudarris/absensi/riwayat">Riwayat Saya</Link>
        </Button>
        {kepalaSekolah ? (
          <>
            <Button asChild variant="outline">
              <Link href="/mudarris/absensi/rekap">Rekap Absensi</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/mudarris/pengaturan/absensi">Pengaturan Absensi</Link>
            </Button>
          </>
        ) : null}
      </nav>
    </div>
  );
}
