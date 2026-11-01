"use client";

import { Camera, Images, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { ISI_GALAT_KAMERA } from "@/components/features/absensi/galat-kamera";
import type { Kamera } from "@/components/features/absensi/use-kamera";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button, buttonVariants } from "@/components/ui/button";
import { kompresFotoAbsensi, tangkapBingkai } from "@/lib/gambar";
import { cn } from "@/lib/utils";

/** Pratinjau foto yang sudah diambil, dengan URL objek yang dilepas saat foto diganti. */
function PratinjauFoto({ foto, onAmbilUlang }: { foto: File; onAmbilUlang: () => void }) {
  const url = useMemo(() => URL.createObjectURL(foto), [foto]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="flex flex-col gap-3">
      {/* object-contain: foto surat dari galeri tampil utuh, tidak terpotong. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        <Image src={url} alt="Foto yang akan dikirim" fill unoptimized className="object-contain" />
      </div>
      <Button variant="outline" size="lg" onClick={onAmbilUlang}>
        <RotateCcw aria-hidden="true" />
        Ambil Ulang
      </Button>
    </div>
  );
}

/** Foto dari galeri atau file, tanpa `capture`, misalnya foto surat dokter atau surat izin. */
function TombolGaleri({ utama, memproses, onPilih }: { utama: boolean; memproses: boolean; onPilih: (berkas: File) => void }) {
  return (
    <label
      className={cn(
        buttonVariants({ variant: utama ? "default" : "outline", size: "lg" }),
        "cursor-pointer has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
        memproses ? "pointer-events-none opacity-50" : undefined,
      )}
    >
      <Images aria-hidden="true" />
      {memproses ? "Memproses foto..." : "Pilih dari Galeri"}
      <input
        type="file"
        accept="image/*"
        disabled={memproses}
        className="sr-only"
        onChange={(event) => {
          const berkas = event.target.files?.[0];
          event.target.value = "";
          if (berkas) onPilih(berkas);
        }}
      />
    </label>
  );
}

type KameraSwafotoProps = {
  kamera: Kamera;
  foto: File | null;
  onFoto: (foto: File | null) => void;
  /** Izin, sakit, dan pulang lebih awal boleh memakai foto dari galeri, misalnya foto surat dokter. */
  bolehGaleri: boolean;
};

/**
 * Swafoto dari kamera depan, ditambah pilihan galeri kalau `bolehGaleri`. Tanpa galeri tidak ada input file
 * cadangan: kamera yang gagal ditangani pemanggil dengan `TampilanGalatKamera`.
 */
export function KameraSwafoto({ kamera, foto, onFoto, bolehGaleri }: KameraSwafotoProps) {
  const { videoRef, status, tandaiTampil, bukaLagi } = kamera;
  const kameraGagal = status.tahap === "gagal" ? status.galat : null;
  const [galatFoto, setGalatFoto] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  const ambil = async () => {
    const hasil = videoRef.current ? await tangkapBingkai(videoRef.current) : null;
    if (hasil) {
      setGalatFoto(null);
      onFoto(hasil);
    } else {
      setGalatFoto("Kamera belum siap. Tunggu gambar muncul lalu ambil foto lagi.");
    }
  };

  const pilihBerkas = async (berkas: File) => {
    // Tipe kosong bisa datang dari HP untuk format yang tidak dikenali browser; yang menolaknya kompresi di bawah.
    if (berkas.type !== "" && !berkas.type.startsWith("image/")) {
      setGalatFoto("File yang dipilih bukan foto. Pilih foto dari galeri. Surat berbentuk PDF perlu difoto dulu.");
      return;
    }
    setGalatFoto(null);
    setMemproses(true);
    try {
      onFoto(await kompresFotoAbsensi(berkas));
    } catch (galat) {
      console.error("Kompres foto absensi gagal", galat);
      setGalatFoto("Foto ini tidak bisa dibaca. Pilih foto lain.");
    } finally {
      setMemproses(false);
    }
  };

  if (foto) {
    return (
      <PratinjauFoto
        foto={foto}
        onAmbilUlang={() => {
          bukaLagi();
          onFoto(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {kameraGagal === null ? (
        <>
          <div className="relative overflow-hidden rounded-lg bg-foreground">
            {/* Tombol Ambil Foto baru aktif setelah video punya gambar; aliran yang baru dibuka belum punya ukuran.
                Pratinjau tidak dicerminkan supaya sama dengan foto yang dikirim. */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Pratinjau kamera depan"
              onLoadedData={tandaiTampil}
              className="aspect-[3/4] w-full object-cover"
            />
            {status.tahap !== "aktif" ? (
              <p role="status" className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-background">
                Membuka kamera. Izinkan akses kamera kalau browser bertanya.
              </p>
            ) : null}
          </div>
          <Button size="lg" disabled={status.tahap !== "aktif"} onClick={() => void ambil()}>
            <Camera aria-hidden="true" />
            Ambil Foto
          </Button>
        </>
      ) : null}
      {bolehGaleri ? (
        <>
          {kameraGagal ? (
            <KotakPesan nada="menunggu" judul={ISI_GALAT_KAMERA[kameraGagal].judul}>
              Pilih foto dari galeri lewat tombol di bawah.
            </KotakPesan>
          ) : null}
          <TombolGaleri utama={kameraGagal !== null} memproses={memproses} onPilih={(berkas) => void pilihBerkas(berkas)} />
        </>
      ) : null}
      {galatFoto ? <KotakPesan nada="bahaya">{galatFoto}</KotakPesan> : null}
    </div>
  );
}
