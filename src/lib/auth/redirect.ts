/**
 * Parameter ?next= hanya boleh berisi path internal. Nilai seperti
 * "//situs-lain.com" atau URL absolut diganti ke beranda dashboard.
 */
export function amankanTujuan(next: string | null | undefined, cadangan = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return cadangan;
  }
  return next;
}
