import { KotakPesan } from "@/components/shared/kotak-pesan";
import { TombolSalin } from "@/components/shared/tombol-salin";
import type { TagihanDetail } from "@/types/domain";

/** Rekening tujuan transfer dari pengaturan keuangan sekolah (ikut di detail tagihan). */
export function RekeningSekolah({ rekening }: { rekening: TagihanDetail["rekening"] }) {
  if (rekening.length === 0) {
    return <KotakPesan nada="menunggu">Sekolah belum mengisi rekening tujuan transfer. Tanyakan cara pembayaran ke sekolah.</KotakPesan>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {rekening.map((item) => (
        <li key={`${item.bank}-${item.nomor}`} className="rounded-lg border border-border bg-card p-4">
          <p className="font-heading text-sm font-bold text-muted-foreground">{item.bank}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-xl font-extrabold tracking-wider tabular-nums">{item.nomor}</p>
            <TombolSalin teks={item.nomor.replace(/\D/g, "")} label="Salin Nomor" />
          </div>
          <p className="text-sm">a.n. {item.atas_nama}</p>
        </li>
      ))}
    </ul>
  );
}
