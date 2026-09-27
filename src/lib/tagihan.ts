import type { Tagihan } from "@/types/domain";

const bulanTahun = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

/** "SPP September 2026" untuk tagihan bulanan, "Uang Kegiatan" untuk tagihan sekali. */
export function namaTagihan(tagihan: Pick<Tagihan, "jenis_tagihan" | "periode" | "kode">): string {
  const jenis = tagihan.jenis_tagihan?.nama ?? tagihan.kode;
  if (!tagihan.periode) return jenis;
  return `${jenis} ${bulanTahun.format(new Date(`${tagihan.periode}T00:00:00Z`))}`;
}
