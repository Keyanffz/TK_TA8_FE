import { useCallback, useEffect, useRef } from "react";
import type { DefaultValues, UseFormReturn } from "react-hook-form";

import { LANGKAH } from "@/components/features/formulir-murid/label-field";
import type { MasukanPendaftaran, NilaiPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";

const AWALAN_KUNCI = "ppdb-draf-v1:";
const MASA_BERLAKU_MS = 7 * 24 * 60 * 60 * 1000;
const JEDA_SIMPAN_MS = 500;

type Draf = { simpanPada: number; langkah: number; isian: Partial<MasukanPendaftaran> };

function isDraf(nilai: unknown): nilai is Draf {
  return (
    typeof nilai === "object" &&
    nilai !== null &&
    "simpanPada" in nilai &&
    typeof nilai.simpanPada === "number" &&
    "langkah" in nilai &&
    typeof nilai.langkah === "number" &&
    Number.isInteger(nilai.langkah) &&
    nilai.langkah >= LANGKAH.dataAnak &&
    nilai.langkah <= LANGKAH.konfirmasi &&
    "isian" in nilai &&
    typeof nilai.isian === "object" &&
    nilai.isian !== null
  );
}

function bacaDraf(kunci: string): Draf | null {
  try {
    const mentah = window.localStorage.getItem(kunci);
    if (mentah === null) return null;
    const draf: unknown = JSON.parse(mentah);
    if (isDraf(draf) && Date.now() - draf.simpanPada < MASA_BERLAKU_MS) return draf;
    window.localStorage.removeItem(kunci);
  } catch {
    // localStorage bisa tertutup (mode privat, izin situs) atau isinya rusak; formulir tetap jalan tanpa draf.
  }
  return null;
}

type DrafPendaftaranProps = {
  form: UseFormReturn<MasukanPendaftaran, unknown, NilaiPendaftaran>;
  langkah: number;
  /** Dipanggil sekali saat draf dipulihkan, dengan langkah terakhir yang dibuka. */
  onPulih: (langkah: number) => void;
  /** Membedakan draf antar formulir dan antar akun di perangkat yang sama. */
  kunci: string;
  nilaiAwal: DefaultValues<MasukanPendaftaran>;
};

/**
 * Isian PPDB yang belum terkirim disimpan di browser pengisi (bukan di server) supaya tidak hilang saat halaman
 * dimuat ulang. NIK dan centang pernyataan tidak ikut disimpan: perangkat bisa dipakai bersama, dan pernyataan
 * harus dicentang dengan sadar. Draf dibuang saat terkirim atau "Mulai dari awal", dan kedaluwarsa 7 hari
 * setelah isian terakhir diubah.
 */
export function useDrafPendaftaran({ form, langkah, onPulih, kunci, nilaiAwal }: DrafPendaftaranProps) {
  const kunciSimpan = AWALAN_KUNCI + kunci;
  const aktif = useRef(false);
  const tertunda = useRef(false);
  const langkahSekarang = useRef(langkah);
  const penunda = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tulis = useCallback(() => {
    tertunda.current = false;
    const draf: Draf = { simpanPada: Date.now(), langkah: langkahSekarang.current, isian: { ...form.getValues(), nik: "", pernyataan: false } };
    try {
      window.localStorage.setItem(kunciSimpan, JSON.stringify(draf));
    } catch {
      // Penyimpanan penuh atau ditutup; isian tetap ada di form, hanya tidak bertahan setelah dimuat ulang.
    }
  }, [form, kunciSimpan]);

  const hapusDraf = useCallback(() => {
    aktif.current = false;
    tertunda.current = false;
    clearTimeout(penunda.current);
    try {
      window.localStorage.removeItem(kunciSimpan);
    } catch {
      // Sama seperti di atas: tanpa akses penyimpanan tidak ada draf yang perlu dihapus.
    }
  }, [kunciSimpan]);

  // Hanya perpindahan langkah oleh pengguna yang menulis; pemulihan sudah menyetel `langkahSekarang`, jadi tidak
  // menimpa draf atau memperpanjang masa berlakunya hanya karena halaman dibuka.
  useEffect(() => {
    if (langkah === langkahSekarang.current) return;
    langkahSekarang.current = langkah;
    if (aktif.current) tulis();
  }, [langkah, tulis]);

  useEffect(() => {
    const draf = bacaDraf(kunciSimpan);
    if (draf) {
      form.reset({ ...nilaiAwal, ...draf.isian });
      langkahSekarang.current = draf.langkah;
      aktif.current = true;
      onPulih(draf.langkah);
    }
    // Pemanggilan tanpa `name` adalah reset form, bukan isian pengguna.
    const langganan = form.watch((_isian, { name }) => {
      if (!name) return;
      aktif.current = true;
      tertunda.current = true;
      clearTimeout(penunda.current);
      penunda.current = setTimeout(tulis, JEDA_SIMPAN_MS);
    });
    return () => {
      langganan.unsubscribe();
      clearTimeout(penunda.current);
      if (tertunda.current) tulis();
    };
  }, [form, kunciSimpan, nilaiAwal, onPulih, tulis]);

  const mulaiDariAwal = () => {
    hapusDraf();
    form.reset(nilaiAwal);
  };

  return { hapusDraf, mulaiDariAwal };
}
