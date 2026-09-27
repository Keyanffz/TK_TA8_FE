"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { pesanError } from "@/lib/api/errors";
import { useBacaNotifikasi } from "@/lib/api/notifikasi";
import { TAMPILAN_NOTIFIKASI } from "@/lib/constants/notifikasi";
import { KELAS_NADA } from "@/lib/constants/status";
import { formatRelatif } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notifikasi } from "@/types/domain";

type ItemNotifikasiProps = {
  notifikasi: Notifikasi;
  /** Dipanggil sebelum pindah halaman, misalnya untuk menutup popover. */
  onBuka?: () => void;
};

/** Satu notifikasi: klik menandai dibaca lalu membuka halaman tujuan dari backend. */
export function ItemNotifikasi({ notifikasi, onBuka }: ItemNotifikasiProps) {
  const router = useRouter();
  const baca = useBacaNotifikasi();
  const { ikon: Ikon, nada } = TAMPILAN_NOTIFIKASI[notifikasi.jenis];
  const belumDibaca = notifikasi.dibaca_at === null;

  const buka = () => {
    onBuka?.();
    if (belumDibaca) {
      baca.mutate(notifikasi.id, { onError: (error) => toast.error(pesanError(error)) });
    }
    router.push(notifikasi.url);
  };

  return (
    <button
      type="button"
      onClick={buka}
      className={cn(
        "group flex w-full gap-3 rounded-md px-3 py-3 text-left transition-colors duration-150 hover:bg-primary-soft",
        belumDibaca && "bg-highlight-soft/60",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", KELAS_NADA[nada])}>
        <Ikon aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:scale-110" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="flex-1 text-sm font-bold">{notifikasi.judul}</span>
          {belumDibaca ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-destructive">
              <span className="sr-only">Belum dibaca</span>
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{notifikasi.pesan}</span>
        {notifikasi.created_at ? (
          <time dateTime={notifikasi.created_at} className="mt-1 block text-xs text-muted-foreground">
            {formatRelatif(notifikasi.created_at)}
          </time>
        ) : null}
      </span>
    </button>
  );
}
