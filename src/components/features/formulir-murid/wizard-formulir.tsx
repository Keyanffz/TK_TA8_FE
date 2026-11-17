"use client";

import { useRef, type ReactNode } from "react";

import { JUDUL_LANGKAH_FORMULIR, LANGKAH } from "@/components/features/formulir-murid/label-field";
import { PenandaLangkah } from "@/components/features/ppdb/penanda-langkah";
import { Button } from "@/components/ui/button";

type WizardFormulirProps = {
  langkah: number;
  onPindah: (tujuan: number) => void;
  /** Memeriksa isian langkah sekarang; true kalau boleh lanjut. */
  periksaLangkah: () => Promise<boolean>;
  onKirim: () => void;
  memproses: boolean;
  labelKirim: string;
  label: string;
  /** Penanda langkah bisa diklik (ubah data murid). */
  bisaLoncat?: boolean;
  children: ReactNode;
};

/** Kerangka 4 langkah formulir data murid yang dipakai PPDB online dan tambah/ubah murid. */
export function WizardFormulir({ langkah, onPindah, periksaLangkah, onKirim, memproses, labelKirim, label, bisaLoncat, children }: WizardFormulirProps) {
  const atasRef = useRef<HTMLDivElement>(null);
  const terakhir = langkah === LANGKAH.konfirmasi;

  const pindah = (tujuan: number) => {
    onPindah(tujuan);
    atasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const lanjut = async () => {
    if (await periksaLangkah()) pindah(langkah + 1);
  };

  return (
    <div ref={atasRef} className="scroll-mt-24">
      <PenandaLangkah judul={JUDUL_LANGKAH_FORMULIR} aktif={langkah} label={label} onPilih={bisaLoncat ? pindah : undefined} />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          // Enter di kolom isian sebelum langkah terakhir berarti "lanjut", bukan kirim.
          if (terakhir) onKirim();
          else void lanjut();
        }}
      >
        <h2 className="mb-5 text-lg font-extrabold">{JUDUL_LANGKAH_FORMULIR[langkah]}</h2>
        {children}
        <div className="mt-8 flex flex-wrap-reverse justify-between gap-3">
          {langkah > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => pindah(langkah - 1)} disabled={memproses}>
              Kembali
            </Button>
          ) : (
            <span />
          )}
          {/* key berbeda: tanpa itu React memakai ulang elemen tombol dan mengganti type-nya
              menjadi submit di tengah klik, sehingga "Lanjut" langsung mengirim form. */}
          {terakhir ? (
            <Button key="kirim" type="submit" size="lg" disabled={memproses}>
              {memproses ? "Menyimpan..." : labelKirim}
            </Button>
          ) : (
            <Button key="lanjut" type="button" size="lg" onClick={() => void lanjut()}>
              Lanjut ke {JUDUL_LANGKAH_FORMULIR[langkah + 1]}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
