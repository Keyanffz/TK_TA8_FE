"use client";

import { CloudOff, FileExclamationPoint, House, RotateCw, ServerCrash, WifiOff, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { HalamanKosong } from "@/components/shared/halaman-kosong";
import { Button, buttonVariants } from "@/components/ui/button";
import { sedangOffline } from "@/lib/api/errors";

type GalatHalaman = Error & { digest?: string };

type JenisGalat = "offline" | "unduhan" | "server" | "aplikasi";

const ISI_GALAT: Record<JenisGalat, { label: string; judul: string; deskripsi: string; ikon: LucideIcon }> = {
  offline: {
    label: "Masalah sambungan",
    judul: "Perangkat Anda tidak tersambung ke internet",
    deskripsi: "Periksa Wi-Fi atau data seluler. Halaman ini dimuat ulang sendiri begitu sambungan kembali.",
    ikon: WifiOff,
  },
  unduhan: {
    label: "Masalah sambungan",
    judul: "Sebagian halaman gagal diunduh",
    deskripsi:
      "Sinyal internet mungkin sedang lemah, atau website sekolah baru saja diperbarui. Muat ulang halaman untuk mengunduhnya lagi.",
    ikon: CloudOff,
  },
  server: {
    label: "Masalah di server sekolah",
    judul: "Data dari server sekolah belum bisa diambil",
    deskripsi: "Gangguannya ada di server sekolah, bukan di perangkat Anda. Coba muat ulang beberapa menit lagi.",
    ikon: ServerCrash,
  },
  aplikasi: {
    label: "Masalah di halaman ini",
    judul: "Halaman ini berhenti bekerja",
    deskripsi: "Ada bagian halaman yang gagal dijalankan di browser Anda. Coba muat ulang halaman.",
    ikon: FileExclamationPoint,
  },
};

/**
 * Sumber galat ditebak dari yang terlihat di browser. Galat yang dilempar di server (Server Component,
 * termasuk data backend yang gagal diambil) selalu membawa digest, dan di produksi pesannya disembunyikan
 * Next.js. ChunkLoadError (nama yang sama di webpack dan Turbopack) berarti file JavaScript halaman gagal
 * diunduh. Selain itu galat terjadi saat halaman dijalankan di browser.
 */
function jenisGalat(error: GalatHalaman, offline: boolean): JenisGalat {
  if (offline) return "offline";
  if (error.name === "ChunkLoadError") return "unduhan";
  if (error.digest) return "server";
  return "aplikasi";
}

/**
 * Saat sambungan putus, isi berganti ke pesan offline. Begitu tersambung lagi halaman langsung dimuat ulang
 * penuh tanpa render ulang lebih dulu, karena bagian yang gagal diunduh saat offline (data atau file
 * JavaScript) tidak ikut diambil ulang oleh retry(). Listener online sengaja tidak dipasang di useEffect:
 * render ulang dari event online yang sama akan melepasnya sebelum sempat dipanggil.
 */
function pantauSambunganGalat(onUbah: () => void): () => void {
  const muatUlang = () => window.location.reload();
  window.addEventListener("offline", onUbah);
  window.addEventListener("online", muatUlang);
  return () => {
    window.removeEventListener("offline", onUbah);
    window.removeEventListener("online", muatUlang);
  };
}

/** Kode kejadian (galat server) atau isi galat (galat di browser) untuk dicocokkan dengan log saat dilaporkan. */
function DetailGalat({ jenis, error }: { jenis: JenisGalat; error: GalatHalaman }) {
  if (jenis === "server" && error.digest) {
    return (
      <p className="mt-5 text-sm text-muted-foreground">
        Kalau masalah ini terus muncul, sebutkan kode kejadian{" "}
        <span className="font-mono font-bold text-foreground">{error.digest}</span> saat melapor.
      </p>
    );
  }
  if (jenis !== "aplikasi") return null;
  return (
    <details className="mt-5 text-sm">
      <summary className="cursor-pointer font-bold text-muted-foreground hover:text-foreground">Detail untuk dilaporkan</summary>
      <p className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-xs break-words">
        {error.name}: {error.message}
      </p>
    </details>
  );
}

type HalamanGalatProps = {
  error: GalatHalaman;
  retry: () => void;
  /** Beranda area untuk galat di halaman. Galat di layout tidak memakainya karena beranda memakai layout yang sama. */
  beranda?: string;
  /** Satu layar penuh dengan panel hijau, untuk galat di layout yang tidak menyisakan navbar atau menu. */
  penuh?: boolean;
};

/** Isi error boundary: menyebut sumber masalah (sambungan, server sekolah, atau halaman) dan jalan keluarnya. */
export function HalamanGalat({ error, retry, beranda, penuh = false }: HalamanGalatProps) {
  const offline = useSyncExternalStore(pantauSambunganGalat, sedangOffline, () => false);
  const jenis = jenisGalat(error, offline);
  const { label, judul, deskripsi, ikon } = ISI_GALAT[jenis];

  const muatUlang = jenis === "server" || jenis === "aplikasi" ? retry : () => window.location.reload();

  return (
    <HalamanKosong
      label={label}
      judul={judul}
      deskripsi={deskripsi}
      ikon={ikon}
      penuh={penuh}
      aksi={
        <>
          <Button onClick={muatUlang}>
            <RotateCw aria-hidden="true" />
            Muat Ulang
          </Button>
          {beranda && jenis === "aplikasi" ? (
            <Link href={beranda} className={buttonVariants({ variant: "outline" })}>
              <House aria-hidden="true" />
              Kembali ke Beranda
            </Link>
          ) : null}
        </>
      }
    >
      <DetailGalat jenis={jenis} error={error} />
    </HalamanKosong>
  );
}
