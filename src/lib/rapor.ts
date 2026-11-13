import type { Rapor } from "@/types/domain";

/** "Semester 1 · 2026/2027" */
export function periodeRapor(rapor: Pick<Rapor, "tahun_ajaran" | "semester">): string {
  return `Semester ${rapor.semester} · ${rapor.tahun_ajaran.nama}`;
}
