"use client";

import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";

import { AksiVerifikasi } from "@/components/features/pembayaran/aksi-verifikasi";
import { BuktiTransfer } from "@/components/features/pembayaran/bukti-transfer";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Paginasi } from "@/components/shared/paginasi";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarPembayaran } from "@/lib/api/pembayaran";
import { formatRupiah, formatTanggal, formatRelatif } from "@/lib/format";
import { namaTagihan } from "@/lib/tagihan";
import { cn } from "@/lib/utils";
import type { Pembayaran } from "@/types/domain";

const ANTREAN_PER_HALAMAN = 10;

function KartuAntrean({ bayar }: { bayar: Pembayaran }) {
  return (
    <article className="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm md:grid-cols-[minmax(0,320px)_1fr]">
      {bayar.bukti_url ? (
        <BuktiTransfer url={bayar.bukti_url} label={`Bukti transfer ${bayar.tagihan.murid.nama_panggilan}`} className="h-72 w-full" />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">Tanpa bukti</div>
      )}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Dikirim {bayar.dibayar_oleh?.nama ?? "wali"} · {bayar.created_at ? formatRelatif(bayar.created_at) : "-"}
          </p>
          <h2 className="font-heading text-lg leading-tight font-extrabold">
            <Link href={`/mudarris/tagihan/${bayar.tagihan_id}`} className="hover:underline">
              {namaTagihan(bayar.tagihan)}
            </Link>
          </h2>
          <p className="text-sm">
            {bayar.tagihan.murid.nama_lengkap} · {bayar.tagihan.murid.kelas?.nama ?? "tanpa kelas"}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Jumlah</dt>
            <dd className="font-heading text-lg font-extrabold whitespace-nowrap tabular-nums sm:text-xl">{formatRupiah(bayar.jumlah)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tanggal transfer</dt>
            <dd className="font-bold">{formatTanggal(bayar.tanggal_bayar)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bank pengirim</dt>
            <dd className="font-bold">{bayar.bank_pengirim ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Atas nama</dt>
            <dd className="font-bold">{bayar.nama_pengirim ?? "-"}</dd>
          </div>
        </dl>
        <p className="rounded-md bg-highlight-soft px-3 py-2 text-sm">
          Cocokkan nominal dan tanggal di bukti dengan mutasi rekening sekolah sebelum menerima.
        </p>
        <div className="mt-auto">
          <AksiVerifikasi id={bayar.id} jumlah={bayar.jumlah} namaTagihan={namaTagihan(bayar.tagihan)} namaMurid={bayar.tagihan.murid.nama_panggilan} besar />
        </div>
      </div>
    </article>
  );
}

/** Bukti transfer yang menunggu diperiksa, paling lama di atas (B4: antrean verifikasi). */
export function AntreanVerifikasi() {
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarPembayaran({ halaman, status: "menunggu", perHalaman: ANTREAN_PER_HALAMAN });

  if (isPending) return <Skeleton aria-label="Memuat antrean" className="h-80 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.data.length === 0) {
    return <EmptyState judul="Tidak ada bukti transfer yang menunggu." deskripsi="Bukti baru dari wali muncul di sini dan Anda mendapat notifikasi." />;
  }

  return (
    <div className={cn("flex flex-col gap-4", isPlaceholderData && "opacity-60")}>
      {data.data.map((bayar) => (
        <KartuAntrean key={bayar.id} bayar={bayar} />
      ))}
      <Paginasi meta={data.meta} onUbah={(nomor) => void setHalaman(nomor)} label="Halaman antrean" />
    </div>
  );
}
