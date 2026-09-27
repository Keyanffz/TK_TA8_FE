"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Muncul } from "@/components/shared/muncul";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarTagihan } from "@/lib/api/tagihan";
import { LABEL_STATUS_TAGIHAN } from "@/lib/constants/label";
import { NADA_STATUS_TAGIHAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan, tagihanTerbuka } from "@/lib/tagihan";
import { cn } from "@/lib/utils";
import type { Tagihan } from "@/types/domain";

// Satu anak paling banyak belasan tagihan per tahun ajaran; diambil sekaligus lalu dikelompokkan.
const TAGIHAN_SEKALIGUS = 100;
const TAB = ["belum", "lunas"] as const;

function KartuTagihanWali({ tagihan }: { tagihan: Tagihan }) {
  const terlambat = tagihan.status === "terlambat";
  return (
    <Link
      href={`/dashboard/tagihan/${tagihan.id}`}
      className={cn(
        "angkat flex min-h-20 items-center gap-3 rounded-xl border-2 bg-card p-4 shadow-sm",
        terlambat ? "border-destructive" : tagihanTerbuka(tagihan.status) ? "border-primary" : "border-border",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-heading font-bold">{namaTagihan(tagihan)}</span>
        <span className={cn("block text-sm", terlambat ? "font-bold text-destructive" : "text-muted-foreground")}>
          {tagihan.status === "lunas" && tagihan.lunas_at ? `Lunas ${formatTanggal(tagihan.lunas_at)}` : `Jatuh tempo ${formatTanggal(tagihan.jatuh_tempo)}`}
        </span>
        <StatusBadge nada={NADA_STATUS_TAGIHAN[tagihan.status]} className="mt-1">
          {LABEL_STATUS_TAGIHAN[tagihan.status]}
        </StatusBadge>
      </span>
      <span className="font-heading text-lg font-extrabold tabular-nums">{formatRupiah(tagihan.total)}</span>
      <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
    </Link>
  );
}

/** Tagihan anak aktif untuk wali (B4): yang belum lunas di atas, total yang harus dibayar menonjol. */
export function TagihanWali() {
  const { anakAktif } = useAnakAktif();
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("belum"));
  const { data, isPending, isError, error, refetch } = useDaftarTagihan(
    { halaman: 1, muridId: anakAktif?.id ?? null, perHalaman: TAGIHAN_SEKALIGUS },
    anakAktif !== null,
  );

  if (!anakAktif) return <EmptyState judul="Belum ada anak yang tertaut." deskripsi="Tambahkan anak dari menu Anak Saya." />;
  if (isPending) return <Skeleton aria-label="Memuat tagihan" className="h-60 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const belumLunas = data.data
    .filter((item) => tagihanTerbuka(item.status) || item.status === "menunggu_verifikasi")
    .sort((a, b) => a.jatuh_tempo.localeCompare(b.jatuh_tempo));
  const lunas = data.data.filter((item) => item.status === "lunas");
  const totalBelum = belumLunas.filter((item) => tagihanTerbuka(item.status)).reduce((jumlah, item) => jumlah + item.total, 0);
  const tampil = tab === "belum" ? belumLunas : lunas;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-primary p-5 text-primary-foreground">
        <p className="text-sm">Belum dibayar untuk {anakAktif.nama_panggilan}</p>
        <p className="font-heading text-2xl font-extrabold tabular-nums">{formatRupiah(totalBelum)}</p>
      </div>
      <SaringSegmen
        label="Kelompok tagihan"
        opsi={[
          { nilai: "belum", label: "Belum lunas", jumlah: belumLunas.length },
          { nilai: "lunas", label: "Lunas" },
        ]}
        nilai={tab}
        onUbah={(nilai) => void setTab(nilai === "belum" ? null : nilai)}
      />
      {tampil.length === 0 ? (
        <EmptyState
          judul={tab === "belum" ? `Semua tagihan ${anakAktif.nama_panggilan} sudah lunas.` : "Belum ada tagihan yang lunas."}
          deskripsi={tab === "belum" ? "Tagihan baru muncul di sini setiap awal bulan." : undefined}
        />
      ) : (
        <Muncul as="ul" efek="geser" className="flex flex-col gap-3">
          {tampil.map((item) => (
            <li key={item.id}>
              <KartuTagihanWali tagihan={item} />
            </li>
          ))}
        </Muncul>
      )}
    </div>
  );
}
