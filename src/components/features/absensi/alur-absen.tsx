"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InfoLokasi } from "@/components/features/absensi/info-lokasi";
import { KameraSwafoto } from "@/components/features/absensi/kamera-swafoto";
import { useLokasi } from "@/components/features/absensi/use-lokasi";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { useAbsen } from "@/lib/api/absensi";
import { ApiError, pesanError } from "@/lib/api/errors";
import type { AbsensiHariIni, JenisAbsensi } from "@/types/domain";

const LABEL_JENIS: Record<JenisAbsensi, string> = { masuk: "Absen Masuk", pulang: "Absen Pulang" };

/** Pesan penolakan backend (di luar area, akurasi, di luar jam, hari libur) ditampilkan apa adanya. */
function pesanGagalAbsen(error: unknown): string {
  if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
    const pertama = Object.values(error.errors)[0]?.[0];
    if (pertama) return pertama;
  }
  return pesanError(error);
}

/** Dua langkah absen di satu layar HP: lokasi lalu swafoto, kemudian kirim. */
export function AlurAbsen({ jenis, status, onTutup }: { jenis: JenisAbsensi; status: AbsensiHariIni; onTutup: () => void }) {
  const { lokasi, cari } = useLokasi();
  const [foto, setFoto] = useState<File | null>(null);
  const absen = useAbsen();
  const galat = absen.isError ? pesanGagalAbsen(absen.error) : null;

  // Lokasi langsung dicari saat alur dibuka supaya sudah terbaca ketika foto selesai diambil.
  useEffect(() => cari(), [cari]);

  const kirim = () => {
    if (lokasi.tahap !== "dapat" || !foto) return;
    absen.mutate(
      { jenis, latitude: lokasi.posisi.latitude, longitude: lokasi.posisi.longitude, akurasi: lokasi.posisi.akurasi, foto },
      {
        onSuccess: (hasil) => {
          toast.success(hasil.message);
          onTutup();
        },
      },
    );
  };

  return (
    <section aria-labelledby="judul-alur-absen" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 id="judul-alur-absen" className="text-lg font-extrabold">
        {LABEL_JENIS[jenis]}
      </h2>

      <div className="flex flex-col gap-3">
        <h3 className="font-heading font-bold">1. Lokasi</h3>
        <InfoLokasi lokasi={lokasi} onCari={cari} aturan={status} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-heading font-bold">2. Foto wajah</h3>
        <KameraSwafoto foto={foto} onFoto={setFoto} />
      </div>

      {galat ? (
        <KotakPesan nada="bahaya" judul="Absen belum tercatat">
          {galat}
        </KotakPesan>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button size="lg" className="h-14 sm:flex-1" disabled={lokasi.tahap !== "dapat" || !foto || absen.isPending} onClick={kirim}>
          {absen.isPending ? "Mengirim..." : `Kirim ${LABEL_JENIS[jenis]}`}
        </Button>
        <Button size="lg" variant="outline" className="h-14" disabled={absen.isPending} onClick={onTutup}>
          Batal
        </Button>
      </div>
    </section>
  );
}
