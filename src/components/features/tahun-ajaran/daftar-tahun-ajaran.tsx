"use client";

import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormTahunAjaran } from "@/components/features/tahun-ajaran/form-tahun-ajaran";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAktifkanTahunAjaran, useDaftarTahunAjaran, useHapusTahunAjaran } from "@/lib/api/tahun-ajaran";
import { rentangTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DaftarTahunAjaran() {
  const { data, isPending, isError, error, refetch } = useDaftarTahunAjaran();
  const aktifkan = useAktifkanTahunAjaran();
  const hapus = useHapusTahunAjaran();

  if (isPending) return <Skeleton aria-label="Memuat tahun ajaran" className="h-40 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.length === 0) {
    return (
      <EmptyState
        judul="Belum ada tahun ajaran."
        deskripsi="Tambahkan tahun ajaran dulu, lalu aktifkan supaya kelas dan tagihan bulanan bisa dibuat."
        aksi={<FormTahunAjaran tahunAjaran={null} pemicu={<Button>Tambah Tahun Ajaran</Button>} />}
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {data.map((ta) => (
        <li
          key={ta.id}
          className={cn(
            "flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-sm",
            ta.is_aktif ? "border-2 border-primary" : "border-border",
          )}
        >
          <div className="min-w-40 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-extrabold tabular-nums">{ta.nama}</p>
              {ta.is_aktif ? <StatusBadge nada="sukses">Aktif</StatusBadge> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {rentangTanggal(ta.tanggal_mulai, ta.tanggal_selesai)} · Semester {ta.semester_aktif}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ta.is_aktif ? null : (
              <DialogKonfirmasi
                pemicu={<Button variant="secondary">Aktifkan</Button>}
                judul={`Aktifkan Tahun Ajaran ${ta.nama}?`}
                deskripsi="Tahun ajaran yang sekarang aktif akan dinonaktifkan. Kelas, tagihan bulanan, dan rapor memakai tahun ajaran aktif."
                labelAksi="Aktifkan"
                onKonfirmasi={async () => {
                  await aktifkan.mutateAsync(ta.id);
                  toast.success(`Tahun Ajaran ${ta.nama} sekarang aktif.`);
                }}
              />
            )}
            <FormTahunAjaran
              tahunAjaran={ta}
              pemicu={
                <Button variant="outline" size="icon" aria-label={`Ubah ${ta.nama}`}>
                  <Pencil aria-hidden="true" />
                </Button>
              }
            />
            {ta.is_aktif ? null : (
              <DialogKonfirmasi
                pemicu={
                  <Button variant="outline" size="icon" aria-label={`Hapus ${ta.nama}`}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                }
                judul={`Hapus Tahun Ajaran ${ta.nama}?`}
                deskripsi="Hanya tahun ajaran yang belum dipakai (belum punya kelas atau tagihan) yang bisa dihapus."
                labelAksi="Hapus"
                berbahaya
                onKonfirmasi={async () => {
                  await hapus.mutateAsync(ta.id);
                  toast.success(`Tahun Ajaran ${ta.nama} dihapus.`);
                }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
