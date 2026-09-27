"use client";

import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";

import { AntreanVerifikasi } from "@/components/features/pembayaran/antrean-verifikasi";
import { RiwayatPembayaranSekolah } from "@/components/features/pembayaran/riwayat-pembayaran-sekolah";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { useDaftarPembayaran } from "@/lib/api/pembayaran";

const TAB = ["antrean", "riwayat"] as const;

export function PembayaranSekolah() {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("antrean"));
  const [, setHalaman] = useQueryState("page", parseAsInteger);
  const menunggu = useDaftarPembayaran({ halaman: 1, status: "menunggu", perHalaman: 1 });

  return (
    <div className="flex flex-col gap-5">
      <SaringSegmen
        label="Tampilan pembayaran"
        opsi={[
          { nilai: "antrean", label: "Menunggu Verifikasi", jumlah: menunggu.data?.meta.total },
          { nilai: "riwayat", label: "Semua Pembayaran" },
        ]}
        nilai={tab}
        onUbah={(nilai) => {
          void setTab(nilai === "antrean" ? null : nilai);
          void setHalaman(null);
        }}
      />
      {tab === "antrean" ? <AntreanVerifikasi /> : <RiwayatPembayaranSekolah />}
    </div>
  );
}
