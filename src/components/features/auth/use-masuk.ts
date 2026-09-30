"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ApiError, pesanError } from "@/lib/api/errors";
import { tujuanSetelahMasuk, type HasilMasuk } from "@/lib/auth/masuk";

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
 * Alur bersama login wali, login password Kepala Sekolah, dan login Google:
 * kirim, arahkan ke halaman tujuan, dan terjemahkan penolakan backend menjadi
 * pesan di atas form. `pesanGagal` menentukan teks untuk 401/422: login
 * password memakai satu pesan yang tidak menyebut isian mana yang salah,
 * login Google memakai pesan backend (token tidak sah, email tidak terdaftar).
 */
export function useMasuk<TNilai>({
  kirim,
  pesanGagal,
}: {
  kirim: (nilai: TNilai) => Promise<HasilMasuk>;
  pesanGagal: (error: ApiError) => string;
}) {
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
        setPesan(pesanGagal(error));
      } else if (error.code === "TOO_MANY_REQUESTS" && error.tungguDetik) {
        jeda.mulai(error.tungguDetik);
      } else if (error.code === "TOO_MANY_REQUESTS" || error.code === "ACCOUNT_INACTIVE" || error.status === 503) {
        // Pesan backend untuk akun nonaktif dan layanan yang belum siap (login
        // Google belum dikonfigurasi) sudah menjelaskan penyebab dan langkahnya.
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
