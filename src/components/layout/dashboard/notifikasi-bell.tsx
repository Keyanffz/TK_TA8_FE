"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ItemNotifikasi } from "@/components/features/notifikasi/item-notifikasi";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pesanError } from "@/lib/api/errors";
import { useBacaSemuaNotifikasi, useJumlahBelumDibaca, useNotifikasiTerbaru } from "@/lib/api/notifikasi";
import { cn } from "@/lib/utils";

const BATAS_ANGKA_BADGE = 9;

export function NotifikasiBell() {
  const [terbuka, setTerbuka] = useState(false);
  const { data: jumlah = 0 } = useJumlahBelumDibaca();
  const terbaru = useNotifikasiTerbaru(terbuka);
  const bacaSemua = useBacaSemuaNotifikasi();
  const label = jumlah > 0 ? `Notifikasi, ${jumlah} belum dibaca` : "Notifikasi";

  return (
    <Popover open={terbuka} onOpenChange={setTerbuka}>
      <PopoverTrigger
        aria-label={label}
        className="group relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15 lg:hover:bg-muted"
      >
        <Bell aria-hidden="true" className={cn("size-5 origin-top", jumlah > 0 && "group-hover:animate-[ayun_0.6s_ease-in-out_2]")} />
        {jumlah > 0 ? (
          <span
            key={jumlah}
            className="gerak-masuk absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white ring-2 ring-primary lg:ring-card"
          >
            {jumlah > BATAS_ANGKA_BADGE ? `${BATAS_ANGKA_BADGE}+` : jumlah}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-heading font-bold">Notifikasi</p>
          {jumlah > 0 ? (
            <button
              type="button"
              disabled={bacaSemua.isPending}
              onClick={() => bacaSemua.mutate(undefined, { onError: (error) => toast.error(pesanError(error)) })}
              className="text-sm font-bold text-primary-strong hover:underline disabled:opacity-50"
            >
              Tandai semua dibaca
            </button>
          ) : null}
        </div>
        <div className="max-h-96 overflow-y-auto p-1">
          {terbaru.isPending ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : terbaru.isError ? (
            <p className="p-4 text-sm text-muted-foreground">{pesanError(terbaru.error)}</p>
          ) : terbaru.data.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Belum ada notifikasi.</p>
          ) : (
            terbaru.data.map((item) => <ItemNotifikasi key={item.id} notifikasi={item} onBuka={() => setTerbuka(false)} />)
          )}
        </div>
        <Link
          href="/dashboard/notifikasi"
          onClick={() => setTerbuka(false)}
          className="block border-t border-border px-4 py-3 text-center font-heading text-sm font-bold text-primary-strong hover:bg-muted"
        >
          Lihat semua notifikasi
        </Link>
      </PopoverContent>
    </Popover>
  );
}
