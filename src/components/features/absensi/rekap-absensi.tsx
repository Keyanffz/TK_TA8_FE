"use client";

import { Download } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { DaftarAbsensiHarian } from "@/components/features/absensi/daftar-absensi-harian";
import { DialogKoreksiAbsensi } from "@/components/features/absensi/dialog-koreksi-absensi";
import { PilihBulan, useBulanDipilih } from "@/components/features/absensi/pilih-bulan";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { kelompokkanPerHari } from "@/lib/absensi";
import { ambilEksporRekapAbsensi, useRekapAbsensi, useRiwayatAbsensi } from "@/lib/api/absensi";
import { pesanError } from "@/lib/api/errors";
import { simpanBlob } from "@/lib/api/unduh";
import { formatBulan } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RekapAbsensi as BarisRekap } from "@/types/domain";

const KOLOM = [
  { kunci: "hadir", label: "Hadir" },
  { kunci: "terlambat", label: "Terlambat" },
  { kunci: "tidak_hadir", label: "Tidak hadir" },
  { kunci: "tidak_absen_pulang", label: "Tidak absen pulang" },
] as const;

function DetailPeserta({ peserta, bulan }: { peserta: BarisRekap["user"]; bulan: string }) {
  const { data, isPending, isError, error, refetch } = useRiwayatAbsensi(bulan, peserta.id);

  return (
    <section aria-labelledby="judul-detail-peserta" className="flex flex-col gap-3">
      <h2 id="judul-detail-peserta" className="text-lg font-extrabold">
        {peserta.nama}, {formatBulan(bulan)}
      </h2>
      {isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState ringkas judul="Belum ada absensi di bulan ini." />
      ) : (
        <DaftarAbsensiHarian hari={kelompokkanPerHari(data)} aksi={(masuk) => <DialogKoreksiAbsensi absensi={masuk} nama={peserta.nama} />} />
      )}
    </section>
  );
}

function KartuPeserta({ baris, dipilih, onPilih }: { baris: BarisRekap; dipilih: boolean; onPilih: () => void }) {
  return (
    <li className={cn("rounded-xl border bg-card p-4 shadow-sm", dipilih ? "border-primary" : "border-border")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-bold">{baris.user.nama}</h3>
          {baris.user.jabatan ? <p className="text-sm text-muted-foreground">{baris.user.jabatan}</p> : null}
        </div>
        <Button size="sm" variant={dipilih ? "secondary" : "outline"} aria-pressed={dipilih} onClick={onPilih}>
          {dipilih ? "Tutup Detail" : "Lihat per Hari"}
        </Button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {KOLOM.map(({ kunci, label }) => (
          <div key={kunci}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-heading text-lg font-extrabold tabular-nums">{baris[kunci]}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

/** Rekap absensi per bulan per peserta untuk Kepala Sekolah, dengan detail per hari, koreksi, dan ekspor CSV. */
export function RekapAbsensi() {
  const { bulan, bulanIni, setBulan } = useBulanDipilih();
  const [pesertaId, setPesertaId] = useQueryState("peserta", parseAsInteger);
  const [mengunduh, setMengunduh] = useState(false);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useRekapAbsensi(bulan);
  const dipilih = data?.find((baris) => baris.user.id === pesertaId) ?? null;

  const unduh = async () => {
    setMengunduh(true);
    try {
      simpanBlob(await ambilEksporRekapAbsensi(bulan), `rekap-absensi-${bulan}.csv`);
    } catch (galat) {
      toast.error(pesanError(galat));
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PilihBulan bulan={bulan} bulanIni={bulanIni} onUbah={setBulan} />
        <Button variant="outline" disabled={mengunduh || !data || data.length === 0} onClick={() => void unduh()}>
          <Download aria-hidden="true" />
          {mengunduh ? "Menyiapkan..." : "Unduh CSV"}
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState judul="Belum ada guru aktif." deskripsi="Rekap terisi setelah guru ditambahkan di menu Guru." />
      ) : (
        <div className={cn("grid gap-6 lg:grid-cols-2 lg:items-start", isPlaceholderData && "opacity-60")}>
          <ul className="flex flex-col gap-3">
            {data.map((baris) => (
              <KartuPeserta
                key={baris.user.id}
                baris={baris}
                dipilih={baris.user.id === pesertaId}
                onPilih={() => void setPesertaId(baris.user.id === pesertaId ? null : baris.user.id)}
              />
            ))}
          </ul>
          {dipilih ? (
            <DetailPeserta peserta={dipilih.user} bulan={bulan} />
          ) : (
            <p className="rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground">
              Tekan Lihat per Hari pada salah satu nama untuk melihat jam, foto, dan mengoreksi status.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
