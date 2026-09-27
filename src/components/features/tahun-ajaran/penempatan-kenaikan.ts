import type { Kelas, KelasDetail } from "@/types/domain";

export type StatusKenaikan = "naik" | "tinggal" | "lulus";
export type Penempatan = { status: StatusKenaikan; kelasTujuanId: number | null };

// "TK A1" → "1": kelas tujuan disarankan yang nomornya sama (TK A1 naik ke TK B1).
function nomorKelas(nama: string): string {
  return nama.match(/(\d+)\s*$/)?.[1] ?? "";
}

function kelasSetara(asal: KelasDetail, tujuan: readonly Kelas[], tingkat: "A" | "B"): number | null {
  const kandidat = tujuan.filter((kelas) => kelas.tingkat === tingkat);
  const cocok = kandidat.find((kelas) => nomorKelas(kelas.nama) === nomorKelas(asal.nama));
  return (cocok ?? kandidat[0])?.id ?? null;
}

/** Saran awal: Kelompok A naik ke kelas B yang nomornya sama, Kelompok B lulus. */
export function saranPenempatan(asal: KelasDetail, tujuan: readonly Kelas[]): Penempatan {
  if (asal.tingkat === "A") return { status: "naik", kelasTujuanId: kelasSetara(asal, tujuan, "B") };
  return { status: "lulus", kelasTujuanId: null };
}

/** Kelas tujuan wajar untuk status tertentu: naik ke B, tinggal di tingkat yang sama. */
export function kelasTujuanUntuk(asal: KelasDetail, tujuan: readonly Kelas[], status: StatusKenaikan): number | null {
  if (status === "lulus") return null;
  return kelasSetara(asal, tujuan, status === "naik" ? "B" : asal.tingkat);
}

export function penempatanLengkap(penempatan: Penempatan): boolean {
  return penempatan.status === "lulus" || penempatan.kelasTujuanId !== null;
}
