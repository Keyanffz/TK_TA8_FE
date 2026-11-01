"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TampilanGalatKamera } from "@/components/features/absensi/galat-kamera";
import { InfoLokasi } from "@/components/features/absensi/info-lokasi";
import { KameraSwafoto } from "@/components/features/absensi/kamera-swafoto";
import { useKamera } from "@/components/features/absensi/use-kamera";
import { useLokasi, type StatusLokasi } from "@/components/features/absensi/use-lokasi";
import { KolomArea } from "@/components/shared/kolom-teks";
import { KolomRadio, type OpsiRadio } from "@/components/shared/kolom-radio";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { useAbsen, type IsianAbsen } from "@/lib/api/absensi";
import { ApiError, pesanError } from "@/lib/api/errors";
import { LABEL_STATUS_ABSENSI } from "@/lib/constants/label";
import type { AbsensiHariIni } from "@/types/domain";

/** Pulang lebih awal butuh alasan; izin dan sakit tidak memakai lokasi. */
export type ModeAbsen = "masuk" | "pulang" | "pulang_awal" | "izin_sakit";

type StatusTidakMasuk = "izin" | "sakit";

const JUDUL: Record<ModeAbsen, string> = {
  masuk: "Absen Masuk",
  pulang: "Absen Pulang",
  pulang_awal: "Pulang Lebih Awal",
  izin_sakit: "Izin atau Sakit",
};

// Pulang lebih awal tetap sebuah absen pulang; yang berbeda hanya alasannya.
const TOMBOL_KIRIM: Record<Exclude<ModeAbsen, "izin_sakit">, string> = {
  masuk: "Kirim Absen Masuk",
  pulang: "Kirim Absen Pulang",
  pulang_awal: "Kirim Absen Pulang",
};

const OPSI_TIDAK_MASUK: readonly OpsiRadio<StatusTidakMasuk>[] = [
  { nilai: "sakit", label: "Sakit", keterangan: "Tidak bisa datang karena sakit." },
  { nilai: "izin", label: "Izin", keterangan: "Ada keperluan lain, misalnya acara keluarga." },
];

const MAKS_KETERANGAN = 500;

/** Petunjuk untuk alur yang fotonya boleh dari galeri, misalnya foto surat. */
function petunjukFoto(mode: ModeAbsen, tidakMasuk: StatusTidakMasuk): string | null {
  if (mode === "izin_sakit" && tidakMasuk === "sakit") return "Swafoto, atau foto surat dokter dari galeri kalau ada.";
  if (mode === "izin_sakit" || mode === "pulang_awal") return "Swafoto, atau foto surat izin dari galeri kalau ada.";
  return null;
}

/** Pesan penolakan backend (di luar area, akurasi, di luar jam, hari libur) ditampilkan apa adanya. */
function pesanGagalAbsen(error: unknown): string {
  if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
    const pertama = Object.values(error.errors)[0]?.[0];
    if (pertama) return pertama;
  }
  return pesanError(error);
}

type IsiAlur = { foto: File | null; keterangan: string; tidakMasuk: StatusTidakMasuk; lokasi: StatusLokasi };

/** Isian yang siap dikirim, atau null selama langkah yang wajib untuk mode itu belum lengkap. */
function susunIsian(mode: ModeAbsen, butuhKeterangan: boolean, { foto, keterangan, tidakMasuk, lokasi }: IsiAlur): IsianAbsen | null {
  const alasan = keterangan.trim();
  if (!foto || (butuhKeterangan && alasan === "")) return null;
  if (mode === "izin_sakit") return { jenis: "masuk", status: tidakMasuk, keterangan: alasan, foto };
  if (lokasi.tahap !== "dapat") return null;
  const { latitude, longitude, akurasi } = lokasi.posisi;
  return { jenis: mode === "masuk" ? "masuk" : "pulang", latitude, longitude, akurasi, keterangan: alasan || undefined, foto };
}

type AlurAbsenProps = { mode: ModeAbsen; status: AbsensiHariIni; kepalaSekolah: boolean; onTutup: () => void };

