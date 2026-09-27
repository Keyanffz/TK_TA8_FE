"use client";

import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { toast } from "sonner";

import { ItemNotifikasi } from "@/components/features/notifikasi/item-notifikasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Paginasi } from "@/components/shared/paginasi";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { pesanError } from "@/lib/api/errors";
import { useBacaSemuaNotifikasi, useDaftarNotifikasi, useJumlahBelumDibaca } from "@/lib/api/notifikasi";
import { cn } from "@/lib/utils";

export function DaftarNotifikasi() {
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const [hanyaBelum, setHanyaBelum] = useQueryState("belum", parseAsBoolean.withDefault(false));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarNotifikasi(halaman, hanyaBelum);
  const { data: jumlahBelum = 0 } = useJumlahBelumDibaca();
  const bacaSemua = useBacaSemuaNotifikasi();

  const pilihFilter = (nilai: boolean) => {
    void setHanyaBelum(nilai || null);
    void setHalaman(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SaringSegmen
          label="Saring notifikasi"
          opsi={[
            { nilai: false, label: "Semua" },
            { nilai: true, label: "Belum dibaca", jumlah: jumlahBelum },
          ]}
          nilai={hanyaBelum}
          onUbah={pilihFilter}
        />
        {jumlahBelum > 0 ? (
          <Button
            variant="outline"
            disabled={bacaSemua.isPending}
            onClick={() =>
              bacaSemua.mutate(undefined, {
                onSuccess: () => toast.success("Semua notifikasi sudah ditandai dibaca."),
                onError: (galat) => toast.error(pesanError(galat)),
              })
            }
          >
            Tandai Semua Dibaca
          </Button>
        ) : null}
      </div>

      {isPending ? (
        <div className="space-y-2" aria-label="Memuat notifikasi">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState
          judul={hanyaBelum ? "Semua notifikasi sudah dibaca." : "Belum ada notifikasi."}
          deskripsi="Kabar tagihan, pembayaran, rapor, dan pengumuman akan muncul di sini."
        />
      ) : (
        <>
          <ul className={cn("divide-y divide-border rounded-xl border border-border bg-card p-1", isPlaceholderData && "opacity-60")}>
            {data.data.map((item) => (
              <li key={item.id}>
                <ItemNotifikasi notifikasi={item} />
              </li>
            ))}
          </ul>
          <Paginasi meta={data.meta} onUbah={(nomor) => void setHalaman(nomor)} label="Halaman notifikasi" />
        </>
      )}
    </div>
  );
}
