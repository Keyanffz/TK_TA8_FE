import { Info, Megaphone, TriangleAlert, type LucideIcon } from "lucide-react";

import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NadaInfo } from "@/types/domain";

const GAYA_NADA: Record<NadaInfo, { kelas: string; ikon: LucideIcon; label: string }> = {
  info: { kelas: "border-primary bg-primary-soft text-primary-deep", ikon: Info, label: "Info sekolah" },
  penting: { kelas: "border-highlight-strong bg-highlight-soft text-highlight-foreground", ikon: Megaphone, label: "Penting" },
  peringatan: { kelas: "border-destructive bg-status-bahaya-soft text-status-bahaya", ikon: TriangleAlert, label: "Perhatian" },
};

type InfoSekolahProps = {
  judul: string;
  isi: string;
  nada: NadaInfo;
  berlakuSampai: string | null;
  className?: string;
};

/**
 * Banner dari Kepala Sekolah di beranda wali (`beranda.info_wali`). Isinya teks
 * biasa, jadi baris baru dipertahankan tanpa merender HTML.
 */
export function InfoSekolah({ judul, isi, nada, berlakuSampai, className }: InfoSekolahProps) {
  const gaya = GAYA_NADA[nada];
  const Ikon = gaya.ikon;

  return (
    <section aria-labelledby="judul-info-sekolah" className={cn("flex gap-3 rounded-xl border-l-4 p-4 shadow-sm", gaya.kelas, className)}>
      <Ikon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-heading text-xs font-bold tracking-wide uppercase">{gaya.label}</p>
        <h2 id="judul-info-sekolah" className="font-heading text-base leading-snug font-extrabold text-foreground">
          {judul}
        </h2>
        <p className="mt-1 text-sm whitespace-pre-line text-foreground">{isi}</p>
        {berlakuSampai ? <p className="mt-2 text-xs">Berlaku sampai {formatTanggal(berlakuSampai)}</p> : null}
      </div>
    </section>
  );
}
