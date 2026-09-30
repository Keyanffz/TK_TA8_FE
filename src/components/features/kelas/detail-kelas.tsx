"use client";

import Link from "next/link";
import { toast } from "sonner";

import { TambahMuridKelas } from "@/components/features/kelas/tambah-murid-kelas";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { FotoProfil } from "@/components/shared/foto-profil";
import { GalatMuat } from "@/components/shared/galat-muat";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailKelas, useKeluarkanMurid } from "@/lib/api/kelas";
import { LABEL_JENIS_KELAMIN, LABEL_STATUS_KELAS_MURID, LABEL_TINGKAT } from "@/lib/constants/label";
import type { KelasDetail } from "@/types/domain";

// status_kelas bertipe string di api.json (enum StatusKelasMurid tidak diekspor).
function labelStatusKelas(status: string): string {
  return Object.entries(LABEL_STATUS_KELAS_MURID).find(([kunci]) => kunci === status)?.[1] ?? status;
}

function DaftarMuridKelas({ kelas, bisaKelola }: { kelas: KelasDetail; bisaKelola: boolean }) {
  const keluarkan = useKeluarkanMurid(kelas.id);

  if (kelas.murid.length === 0) {
    return <EmptyState judul="Belum ada murid di kelas ini." deskripsi={bisaKelola ? "Pakai tombol Tempatkan Murid untuk memasukkan murid." : undefined} />;
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
      {kelas.murid.map((murid) => (
        <li key={murid.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={40} className="size-10 text-sm" />
          <div className="min-w-0 flex-1">
            <Link href={`/mudarris/murid/${murid.id}`} className="block truncate font-bold hover:underline">
              {murid.nama_lengkap}
            </Link>
            <p className="text-xs text-muted-foreground">
              <span className="tabular-nums">{murid.nis}</span> · {murid.nama_panggilan} · {LABEL_JENIS_KELAMIN[murid.jenis_kelamin]}
            </p>
          </div>
          {murid.status_kelas !== "aktif" ? <StatusBadge nada="netral">{labelStatusKelas(murid.status_kelas)}</StatusBadge> : null}
          {bisaKelola && murid.status_kelas === "aktif" ? (
            <DialogKonfirmasi
              pemicu={
                <Button variant="ghost" size="sm">
                  Keluarkan
                </Button>
              }
              judul={`Keluarkan ${murid.nama_panggilan} dari ${kelas.nama}?`}
              deskripsi="Murid tidak dihapus, hanya penempatannya di kelas ini. Tagihan dan rapor yang sudah ada tidak berubah."
              labelAksi="Keluarkan dari Kelas"
              berbahaya
              onKonfirmasi={async () => {
                await keluarkan.mutateAsync(murid.id);
                toast.success(`${murid.nama_panggilan} dikeluarkan dari ${kelas.nama}.`);
              }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function DetailKelas({ id, bisaKelola }: { id: number; bisaKelola: boolean }) {
  const { data: kelas, isPending, isError, error, refetch } = useDetailKelas(id);

  if (isPending) return <Skeleton aria-label="Memuat kelas" className="h-80 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl bg-primary p-5 text-primary-foreground">
        <div>
          <p className="text-sm text-primary-foreground/90">
            {LABEL_TINGKAT[kelas.tingkat]} · Tahun Ajaran {kelas.tahun_ajaran.nama}
          </p>
          <h1 className="font-heading text-2xl leading-tight font-extrabold">{kelas.nama}</h1>
          <p className="mt-1 text-sm">
            Wali kelas: <span className="font-bold">{kelas.wali_kelas?.nama ?? "belum ditentukan"}</span>
            {kelas.guru_pendamping ? (
              <>
                {" "}· Pendamping: <span className="font-bold">{kelas.guru_pendamping.nama}</span>
              </>
            ) : null}
          </p>
        </div>
        <p className="font-heading text-xl font-extrabold tabular-nums">
          {kelas.jumlah_murid}
          <span className="text-base font-bold text-primary-foreground/90"> / {kelas.kapasitas} murid</span>
        </p>
      </div>
      <section aria-labelledby="judul-murid-kelas">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="judul-murid-kelas" className="text-lg font-extrabold">
            Murid
          </h2>
          {bisaKelola ? <TambahMuridKelas kelas={kelas} /> : null}
        </div>
        <DaftarMuridKelas kelas={kelas} bisaKelola={bisaKelola} />
      </section>
    </div>
  );
}