/** Langkah absen di satu layar HP: lokasi (kecuali izin/sakit), alasan bila perlu, lalu foto, kemudian kirim. */
export function AlurAbsen({ mode, status, kepalaSekolah, onTutup }: AlurAbsenProps) {
  const butuhLokasi = mode !== "izin_sakit";
  const butuhKeterangan = mode === "izin_sakit" || mode === "pulang_awal";
  // Absen masuk dan pulang biasa hanya dari kamera; izin, sakit, dan pulang lebih awal boleh memakai foto surat.
  const bolehGaleri = mode !== "masuk" && mode !== "pulang";
  const { lokasi, cari } = useLokasi();
  const [foto, setFoto] = useState<File | null>(null);
  const kamera = useKamera(foto === null);
  const [tidakMasuk, setTidakMasuk] = useState<StatusTidakMasuk>("sakit");
  const [keterangan, setKeterangan] = useState("");
  const absen = useAbsen();
  const galat = absen.isError ? pesanGagalAbsen(absen.error) : null;

  // Lokasi langsung dicari saat alur dibuka supaya sudah terbaca ketika foto selesai diambil.
  useEffect(() => {
    if (butuhLokasi) cari();
  }, [butuhLokasi, cari]);

  if (!bolehGaleri && kamera.status.tahap === "gagal") {
    return (
      <TampilanGalatKamera galat={kamera.status.galat} jenis={mode} kepalaSekolah={kepalaSekolah} onCobaLagi={kamera.bukaLagi} onBatal={onTutup} />
    );
  }

  const isian = susunIsian(mode, butuhKeterangan, { foto, keterangan, tidakMasuk, lokasi });

  const kirim = () => {
    if (!isian) return;
    absen.mutate(isian, {
      onSuccess: (hasil) => {
        toast.success(hasil.message);
        onTutup();
      },
    });
  };

  const nomorFoto = butuhKeterangan ? 3 : 2;
  const petunjuk = petunjukFoto(mode, tidakMasuk);

  return (
    <section aria-labelledby="judul-alur-absen" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 id="judul-alur-absen" className="text-lg font-extrabold">
        {JUDUL[mode]}
      </h2>

      {mode === "izin_sakit" ? (
        <KolomRadio label="1. Alasan tidak masuk" opsi={OPSI_TIDAK_MASUK} nilai={tidakMasuk} onUbah={setTidakMasuk} />
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="font-heading font-bold">1. Lokasi</h3>
          <InfoLokasi lokasi={lokasi} onCari={cari} aturan={status} />
        </div>
      )}

      {butuhKeterangan ? (
        <KolomArea
          label={mode === "pulang_awal" ? "2. Alasan pulang lebih awal" : "2. Keterangan"}
          rows={3}
          maxLength={MAKS_KETERANGAN}
          deskripsi={mode === "pulang_awal" ? "Misalnya menjemput anak atau ada urusan keluarga." : "Misalnya demam sejak semalam atau menghadiri acara keluarga."}
          value={keterangan}
          onChange={(event) => setKeterangan(event.target.value)}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <h3 className="font-heading font-bold">{nomorFoto}. {bolehGaleri ? "Foto" : "Foto wajah"}</h3>
        {petunjuk ? <p className="text-sm text-muted-foreground">{petunjuk}</p> : null}
        <KameraSwafoto kamera={kamera} foto={foto} onFoto={setFoto} bolehGaleri={bolehGaleri} />
      </div>

      {galat ? (
        <KotakPesan nada="bahaya" judul="Absen belum tercatat">
          {galat}
        </KotakPesan>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button size="lg" className="h-14 sm:flex-1" disabled={!isian || absen.isPending} onClick={kirim}>
          {absen.isPending ? "Mengirim..." : mode === "izin_sakit" ? `Kirim Keterangan ${LABEL_STATUS_ABSENSI[tidakMasuk]}` : TOMBOL_KIRIM[mode]}
        </Button>
        <Button size="lg" variant="outline" className="h-14" disabled={absen.isPending} onClick={onTutup}>
          Batal
        </Button>
      </div>
    </section>
  );
}
