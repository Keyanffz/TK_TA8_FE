"use client";

import { useState } from "react";
import { toast } from "sonner";

import { LiburKelasBagian } from "@/components/features/kelas/libur-kelas";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHariSekolahKelas, useUbahHariSekolah } from "@/lib/api/absensi-murid";
import { pesanError } from "@/lib/api/errors";
import { HARI_ISO } from "@/lib/constants/label";
import { usePeringatanBelumDisimpan } from "@/lib/use-peringatan-belum-disimpan";
import { cn } from "@/lib/utils";

const KELAS_BAGIAN = "rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5";

function HariSekolahMingguan({ kelasId, awal, bisaDiatur }: { kelasId: number; awal: number[]; bisaDiatur: boolean }) {
  const [hari, setHari] = useState(awal);
  const ubah = useUbahHariSekolah(kelasId);
  const berubah = hari.join() !== awal.join();
  usePeringatanBelumDisimpan(berubah);

  const pilih = (nomor: number) => setHari((sebelum) => (sebelum.includes(nomor) ? sebelum.filter((satu) => satu !== nomor) : [...sebelum, nomor].sort((a, b) => a - b)));
  const simpan = () => ubah.mutate(hari, { onSuccess: (hasil) => toast.success(hasil.message) });

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Hari sekolah" className="flex flex-wrap gap-2">
        {HARI_ISO.map(({ nomor, label }) => {
          const aktif = hari.includes(nomor);
          return (
            <button
              key={nomor}
              type="button"
              aria-pressed={aktif}
              disabled={!bisaDiatur}
              onClick={() => pilih(nomor)}
              className={cn(
                "min-h-11 rounded-full border px-4 font-heading text-sm font-bold transition-colors duration-150 disabled:opacity-70",
                aktif ? "border-transparent bg-primary text-primary-foreground" : "border-input bg-card hover:bg-muted",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {hari.length === 0 ? <p className="text-sm text-destructive">Pilih minimal satu hari sekolah.</p> : null}
      {ubah.isError ? <KotakPesan nada="bahaya">{pesanError(ubah.error)}</KotakPesan> : null}
      {bisaDiatur ? (
        <Button className="self-start" disabled={!berubah || hari.length === 0 || ubah.isPending} onClick={simpan}>
          {ubah.isPending ? "Menyimpan..." : "Simpan Hari Sekolah"}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Hari sekolah mingguan dan tanggal libur absensi murid kelas ini, terpisah dari hari kerja dan libur absensi guru.
 * Guru pendamping hanya melihat.
 */
export function HariSekolahKelas({ kelasId }: { kelasId: number }) {
  const { data, isPending, isError, error, refetch } = useHariSekolahKelas(kelasId);

  if (isPending) return <Skeleton className="h-64 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-prose text-sm text-muted-foreground">
        Absensi murid hanya bisa dicatat pada hari sekolah yang bukan tanggal libur. Absensi yang sudah tercatat pada tanggal yang kemudian
        dijadikan libur atau bukan hari sekolah tetap tersimpan, tetapi tidak dihitung di rekap.
        {data.bisa_diatur ? null : " Hanya wali kelas dan Kepala Sekolah yang bisa mengubahnya."}
      </p>
      <section aria-labelledby="judul-hari-sekolah" className={KELAS_BAGIAN}>
        <h2 id="judul-hari-sekolah" className="mb-3 text-lg font-extrabold">
          Hari sekolah
        </h2>
        <HariSekolahMingguan key={data.hari_sekolah.join()} kelasId={kelasId} awal={data.hari_sekolah} bisaDiatur={data.bisa_diatur} />
      </section>
      <section aria-labelledby="judul-libur-kelas" className={KELAS_BAGIAN}>
        <h2 id="judul-libur-kelas" className="mb-3 text-lg font-extrabold">
          Tanggal libur
        </h2>
        <LiburKelasBagian kelasId={kelasId} libur={data.libur} bisaDiatur={data.bisa_diatur} />
      </section>
    </div>
  );
}
