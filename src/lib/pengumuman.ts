import { LABEL_TARGET_PENGUMUMAN } from "@/lib/constants/label";
import type { Pengumuman } from "@/types/domain";

/** "Kelas: TK A1, TK A2" atau "3 murid"; nama sasaran hanya dikirim backend ke penulis dan Kepala Sekolah. */
export function sasaranPengumuman(pengumuman: Pick<Pengumuman, "target" | "kelas" | "murid">): string {
  if (pengumuman.target === "kelas" && pengumuman.kelas?.length) return `Kelas ${pengumuman.kelas.map((kelas) => kelas.nama).join(", ")}`;
  if (pengumuman.target === "murid" && pengumuman.murid?.length) return `${pengumuman.murid.length} murid`;
  return LABEL_TARGET_PENGUMUMAN[pengumuman.target];
}
