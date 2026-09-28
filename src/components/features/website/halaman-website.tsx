"use client";

import { ExternalLink } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useState, type ReactNode } from "react";

import { FormDaftarBerikon } from "@/components/features/website/form-daftar-berikon";
import { FormFasilitas } from "@/components/features/website/form-fasilitas";
import { FormHero } from "@/components/features/website/form-hero";
import { FormProfilSekolah } from "@/components/features/website/form-profil-sekolah";
import { GalatMuat } from "@/components/shared/galat-muat";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { skemaLanding, usePengaturan } from "@/lib/api/pengaturan-dashboard";
import { PESAN_BELUM_DISIMPAN, usePeringatanBelumDisimpan } from "@/lib/use-peringatan-belum-disimpan";

const TAB = ["profil", "hero", "program", "keunggulan", "fasilitas"] as const;
type Tab = (typeof TAB)[number];
const LABEL_TAB: Record<Tab, string> = { profil: "Profil Sekolah", hero: "Pembuka", program: "Program", keunggulan: "Keunggulan", fasilitas: "Fasilitas" };

/** Tab landing memakai satu query `landing`; tiap tab dirender ulang dari data terbaru saat dibuka. */
function TabLanding({ children }: { children: (data: ReturnType<typeof skemaLanding.parse>) => ReactNode }) {
  const { data, isPending, isError, error, refetch } = usePengaturan("landing", (mentah) => skemaLanding.parse(mentah));
  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  return children(data);
}

/** CMS halaman depan (B7): lima tab, disimpan per tab lewat PUT /pengaturan. */
export function HalamanWebsite() {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("profil"));
  const [kotor, setKotor] = useState(false);
  const ubahKotor = useCallback((nilai: boolean) => setKotor(nilai), []);
  usePeringatanBelumDisimpan(kotor);

  const pindahTab = (nilai: string) => {
    const tujuan = TAB.find((item) => item === nilai);
    if (!tujuan || tujuan === tab) return;
    if (kotor && !window.confirm(PESAN_BELUM_DISIMPAN)) return;
    setKotor(false);
    void setTab(tujuan === "profil" ? null : tujuan);
  };

  return (
    // activationMode manual: Radix mengaktifkan tab saat tombolnya mendapat fokus, sehingga setelah
    // konfirmasi ditutup (fokus kembali ke tombol tab) konfirmasi akan muncul lagi terus-menerus.
    <Tabs value={tab} onValueChange={pindahTab} activationMode="manual" className="gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-4 max-w-[calc(100%+2rem)] overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:px-0">
          <TabsList aria-label="Bagian website">
            {TAB.map((nilai) => (
              <TabsTrigger key={nilai} value={nilai} className="px-4">
                {LABEL_TAB[nilai]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
          <ExternalLink aria-hidden="true" />
          Lihat Pratinjau
        </a>
      </div>
      <TabsContent value="profil">
        <FormProfilSekolah onUbahKotor={ubahKotor} />
      </TabsContent>
      <TabsContent value="hero">
        <TabLanding>{(data) => <FormHero hero={data["landing.hero"]} onUbahKotor={ubahKotor} />}</TabLanding>
      </TabsContent>
      <TabsContent value="program">
        <TabLanding>{(data) => <FormDaftarBerikon kunci="landing.program" nama="program" awal={data["landing.program"]} onUbahKotor={ubahKotor} />}</TabLanding>
      </TabsContent>
      <TabsContent value="keunggulan">
        <TabLanding>
          {(data) => <FormDaftarBerikon kunci="landing.keunggulan" nama="keunggulan" awal={data["landing.keunggulan"]} onUbahKotor={ubahKotor} />}
        </TabLanding>
      </TabsContent>
      <TabsContent value="fasilitas">
        <TabLanding>{(data) => <FormFasilitas awal={data["landing.fasilitas"]} onUbahKotor={ubahKotor} />}</TabLanding>
      </TabsContent>
    </Tabs>
  );
}
