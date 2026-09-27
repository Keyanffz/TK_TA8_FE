import type { User } from "@/types/domain";

export type AnakRingkas = NonNullable<User["wali_murid"]>["anak"][number];

/**
 * Anak aktif wali: id dari cookie tk_anak kalau masih tertaut, selain itu
 * anak pertama. null kalau wali belum punya anak tertaut.
 */
export function pilihAnakAktif(daftarAnak: readonly AnakRingkas[], idCookie: string | undefined): AnakRingkas | null {
  const id = Number(idCookie);
  return daftarAnak.find((anak) => anak.id === id) ?? daftarAnak[0] ?? null;
}
