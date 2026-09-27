const ENTITAS: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** Teks polos dari HTML (sudah disanitasi backend) untuk cuplikan di daftar. */
export function teksDariHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entitas) => ENTITAS[entitas] ?? entitas)
    .replace(/\s+/g, " ")
    .trim();
}

export function ringkas(teks: string, maksKarakter: number): string {
  if (teks.length <= maksKarakter) return teks;
  const potong = teks.slice(0, maksKarakter);
  const spasiTerakhir = potong.lastIndexOf(" ");
  return `${potong.slice(0, spasiTerakhir > 0 ? spasiTerakhir : maksKarakter)}…`;
}
