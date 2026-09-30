"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ApiError, pesanError } from "@/lib/api/errors";
import { tujuanSetelahMasuk, type HasilMasuk } from "@/lib/auth/masuk";
import { RUTE_AKUN_STAFF } from "@/lib/auth/rute-login";

// Pesan backend untuk kode ini sudah menjelaskan penyebab dan langkahnya
// (alasan penolakan, akun nonaktif).
const KODE_PESAN_BACKEND = ["ACCOUNT_REJECTED", "ACCOUNT_INACTIVE"];

// Hitungan detiknya ada di tombol, bukan di sini: kotak pesan adalah
// role="alert", jadi teks yang berubah tiap detik akan dibacakan berulang.
const PESAN_JEDA = "Terlalu banyak percobaan masuk. Tombol Masuk aktif lagi setelah hitungan selesai.";

/**
 * Sisa detik sampai waktu tertentu. Dihitung dari jam, bukan dikurangi per
 * tik, karena interval di tab latar belakang diperlambat browser.
 */
function useHitungMundur() {
  const [selesaiPada, setSelesaiPada] = useState<number | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  useEffect(() => {
    if (selesaiPada === null) return;
    const interval = window.setInterval(() => {
      const waktu = Date.now();
      setSekarang(waktu);
      if (waktu >= selesaiPada) setSelesaiPada(null);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [selesaiPada]);

  const sisa = selesaiPada === null ? 0 : Math.max(0, Math.ceil((selesaiPada - sekarang) / 1000));
  const mulai = (detik: number) => {
    const waktu = Date.now();
    setSekarang(waktu);
    setSelesaiPada(waktu + detik * 1000);
  };
  return { sisa, mulai };
}

/**
 * Alur bersama form login wali dan staff: kirim, arahkan ke halaman tujuan,
 * dan terjemahkan penolakan backend menjadi pesan di atas form.
 */
export function useMasuk<TNilai>({ kirim, pesanGagal }: { kirim: (nilai: TNilai) => Promise<HasilMasuk>; pesanGagal: string }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [pesan, setPesan] = useState<string | null>(null);
  const jeda = useHitungMundur();

  const mutation = useMutation({
    mutationFn: kirim,
    onMutate: () => setPesan(null),
    onSuccess: (user) => {
      router.replace(tujuanSetelahMasuk(user, next));
      router.refresh();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error(pesanError(error));
      } else if (error.status === 401 || error.status === 422) {
        setPesan(pesanGagal);
      } else if (error.code === "TOO_MANY_REQUESTS" && error.tungguDetik) {
        jeda.mulai(error.tungguDetik);
      } else if (error.code === "ACCOUNT_PENDING") {
        router.push(RUTE_AKUN_STAFF.menungguPersetujuan);
      } else if (error.code === "TOO_MANY_REQUESTS" || KODE_PESAN_BACKEND.includes(error.code)) {
        setPesan(error.message);
      } else {
        toast.error(pesanError(error));
      }
    },
  });

  return {
    masuk: (nilai: TNilai) => {
      if (jeda.sisa === 0) mutation.mutate(nilai);
    },
    sedangMemeriksa: mutation.isPending,
    pesan: jeda.sisa > 0 ? PESAN_JEDA : pesan,
    sisaJeda: jeda.sisa,
  };
}
