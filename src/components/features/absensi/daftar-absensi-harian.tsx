"use client";

import type { ReactNode } from "react";

import { BuktiTransfer } from "@/components/features/pembayaran/bukti-transfer";
import { StatusBadge } from "@/components/shared/status-badge";
import { urlFotoAbsensi, type AbsensiHarian } from "@/lib/absensi";
import { LABEL_STATUS_ABSENSI } from "@/lib/constants/label";
import { NADA_STATUS_ABSENSI } from "@/lib/constants/status";
import { formatHariTanggal, formatJam, formatTanggalWaktu } from "@/lib/format";
import type { Absensi } from "@/types/domain";

/** Absen tanpa jam yang bukan tanda tidak hadir berarti dicatat Kepala Sekolah lewat koreksi. */
function teksJam(absensi: Absensi | null, teksKosong: string): string {
  if (absensi === null) return teksKosong;
  if (absensi.waktu) return formatJam(absensi.waktu);
  return absensi.dikoreksi_at && absensi.status !== "tidak_hadir" ? "Tanpa jam" : "Tidak ada";
}

/** Alasan yang ditulis peserta sendiri saat izin, sakit, atau pulang lebih awal. */
function KeteranganPeserta({ absensi }: { absensi: Absensi }) {
  const judul = absensi.pulang_awal
    ? "Alasan pulang lebih awal"
    : absensi.status === "izin" || absensi.status === "sakit"
      ? `Keterangan ${LABEL_STATUS_ABSENSI[absensi.status].toLowerCase()}`
      : `Keterangan absen ${absensi.jenis}`;
  return (
    <p className="mt-3 text-sm">
      <span className="font-semibold">{judul}:</span> {absensi.keterangan}
    </p>
  );
}

function CatatanKoreksi({ absensi }: { absensi: Absensi }) {
  return (
    <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm">
      <span className="font-semibold">
        {absensi.jenis === "pulang" ? "Absen pulang dicatat" : "Dikoreksi"}
        {absensi.dikoreksi_oleh ? ` oleh ${absensi.dikoreksi_oleh.nama}` : ""}
        {absensi.dikoreksi_at ? `, ${formatTanggalWaktu(absensi.dikoreksi_at)}` : ""}:
      </span>{" "}
      {absensi.catatan_koreksi}
    </p>
  );
}

function SatuAbsen({ judul, absensi, labelFoto, teksKosong = "Tidak ada" }: { judul: string; absensi: Absensi | null; labelFoto: string; teksKosong?: string }) {
  return (
    <div className="flex items-center gap-3">
      {absensi?.ada_foto ? (
        <BuktiTransfer url={urlFotoAbsensi(absensi.id)} label={`Foto absen ${absensi.jenis} ${labelFoto}`} className="size-14 shrink-0" />
      ) : (
        <span aria-hidden="true" className="size-14 shrink-0 rounded-lg border border-dashed border-border bg-muted" />
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{judul}</p>
        <p className="font-heading font-bold tabular-nums">{teksJam(absensi, teksKosong)}</p>
        {absensi?.jarak_meter != null ? <p className="text-xs text-muted-foreground">{absensi.jarak_meter} m dari sekolah</p> : null}
        {absensi?.pulang_awal ? (
          <StatusBadge nada="menunggu" className="mt-1">
            Pulang lebih awal
          </StatusBadge>
        ) : null}
      </div>
    </div>
  );
}

type KartuAbsensiHarianProps = {
  judul: string;
  subjudul?: string | null;
  masuk: Absensi | null;
  pulang: Absensi | null;
  /** Ditampilkan sebagai badge kalau belum ada absen masuk. */
  labelTanpaMasuk?: string;
  aksi?: ReactNode;
};

/** Absen masuk dan pulang satu hari untuk satu orang, dengan foto dan catatan koreksi. */
export function KartuAbsensiHarian({ judul, subjudul, masuk, pulang, labelTanpaMasuk, aksi }: KartuAbsensiHarianProps) {
  const labelFoto = subjudul ? `${judul}, ${subjudul}` : judul;
  // Hari izin atau sakit memang tidak punya absen pulang.
  const tidakMasuk = masuk?.status === "izin" || masuk?.status === "sakit";
  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-bold">{judul}</h3>
          {subjudul ? <p className="text-sm text-muted-foreground">{subjudul}</p> : null}
        </div>
        {masuk?.status ? (
          <StatusBadge nada={NADA_STATUS_ABSENSI[masuk.status]}>{LABEL_STATUS_ABSENSI[masuk.status]}</StatusBadge>
        ) : masuk === null && labelTanpaMasuk ? (
          <StatusBadge nada="netral">{labelTanpaMasuk}</StatusBadge>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SatuAbsen judul="Masuk" absensi={masuk} labelFoto={labelFoto} />
        <SatuAbsen judul="Pulang" absensi={pulang} labelFoto={labelFoto} teksKosong={tidakMasuk ? "Tidak perlu" : undefined} />
      </div>
      {masuk?.keterangan ? <KeteranganPeserta absensi={masuk} /> : null}
      {pulang?.keterangan ? <KeteranganPeserta absensi={pulang} /> : null}
      {masuk?.catatan_koreksi ? <CatatanKoreksi absensi={masuk} /> : null}
      {pulang?.catatan_koreksi ? <CatatanKoreksi absensi={pulang} /> : null}
      {aksi ? <div className="mt-3 empty:hidden">{aksi}</div> : null}
    </li>
  );
}

type DaftarAbsensiHarianProps = {
  hari: readonly AbsensiHarian[];
  /** Tombol koreksi dan catat absen untuk hari itu, hanya di rekap Kepala Sekolah. */
  aksi?: (hari: AbsensiHarian) => ReactNode;
};

/** Absensi per hari dengan foto, dipakai riwayat pribadi dan detail peserta di rekap. */
export function DaftarAbsensiHarian({ hari, aksi }: DaftarAbsensiHarianProps) {
  return (
    <ul className="flex flex-col gap-3">
      {hari.map((satuHari) => (
        <KartuAbsensiHarian
          key={satuHari.tanggal}
          judul={formatHariTanggal(satuHari.tanggal)}
          masuk={satuHari.masuk}
          pulang={satuHari.pulang}
          aksi={aksi ? aksi(satuHari) : null}
        />
      ))}
    </ul>
  );
}
