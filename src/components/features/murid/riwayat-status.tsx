import { StatusBadge } from "@/components/shared/status-badge";
import { LABEL_STATUS_MURID } from "@/lib/constants/label";
import { NADA_STATUS_MURID } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";
import type { RiwayatStatusMurid } from "@/types/domain";

/** Perubahan status murid, terbaru dulu (A2.14). */
export function RiwayatStatus({ riwayat }: { riwayat: RiwayatStatusMurid[] }) {
  return (
    <section aria-labelledby="judul-riwayat-status" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 id="judul-riwayat-status" className="mb-3 text-lg font-extrabold">
        Riwayat status
      </h2>
      {riwayat.length === 0 ? (
        <p className="text-sm text-muted-foreground">Status belum pernah diubah sejak murid tercatat.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {riwayat.map((item) => (
            <li key={item.id} className="border-l-4 border-border pl-3">
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold">{formatTanggal(item.tanggal)}</span>
                <span className="text-muted-foreground">{LABEL_STATUS_MURID[item.status_lama]} menjadi</span>
                <StatusBadge nada={NADA_STATUS_MURID[item.status_baru]}>{LABEL_STATUS_MURID[item.status_baru]}</StatusBadge>
              </p>
              {item.tahun_lulus ? <p className="text-sm">Tahun lulus {item.tahun_lulus}</p> : null}
              {item.sekolah_tujuan ? <p className="text-sm">Pindah ke {item.sekolah_tujuan}</p> : null}
              {item.keterangan ? <p className="text-sm whitespace-pre-line">{item.keterangan}</p> : null}
              <p className="text-xs text-muted-foreground">Diubah oleh {item.diubah_oleh?.nama ?? "akun yang sudah dihapus"}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
