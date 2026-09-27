"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomCari } from "@/components/shared/kolom-cari";
import { Muncul } from "@/components/shared/muncul";
import { Paginasi } from "@/components/shared/paginasi";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarPengumuman } from "@/lib/api/pengumuman";
import { formatTanggal } from "@/lib/format";
import { ringkas, teksDariHtml } from "@/lib/html";
import { sasaranPengumuman } from "@/lib/pengumuman";
import { cn } from "@/lib/utils";

const PANJANG_CUPLIKAN = 180;
const TAB = ["semua", "terbit", "draft"] as const;
const LABEL_TAB = { semua: "Semua", terbit: "Terbit", draft: "Draft" } as const;

/** Feed pengumuman: yang disematkan di atas. Penulis (Kepala Sekolah, guru) juga melihat draft dan sasaran. */
export function FeedPengumuman({ penulis }: { penulis: boolean }) {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("semua"));
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarPengumuman({
    halaman,
    search: cari,
    terbit: tab === "semua" ? null : tab === "terbit",
  });

  return (
    <div className="flex flex-col gap-5">
      {penulis ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SaringSegmen
            label="Status pengumuman"
            opsi={TAB.map((nilai) => ({ nilai, label: LABEL_TAB[nilai] }))}
            nilai={tab}
            onUbah={(nilai) => {
              void setTab(nilai === "semua" ? null : nilai);
              void setHalaman(null);
            }}
          />
          <KolomCari
            nilai={cari}
            onUbah={(nilai) => {
              void setCari(nilai || null);
              void setHalaman(null);
            }}
            label="Cari pengumuman"
            placeholder="Cari judul"
            className="w-full sm:w-72"
          />
        </div>
      ) : null}
      {isPending ? (
        <Skeleton aria-label="Memuat pengumuman" className="h-60 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState
          judul={cari ? `Tidak ada pengumuman yang cocok dengan "${cari}".` : tab === "draft" ? "Tidak ada draft pengumuman." : "Belum ada pengumuman."}
          deskripsi={penulis ? undefined : "Pengumuman dari sekolah dan guru kelas akan muncul di sini."}
        />
      ) : (
        <>
          <Muncul as="ul" efek="geser" className={cn("flex flex-col gap-3", isPlaceholderData && "opacity-60")}>
            {data.data.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/pengumuman/${item.id}`}
                  className={cn(
                    "angkat flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm sm:p-5",
                    item.is_pinned ? "border-highlight-strong border-l-4" : "border-border",
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.is_pinned ? (
                      <span className="inline-flex items-center gap-1 font-bold text-highlight-foreground">
                        <Star aria-hidden="true" className="size-3.5 fill-highlight text-highlight-strong" />
                        Disematkan
                      </span>
                    ) : null}
                    <span>{item.published_at ? formatTanggal(item.published_at) : "Belum terbit"}</span>
                    <span>· {item.penulis.nama}</span>
                    {penulis ? <span>· {sasaranPengumuman(item)}</span> : null}
                    {item.published_at ? null : <StatusBadge nada="netral">Draft</StatusBadge>}
                    {item.is_publik ? <StatusBadge nada="sukses">Tampil di website</StatusBadge> : null}
                  </span>
                  <span className="font-heading text-lg leading-snug font-bold">{item.judul}</span>
                  <span className="text-sm text-muted-foreground">{ringkas(teksDariHtml(item.isi), PANJANG_CUPLIKAN)}</span>
                </Link>
              </li>
            ))}
          </Muncul>
          <Paginasi meta={data.meta} onUbah={(nomor) => void setHalaman(nomor)} label="Halaman pengumuman" />
        </>
      )}
    </div>
  );
}
