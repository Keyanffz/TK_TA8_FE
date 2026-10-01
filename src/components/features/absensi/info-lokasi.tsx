"use client";

import { LocateFixed, RotateCw } from "lucide-react";

import type { StatusLokasi } from "@/components/features/absensi/use-lokasi";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { jarakMeter } from "@/lib/absensi";
import type { AbsensiHariIni } from "@/types/domain";

type InfoLokasiProps = { lokasi: StatusLokasi; onCari: () => void; aturan: Pick<AbsensiHariIni, "lokasi" | "radius_meter" | "batas_akurasi_meter"> };

/**
 * Jarak ke sekolah dan akurasi GPS sebagai info sebelum mengirim. Peringatan di sini tidak menghalangi
 * pengiriman: yang memutuskan tetap backend.
 */
export function InfoLokasi({ lokasi, onCari, aturan }: InfoLokasiProps) {
  if (lokasi.tahap === "gagal") {
    return (
      <KotakPesan nada="bahaya" judul="Lokasi belum didapat">
        <p>{lokasi.pesan}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onCari}>
          <RotateCw aria-hidden="true" />
          Coba Lagi
        </Button>
      </KotakPesan>
    );
  }

  if (lokasi.tahap !== "dapat") {
    return (
      <p role="status" className="flex items-center gap-2 rounded-md bg-muted px-4 py-3 text-sm">
        <LocateFixed aria-hidden="true" className="size-4 animate-pulse motion-reduce:animate-none" />
        Mencari lokasi Anda. Izinkan akses lokasi kalau browser bertanya.
      </p>
    );
  }

  const { posisi } = lokasi;
  const jarak = aturan.lokasi ? Math.ceil(jarakMeter(posisi, aturan.lokasi)) : null;
  const akurasi = Math.ceil(posisi.akurasi);
  const diLuarArea = jarak !== null && jarak > aturan.radius_meter;
  const akurasiJelek = akurasi > aturan.batas_akurasi_meter;

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-muted px-4 py-3">
          <dt className="text-sm text-muted-foreground">Jarak ke sekolah</dt>
          <dd className="font-heading text-lg font-extrabold tabular-nums">{jarak === null ? "-" : `${jarak} m`}</dd>
          <dd className="text-xs text-muted-foreground">Radius absen {aturan.radius_meter} m</dd>
        </div>
        <div className="rounded-md bg-muted px-4 py-3">
          <dt className="text-sm text-muted-foreground">Akurasi GPS</dt>
          <dd className="font-heading text-lg font-extrabold tabular-nums">±{akurasi} m</dd>
          <dd className="text-xs text-muted-foreground">Batas {aturan.batas_akurasi_meter} m</dd>
        </div>
      </dl>
      {diLuarArea ? (
        <KotakPesan nada="menunggu" judul="Anda terbaca di luar area sekolah">
          Absen hanya diterima dalam radius {aturan.radius_meter} m dari sekolah. Kalau Anda sudah di sekolah, perbarui lokasi.
        </KotakPesan>
      ) : null}
      {akurasiJelek ? (
        <KotakPesan nada="menunggu" judul="Akurasi lokasi kurang baik">
          Nyalakan GPS dan pindah ke tempat terbuka atau dekat jendela, lalu perbarui lokasi.
        </KotakPesan>
      ) : null}
      <Button variant="outline" size="sm" className="self-start" onClick={onCari}>
        <RotateCw aria-hidden="true" />
        Perbarui Lokasi
      </Button>
    </div>
  );
}
