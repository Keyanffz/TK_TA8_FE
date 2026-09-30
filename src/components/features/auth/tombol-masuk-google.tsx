"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { TombolMasuk } from "@/components/features/auth/tombol-masuk";
import { usePantauJendelaGoogle } from "@/components/features/auth/use-pantau-jendela-google";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const URL_SKRIP_GOOGLE = "https://accounts.google.com/gsi/client";
const CLIENT_ID_GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Batas lebar tombol dari Google Identity Services. */
const LEBAR_TOMBOL = { min: 200, maks: 400 } as const;

type StatusSkrip = "memuat" | "siap" | "gagal";

type TombolMasukGoogleProps = {
  masuk: (credential: string) => void;
  sedangMemeriksa: boolean;
  sisaJeda: number;
  /** Login password sedang diproses. */
  nonaktif: boolean;
};

/**
 * Tombol resmi Google (Google Identity Services). ID token dari Google
 * diteruskan lewat `masuk` ke BFF `/api/auth/staff/google`; backend yang
 * memverifikasinya dan mencocokkan email ke akun guru atau Kepala Sekolah.
 * Lebar tombol mengikuti wadah, karena Google hanya menerima lebar dalam
 * piksel saat tombol dirender.
 */
export function TombolMasukGoogle({ masuk, sedangMemeriksa, sisaJeda, nonaktif }: TombolMasukGoogleProps) {
  const [skrip, setSkrip] = useState<StatusSkrip>("memuat");
  const [lebar, setLebar] = useState<number | null>(null);
  const wadah = useRef<HTMLDivElement>(null);
  const jendela = usePantauJendelaGoogle();

  // Google memanggil callback yang didaftarkan sekali saat initialize, jadi
  // callback itu membaca handler terbaru lewat ref.
  const terimaKredensial = useRef<(credential: string) => void>(() => undefined);
  useEffect(() => {
    terimaKredensial.current = (credential) => {
      jendela.selesai();
      masuk(credential);
    };
  });

  useEffect(() => {
    const induk = wadah.current;
    if (!induk) return;
    const pengamat = new ResizeObserver(() => {
      // Lebar 0 berarti wadah sedang disembunyikan (memuat atau memeriksa), bukan kolomnya menyempit.
      if (induk.clientWidth === 0) return;
      setLebar(Math.min(LEBAR_TOMBOL.maks, Math.max(LEBAR_TOMBOL.min, induk.clientWidth)));
    });
    pengamat.observe(induk);
    return () => pengamat.disconnect();
  }, []);

  useEffect(() => {
    const google = window.google;
    if (skrip !== "siap" || !google || !CLIENT_ID_GOOGLE) return;
    google.accounts.id.initialize({
      client_id: CLIENT_ID_GOOGLE,
      callback: (respons) => terimaKredensial.current(respons.credential),
      ux_mode: "popup",
      context: "signin",
    });
  }, [skrip]);

  const { mulai: pantauJendela } = jendela;
  useEffect(() => {
    const google = window.google;
    const induk = wadah.current;
    if (skrip !== "siap" || !google || !induk || lebar === null) return;
    // Tombol dirender ulang setiap lebar wadah berubah; tombol lama dibuang supaya tidak menumpuk.
    induk.replaceChildren();
    google.accounts.id.renderButton(induk, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: lebar,
      locale: "id",
      click_listener: pantauJendela,
    });
  }, [skrip, lebar, pantauJendela]);

  if (!CLIENT_ID_GOOGLE) {
    return (
      <KotakPesan nada="menunggu">
        Masuk dengan Google belum disiapkan di server ini. Kepala Sekolah tetap bisa masuk dengan password di atas.
      </KotakPesan>
    );
  }

  const tertahan = sedangMemeriksa || sisaJeda > 0;

  return (
    <div className="flex flex-col gap-3">
      <Script src={URL_SKRIP_GOOGLE} strategy="afterInteractive" onReady={() => setSkrip("siap")} onError={() => setSkrip("gagal")} />
      {jendela.petunjuk ? <KotakPesan nada="menunggu">{jendela.petunjuk}</KotakPesan> : null}
      {skrip === "gagal" ? (
        <KotakPesan nada="bahaya">
          Tombol Masuk dengan Google tidak bisa dimuat. Periksa koneksi internet, lalu muat ulang halaman ini.
        </KotakPesan>
      ) : null}
      {skrip === "memuat" ? <Skeleton aria-label="Memuat tombol Masuk dengan Google" className="h-11 w-full rounded-md" /> : null}
      {tertahan ? <TombolMasuk sedangMemeriksa={sedangMemeriksa} sisaJeda={sisaJeda} /> : null}
      <div
        ref={wadah}
        inert={nonaktif}
        className={cn("min-h-11 w-full transition-opacity", nonaktif && "opacity-50", (skrip !== "siap" || tertahan) && "hidden")}
      />
    </div>
  );
}
