import { notFound } from "next/navigation";

/** Nomor halaman dari ?page=, bernilai 1 kalau kosong atau tidak valid. */
export function nomorHalaman(nilai: string | string[] | undefined): number {
  const angka = Number(Array.isArray(nilai) ? nilai[0] : nilai);
  return Number.isInteger(angka) && angka > 0 ? angka : 1;
}

/** Segmen `[id]` di URL dashboard; selain bilangan bulat positif dianggap tidak ada. */
export function idDariParam(nilai: string): number {
  const id = Number(nilai);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
}
