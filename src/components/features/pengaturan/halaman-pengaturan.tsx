"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useState, type ReactNode } from "react";

import { ElemenPenilaianSekolah } from "@/components/features/pengaturan/elemen-penilaian";
import { FormAturanTagihan } from "@/components/features/pengaturan/form-aturan-tagihan";
import { FormInfoWali } from "@/components/features/pengaturan/form-info-wali";
import { FormPpdb } from "@/components/features/pengaturan/form-ppdb";
import { FormRekening } from "@/components/features/pengaturan/form-rekening";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { skemaKeuangan, skemaPpdb, usePengaturan } from "@/lib/api/pengaturan-dashboard";
import { PESAN_BELUM_DISIMPAN, usePeringatanBelumDisimpan } from "@/lib/use-peringatan-belum-disimpan";

const TAB = ["rekening", "tagihan", "ppdb", "beranda", "elemen"] as const;
type Tab = (typeof TAB)[number];
const LABEL_TAB: Record<Tab, string> = { rekening: "Rekening", tagihan: "Tagihan", ppdb: "PPDB", beranda: "Beranda Wali", elemen: "Elemen Penilaian" };

function Muat<T>({ hasil, children }: { hasil: { data: T | undefined; isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown }; children: (data: T) => ReactNode }) {
  if (hasil.isPending) return <Skeleton className="h-72 rounded-xl" />;
  if (hasil.isError || hasil.data === undefined) return <GalatMuat error={hasil.error} onCobaLagi={() => void hasil.refetch()} />;
  return children(hasil.data);
}

/** Pengaturan sistem (B4), satu tab per kelompok; tiap tab disimpan sendiri. */
export function HalamanPengaturan() {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("rekening"));
  const [kotor, setKotor] = useState(false);
  const ubahKotor = useCallback((nilai: boolean) => setKotor(nilai), []);
  const keuangan = usePengaturan("keuangan", (mentah) => skemaKeuangan.parse(mentah));
  const ppdb = usePengaturan("ppdb", (mentah) => skemaPpdb.parse(mentah));
  usePeringatanBelumDisimpan(kotor);

  const pindahTab = (nilai: string) => {
    const tujuan = TAB.find((item) => item === nilai);
    if (!tujuan || tujuan === tab) return;
    if (kotor && !window.confirm(PESAN_BELUM_DISIMPAN)) return;
    setKotor(false);
    void setTab(tujuan === "rekening" ? null : tujuan);
  };

  return (
    // activationMode manual: lihat HalamanWebsite (konfirmasi berulang saat fokus kembali ke tombol tab).
    <Tabs value={tab} onValueChange={pindahTab} activationMode="manual" className="gap-5">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList aria-label="Kelompok pengaturan">
          {TAB.map((nilai) => (
            <TabsTrigger key={nilai} value={nilai} className="px-4">
              {LABEL_TAB[nilai]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <TabsContent value="rekening">
        <Muat hasil={keuangan}>{(data) => <FormRekening awal={data["keuangan.rekening"]} onUbahKotor={ubahKotor} />}</Muat>
      </TabsContent>
      <TabsContent value="tagihan">
        <Muat hasil={keuangan}>
          {(data) => (
            <FormAturanTagihan jatuhTempo={data["keuangan.tanggal_jatuh_tempo"]} hariPengingat={data["keuangan.hari_pengingat"]} onUbahKotor={ubahKotor} />
          )}
        </Muat>
      </TabsContent>
      <TabsContent value="ppdb">
        <Muat hasil={ppdb}>{(data) => <FormPpdb data={data} onUbahKotor={ubahKotor} />}</Muat>
      </TabsContent>
      <TabsContent value="beranda">
        <p className="mb-5 max-w-prose text-sm text-muted-foreground">
          Pesan singkat dari sekolah yang tampil paling atas di beranda wali murid, misalnya pengingat rapat atau libur.
        </p>
        <FormInfoWali onUbahKotor={ubahKotor} />
      </TabsContent>
      <TabsContent value="elemen">
        <ElemenPenilaianSekolah />
      </TabsContent>
    </Tabs>
  );
}
