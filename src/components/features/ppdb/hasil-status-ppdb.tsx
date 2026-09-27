import { StatusBadge } from "@/components/shared/status-badge";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { LABEL_STATUS_PENDAFTARAN, LABEL_TINGKAT } from "@/lib/constants/label";
import { NADA_STATUS_PENDAFTARAN } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";
import type { PendaftaranPublik, StatusPendaftaran } from "@/types/domain";

const PESAN_STATUS: Record<Exclude<StatusPendaftaran, "ditolak">, string> = {
  diajukan: "Formulir sudah masuk dan menunggu pemeriksaan dokumen oleh sekolah.",
  diverifikasi: "Dokumen sudah diperiksa sekolah. Tunggu keputusan akhir.",
  diterima: "Selamat, pendaftaran diterima. Silakan datang ke sekolah untuk daftar ulang dan menerima kartu akun.",
};

export function HasilStatusPpdb({ pendaftaran }: { pendaftaran: PendaftaranPublik }) {
  const { status } = pendaftaran;

  return (
    <section aria-labelledby="judul-status" className="gerak-masuk rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground tabular-nums">{pendaftaran.kode}</p>
          <h2 id="judul-status" className="text-lg font-extrabold">
            {pendaftaran.nama_panggilan}
          </h2>
        </div>
        <StatusBadge nada={NADA_STATUS_PENDAFTARAN[status]}>{LABEL_STATUS_PENDAFTARAN[status]}</StatusBadge>
      </div>
      {status === "ditolak" ? (
        <KotakPesan nada="bahaya" judul="Pendaftaran tidak diterima" className="mt-4">
          {pendaftaran.catatan ? `Alasan: ${pendaftaran.catatan}` : "Hubungi sekolah untuk mengetahui alasannya."}
        </KotakPesan>
      ) : (
        <KotakPesan nada={status === "diterima" ? "sukses" : "proses"} className="mt-4">
          {PESAN_STATUS[status]}
        </KotakPesan>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Tahun Ajaran</dt>
          <dd className="font-bold">{pendaftaran.tahun_ajaran.nama}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Mendaftar ke</dt>
          <dd className="font-bold">{LABEL_TINGKAT[pendaftaran.tingkat_tujuan]}</dd>
        </div>
        {pendaftaran.created_at ? (
          <div>
            <dt className="text-muted-foreground">Dikirim</dt>
            <dd className="font-bold">{formatTanggal(pendaftaran.created_at)}</dd>
          </div>
        ) : null}
        {pendaftaran.diproses_at ? (
          <div>
            <dt className="text-muted-foreground">Terakhir diproses</dt>
            <dd className="font-bold">{formatTanggal(pendaftaran.diproses_at)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
