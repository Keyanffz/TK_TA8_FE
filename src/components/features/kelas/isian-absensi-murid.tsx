"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PilihTanggal, useTanggalDipilih } from "@/components/features/absensi/rekap-harian";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbsensiMuridHarian, useSimpanAbsensiMurid, type BarisAbsensiMurid } from "@/lib/api/absensi-murid";
import { pesanError } from "@/lib/api/errors";
import { LABEL_STATUS_ABSENSI_MURID } from "@/lib/constants/label";
import { formatHariTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StatusAbsensiMurid } from "@/types/domain";

const STATUS = ["hadir", "izin", "sakit", "alpa"] as const satisfies readonly StatusAbsensiMurid[];

type DataHarian = NonNullable<ReturnType<typeof useAbsensiMuridHarian>["data"]>;

function PilihStatus({ nama, nilai, onUbah, nonaktif }: { nama: string; nilai: StatusAbsensiMurid; onUbah: (status: StatusAbsensiMurid) => void; nonaktif: boolean }) {
  return (
    <div role="radiogroup" aria-label={`Status ${nama}`} className="grid grid-cols-4 gap-1">
      {STATUS.map((status) => (
        <button
          key={status}
          type="button"
          role="radio"
          aria-checked={nilai === status}
          disabled={nonaktif}
          onClick={() => onUbah(status)}
          className={cn(
            "min-h-11 rounded-md border px-2 text-sm font-bold transition-colors disabled:opacity-60",
            nilai === status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
          )}
        >
          {LABEL_STATUS_ABSENSI_MURID[status]}
        </button>
      ))}
    </div>
  );
}

/** Isian satu tanggal. Murid yang belum dicatat diisi hadir; status bisa diubah sebelum disimpan. */
function FormHarian({ kelasId, data }: { kelasId: number; data: DataHarian }) {
  const [isian, setIsian] = useState<BarisAbsensiMurid[]>(() =>
    data.murid.map(({ murid, status, keterangan }) => ({ murid_id: murid.id, status: status ?? "hadir", keterangan })),
  );
  const simpan = useSimpanAbsensiMurid(kelasId);
  const sudahDicatat = data.murid.some(({ status }) => status !== null);
  const ubah = (muridId: number, perubahan: Partial<BarisAbsensiMurid>) =>
    setIsian((sebelum) => sebelum.map((baris) => (baris.murid_id === muridId ? { ...baris, ...perubahan } : baris)));

  const kirim = () =>
    simpan.mutate(
      { tanggal: data.tanggal, absensi: isian.map((baris) => ({ ...baris, keterangan: baris.status === "hadir" ? null : baris.keterangan })) },
      { onSuccess: (hasil) => toast.success(hasil.message) },
    );

  return (
    <div className="flex flex-col gap-4">
      {!data.bisa_dicatat && data.alasan ? <KotakPesan nada="proses">{data.alasan}</KotakPesan> : null}
      {data.bisa_dicatat && !sudahDicatat ? (
        <p className="text-sm text-muted-foreground">Belum dicatat. Semua murid diisi hadir; ubah yang tidak masuk, lalu simpan.</p>
      ) : null}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
        {data.murid.map(({ murid }) => {
          const baris = isian.find(({ murid_id }) => murid_id === murid.id);
          if (!baris) return null;
          return (
            <li key={murid.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0 sm:w-56">
                <p className="truncate font-bold">{murid.nama_lengkap}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{murid.nis}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <PilihStatus nama={murid.nama_lengkap} nilai={baris.status} onUbah={(status) => ubah(murid.id, { status })} nonaktif={!data.bisa_dicatat} />
                {baris.status !== "hadir" ? (
                  <Input
                    aria-label={`Keterangan ${murid.nama_lengkap}`}
                    placeholder="Keterangan (opsional), misalnya demam"
                    maxLength={255}
                    value={baris.keterangan ?? ""}
                    disabled={!data.bisa_dicatat}
                    onChange={(event) => ubah(murid.id, { keterangan: event.target.value })}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {simpan.isError ? (
        <KotakPesan nada="bahaya" judul="Absensi belum tersimpan">
          {pesanError(simpan.error)}
        </KotakPesan>
      ) : null}
      {data.bisa_dicatat ? (
        <Button size="lg" className="h-12 self-start" disabled={simpan.isPending} onClick={kirim}>
          {simpan.isPending ? "Menyimpan..." : sudahDicatat ? "Simpan Perubahan" : "Simpan Absensi"}
        </Button>
      ) : null}
    </div>
  );
}

/** Absensi harian murid satu kelas: pilih tanggal, isi status tiap murid, simpan sekaligus. */
export function IsianAbsensiMurid({ kelasId }: { kelasId: number }) {
  const { tanggal, hariIni, setTanggal } = useTanggalDipilih();
  const { data, isPending, isError, error, refetch, isPlaceholderData, dataUpdatedAt } = useAbsensiMuridHarian(kelasId, tanggal);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PilihTanggal tanggal={tanggal} hariIni={hariIni} onUbah={setTanggal} />
        <p aria-live="polite" className="font-heading font-bold">
          {formatHariTanggal(tanggal)}
        </p>
      </div>
      {isPending || isPlaceholderData ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.murid.length === 0 ? (
        <EmptyState judul="Belum ada murid di kelas ini." />
      ) : (
        // Isian dimulai ulang setiap data tanggal itu dimuat ulang, termasuk setelah disimpan.
        <FormHarian key={`${data.tanggal}-${dataUpdatedAt}`} kelasId={kelasId} data={data} />
      )}
    </div>
  );
}
