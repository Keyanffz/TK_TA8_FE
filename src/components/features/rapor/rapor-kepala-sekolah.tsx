"use client";

import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";

import { RaporKelas } from "@/components/features/rapor/rapor-kelas";
import { AntreanReviewRapor, SemuaRapor } from "@/components/features/rapor/review-rapor";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { useDaftarRapor } from "@/lib/api/rapor";
import { useSession } from "@/lib/auth/use-session";

const TAB = ["review", "semua", "kelas-saya"] as const;

/** Kepala Sekolah: antrean review (B4), semua rapor, dan rapor kelas yang dia ampu sendiri (kalau ada). */
export function RaporKepalaSekolah() {
  const { user } = useSession();
  const kelasDiampu = user?.guru?.kelas_diampu ?? [];
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("review"));
  const [, setHalaman] = useQueryState("page", parseAsInteger);
  const menunggu = useDaftarRapor({ halaman: 1, status: "diajukan", perHalaman: 1 });

  const opsi = [
    { nilai: "review" as const, label: "Menunggu Review", jumlah: menunggu.data?.meta.total },
    { nilai: "semua" as const, label: "Semua Rapor" },
    ...(kelasDiampu.length > 0 ? [{ nilai: "kelas-saya" as const, label: "Kelas Saya" }] : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <SaringSegmen
        label="Tampilan rapor"
        opsi={opsi}
        nilai={tab}
        onUbah={(nilai) => {
          void setTab(nilai === "review" ? null : nilai);
          void setHalaman(null);
        }}
      />
      {tab === "review" ? <AntreanReviewRapor /> : tab === "semua" ? <SemuaRapor /> : <RaporKelas kelasDiampu={kelasDiampu} />}
    </div>
  );
}
