"use client";

import { Camera, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { kompresFotoAbsensi, tangkapBingkai } from "@/lib/gambar";

type StatusKamera = { tahap: "menyiapkan" } | { tahap: "aktif" } | { tahap: "gagal"; pesan: string };

const PESAN_TIDAK_DIDUKUNG = "Kamera tidak bisa dibuka langsung di browser ini. Ambil foto lewat tombol di bawah.";

function pesanGalatKamera(galat: unknown): string {
  const nama = galat instanceof DOMException ? galat.name : "";
  if (nama === "NotAllowedError" || nama === "SecurityError") {
    return "Izin kamera ditolak. Izinkan Kamera untuk halaman ini di pengaturan situs browser, atau ambil foto lewat tombol di bawah.";
  }
  if (nama === "NotFoundError" || nama === "OverconstrainedError") {
    return "Kamera depan tidak ditemukan di perangkat ini. Ambil foto lewat tombol di bawah.";
  }
  if (nama === "NotReadableError") {
    return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu, atau ambil foto lewat tombol di bawah.";
  }
  return PESAN_TIDAK_DIDUKUNG;
}

function kameraDidukung(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
}

/** Pratinjau foto yang sudah diambil, dengan URL objek yang dilepas saat foto diganti. */
function PratinjauFoto({ foto, onAmbilUlang }: { foto: File; onAmbilUlang: () => void }) {
  const url = useMemo(() => URL.createObjectURL(foto), [foto]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        <Image src={url} alt="Foto yang akan dikirim" fill unoptimized className="object-cover" />
      </div>
      <Button variant="outline" size="lg" onClick={onAmbilUlang}>
        <RotateCcw aria-hidden="true" />
        Ambil Ulang
      </Button>
    </div>
  );
}

/**
 * Swafoto dari kamera depan lewat getUserMedia. Kalau kamera tidak bisa dibuka (izin ditolak, tidak ada
 * kamera, browser lama), pengguna memakai input file dengan `capture="user"` yang membuka kamera bawaan HP.
 */
export function KameraSwafoto({ foto, onFoto }: { foto: File | null; onFoto: (foto: File | null) => void }) {
  const idCadangan = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [kamera, setKamera] = useState<StatusKamera>(() =>
    kameraDidukung() ? { tahap: "menyiapkan" } : { tahap: "gagal", pesan: PESAN_TIDAK_DIDUKUNG },
  );
  const [galatFoto, setGalatFoto] = useState<string | null>(null);
  const kameraMenyala = foto === null && kamera.tahap !== "gagal";

  useEffect(() => {
    if (!kameraMenyala) return;

    let batal = false;
    let aliran: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((hasil) => {
        if (batal) {
          hasil.getTracks().forEach((jalur) => jalur.stop());
          return;
        }
        aliran = hasil;
        if (videoRef.current) videoRef.current.srcObject = hasil;
      })
      .catch((galat: unknown) => {
        if (!batal) setKamera({ tahap: "gagal", pesan: pesanGalatKamera(galat) });
      });

    return () => {
      batal = true;
      aliran?.getTracks().forEach((jalur) => jalur.stop());
    };
  }, [kameraMenyala]);

  const ambil = async () => {
    const hasil = videoRef.current ? await tangkapBingkai(videoRef.current) : null;
    if (hasil) {
      setGalatFoto(null);
      onFoto(hasil);
    } else {
      setGalatFoto("Kamera belum siap. Tunggu gambar muncul lalu ambil foto lagi.");
    }
  };

  const pilihBerkas = async (berkas: File | undefined) => {
    if (!berkas) return;
    try {
      setGalatFoto(null);
      onFoto(await kompresFotoAbsensi(berkas));
    } catch (galat) {
      console.error("Kompres foto absensi gagal", galat);
      setGalatFoto("Foto tidak bisa diproses. Ambil foto lagi.");
    }
  };

  if (foto) {
    return (
      <PratinjauFoto
        foto={foto}
        onAmbilUlang={() => {
          if (kameraDidukung()) setKamera({ tahap: "menyiapkan" });
          onFoto(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {kamera.tahap === "gagal" ? (
        <>
          <KotakPesan nada="menunggu" judul="Kamera tidak terbuka">
            {kamera.pesan}
          </KotakPesan>
          <label
            htmlFor={idCadangan}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-heading text-base font-bold text-primary-foreground hover:bg-primary-strong"
          >
            <Camera aria-hidden="true" className="size-4" />
            Ambil Foto dengan Kamera HP
          </label>
          <input
            id={idCadangan}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(event) => {
              void pilihBerkas(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-lg bg-foreground">
            {/* Tombol Ambil Foto baru aktif setelah video punya gambar; aliran yang baru dibuka belum punya ukuran. */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Pratinjau kamera depan"
              onLoadedData={() => setKamera({ tahap: "aktif" })}
              className="aspect-[3/4] w-full -scale-x-100 object-cover"
            />
            {kamera.tahap === "menyiapkan" ? (
              <p role="status" className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-background">
                Membuka kamera. Izinkan akses kamera kalau browser bertanya.
              </p>
            ) : null}
          </div>
          <Button size="lg" disabled={kamera.tahap !== "aktif"} onClick={() => void ambil()}>
            <Camera aria-hidden="true" />
            Ambil Foto
          </Button>
        </>
      )}
      {galatFoto ? <KotakPesan nada="bahaya">{galatFoto}</KotakPesan> : null}
    </div>
  );
}
