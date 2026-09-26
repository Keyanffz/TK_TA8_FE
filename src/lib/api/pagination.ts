import type { MetaPaginasi } from "@/types/domain";

type MetaMentah = {
  current_page: number | string;
  per_page: number | string;
  total: number | string;
  last_page: number | string;
};

export function normalisasiMeta(meta: MetaMentah): MetaPaginasi {
  return {
    current_page: Number(meta.current_page),
    per_page: Number(meta.per_page),
    total: Number(meta.total),
    last_page: Number(meta.last_page),
  };
}
