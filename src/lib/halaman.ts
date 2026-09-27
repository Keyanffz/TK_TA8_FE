/** Nomor halaman dari ?page=, bernilai 1 kalau kosong atau tidak valid. */
export function nomorHalaman(nilai: string | string[] | undefined): number {
  const angka = Number(Array.isArray(nilai) ? nilai[0] : nilai);
  return Number.isInteger(angka) && angka > 0 ? angka : 1;
}
