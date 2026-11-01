"use client";

import { CameraOff, RotateCw } from "lucide-react";
import Link from "next/link";

import type { GalatKamera } from "@/components/features/absensi/use-kamera";
import { HalamanKosong } from "@/components/shared/halaman-kosong";
import { Button } from "@/components/ui/button";

type IsiGalatKamera = {
  judul: string;
  deskripsi: string;
  /**
   * Tombol yang bisa memperbaiki masalahnya. Izin yang diubah di pengaturan situs baru pasti terbaca setelah
   * halaman dimuat ulang (Safari tidak bertanya lagi di halaman yang sama), jadi izin ditolak memakai muat ulang.
   */
  ulangi: "kamera" | "halaman" | null;
};

export const ISI_GALAT_KAMERA: Record<GalatKamera, IsiGalatKamera> = {
  izin_ditolak: {
    judul: "Izin kamera ditolak",
    deskripsi: "Buka pengaturan situs di browser (ikon di samping alamat situs), izinkan Kamera untuk halaman ini, lalu muat ulang halaman.",
    ulangi: "halaman",
  },
  tidak_ada: {
    judul: "Kamera tidak ditemukan",
    deskripsi: "Browser tidak menemukan kamera di perangkat ini. Buka halaman ini dari HP yang punya kamera depan.",
    ulangi: null,
  },
  dipakai: {
    judul: "Kamera sedang dipakai aplikasi lain",
    deskripsi: "Tutup aplikasi lain yang sedang memakai kamera, misalnya panggilan video, lalu coba lagi.",
    ulangi: "kamera",
  },
  tidak_didukung: {
    judul: "Browser ini tidak bisa membuka kamera",
    deskripsi:
      "Buka halaman ini lewat alamat https sekolah di Chrome atau Safari versi terbaru. Kalau Anda membukanya dari dalam aplikasi lain, salin alamatnya ke Chrome atau Safari.",
    ulangi: null,
  },
  tidak_tampil: {
    judul: "Gambar kamera tidak muncul",
    deskripsi: "Tutup aplikasi lain yang sedang memakai kamera, lalu coba lagi. Kalau masih gagal, muat ulang halaman ini.",
    ulangi: "kamera",
  },
};

type TampilanGalatKameraProps = {
  galat: GalatKamera;
  jenis: "masuk" | "pulang";
  kepalaSekolah: boolean;
  onCobaLagi: () => void;
  onBatal: () => void;
};

/**
 * Pengganti alur absen masuk dan pulang saat kamera tidak bisa dipakai. Foto keduanya hanya dari kamera, jadi
 * tidak ada pilihan galeri. Tampilannya sama dengan halaman error dan 404.
 */
export function TampilanGalatKamera({ galat, jenis, kepalaSekolah, onCobaLagi, onBatal }: TampilanGalatKameraProps) {
  const { judul, deskripsi, ulangi } = ISI_GALAT_KAMERA[galat];

  return (
    <HalamanKosong
      label="Masalah kamera"
      judul={judul}
      deskripsi={deskripsi}
      ikon={CameraOff}
      tagJudul="h2"
      className="px-0 py-6"
      aksi={
        <>
          {ulangi === "kamera" ? (
            <Button onClick={onCobaLagi}>
              <RotateCw aria-hidden="true" />
              Coba Lagi
            </Button>
          ) : null}
          {ulangi === "halaman" ? (
            <Button onClick={() => window.location.reload()}>
              <RotateCw aria-hidden="true" />
              Muat Ulang
            </Button>
          ) : null}
          <Button variant="outline" onClick={onBatal}>
            Batal
          </Button>
        </>
      }
    >
      <p className="mt-5 text-sm text-muted-foreground">
        Foto absen {jenis} harus diambil langsung dari kamera.{" "}
        {kepalaSekolah ? (
          <>
            Kalau kamera tetap tidak bisa dipakai, catat absen Anda sendiri di{" "}
            <Link href="/mudarris/absensi/rekap" className="font-bold text-primary-strong underline-offset-4 hover:underline">
              Rekap Absensi
            </Link>
            .
          </>
        ) : (
          "Kalau kamera tetap tidak bisa dipakai, hubungi Kepala Sekolah supaya absen Anda dicatat."
        )}
      </p>
    </HalamanKosong>
  );
}
