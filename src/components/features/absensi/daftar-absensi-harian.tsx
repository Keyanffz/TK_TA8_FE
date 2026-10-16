"use client";

import type { ReactNode } from "react";

import { BuktiTransfer } from "@/components/features/pembayaran/bukti-transfer";
import { StatusBadge } from "@/components/shared/status-badge";
import { urlFotoAbsensi, type AbsensiHarian } from "@/lib/absensi";
import { LABEL_STATUS_ABSENSI } from "@/lib/constants/label";
import { NADA_STATUS_ABSENSI } from "@/lib/constants/status";
import { formatHariTanggal, formatJam, formatTanggalWaktu } from "@/lib/format";
import type { Absensi } from "@/types/domain";

/** Absen masuk berstatus hadir/terlambat tanpa jam berarti dicatat Kepala Sekolah lewat koreksi. */
function teksJam(absensi: Absensi | null): string {
  if (absensi?.waktu) return formatJam(absensi.waktu);
  return absensi?.status === "hadir" || absensi?.status === "terlambat" ? "Tanpa jam" : "Tidak ada";
}

function SatuAbsen({ judul, absensi, labelFoto }: { judul: string; absensi: Absensi | null; labelFoto: string }) {
  return (
    <div className="flex items-center gap-3">
      {absensi?.ada_foto ? (
        <BuktiTransfer url={urlFotoAbsensi(absensi.id)} label={`Foto absen ${absensi.jenis} ${labelFoto}`} className="size-14 shrink-0" />
      ) : (
        <span aria-hidden="true" className="size-14 shrink-0 rounded-lg border border-dashed border-border bg-muted" />
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{judul}</p>
        <p className="font-heading font-bold tabular-nums">{teksJam(absensi)}</p>
        {absensi?.jarak_meter != null ? <p className="text-xs text-muted-foreground">{absensi.jarak_meter} m dari sekolah</p> : null}
      </div>
    </div>
  );
}

type KartuAbsensiHarianProps = {
  judul: string;
  keterangan?: string | null;
  masuk: Absensi | null;
  pulang: Absensi | null;
  /** Ditampilkan sebagai badge kalau belum ada absen masuk. */
  labelTanpaMasuk?: string;
  aksi?: ReactNode;
};

/** Absen masuk dan pulang satu hari untuk satu orang, dengan foto dan catatan koreksi. */
export function KartuAbsensiHarian({ judul, keterangan, masuk, pulang, labelTanpaMasuk, aksi }: KartuAbsensiHarianProps) {
  const labelFoto = keterangan ? `${judul}, ${keterangan}` : judul;
  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-bold">{judul}</h3>
          {keterangan ? <p className="text-sm text-muted-foreground">{keterangan}</p> : null}
        </div>
        {masuk?.status ? (
          <StatusBadge nada={NADA_STATUS_ABSENSI[masuk.status]}>{LABEL_STATUS_ABSENSI[masuk.status]}</StatusBadge>
        ) : masuk === null && labelTanpaMasuk ? (
          <StatusBadge nada="netral">{labelTanpaMasuk}</StatusBadge>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SatuAbsen judul="Masuk" absensi={masuk} labelFoto={labelFoto} />
        <SatuAbsen judul="Pulang" absensi={pulang} labelFoto={labelFoto} />
      </div>
      {masuk?.catatan_koreksi ? (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="font-semibold">
            Dikoreksi{masuk.dikoreksi_oleh ? ` oleh ${masuk.dikoreksi_oleh.nama}` : ""}
            {masuk.dikoreksi_at ? `, ${formatTanggalWaktu(masuk.dikoreksi_at)}` : ""}:
          </span>{" "}
          {masuk.catatan_koreksi}
        </p>
      ) : null}
      {aksi ? <div className="mt-3">{aksi}</div> : null}
    </li>
  );
}

type DaftarAbsensiHarianProps = {
  hari: readonly AbsensiHarian[];
  /** Tombol koreksi untuk absen masuk hari itu, hanya di rekap Kepala Sekolah. */
  aksi?: (masuk: Absensi) => ReactNode;
};

/** Absensi per hari dengan foto, dipakai riwayat pribadi dan detail peserta di rekap. */
export function DaftarAbsensiHarian({ hari, aksi }: DaftarAbsensiHarianProps) {
  return (
    <ul className="flex flex-col gap-3">
      {hari.map(({ tanggal, masuk, pulang }) => (
        <KartuAbsensiHarian key={tanggal} judul={formatHariTanggal(tanggal)} masuk={masuk} pulang={pulang} aksi={aksi && masuk ? aksi(masuk) : null} />
      ))}
    </ul>
  );
}
