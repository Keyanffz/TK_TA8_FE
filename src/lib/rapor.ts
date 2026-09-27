import type { Rapor } from "@/types/domain";

/** "rapor-TA20260001-2026-2027-semester-1.pdf", sama dengan nama file dari backend. */
export function namaFileRapor(rapor: Pick<Rapor, "murid" | "tahun_ajaran" | "semester">): string {
  return `rapor-${rapor.murid.nis}-${rapor.tahun_ajaran.nama.replace("/", "-")}-semester-${rapor.semester}.pdf`;
}

/** "Semester 1 · 2026/2027" */
export function periodeRapor(rapor: Pick<Rapor, "tahun_ajaran" | "semester">): string {
  return `Semester ${rapor.semester} · ${rapor.tahun_ajaran.nama}`;
}
