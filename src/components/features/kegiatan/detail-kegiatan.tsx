"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { GridFotoGaleri } from "@/components/features/galeri/grid-foto-galeri";
import { FormKegiatan } from "@/components/features/kegiatan/form-kegiatan";
import { KelolaFotoKegiatan } from "@/components/features/kegiatan/kelola-foto-kegiatan";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailKegiatan, useHapusKegiatan, useUbahKegiatan } from "@/lib/api/kegiatan";
import { useSession } from "@/lib/auth/use-session";
import { formatTanggal } from "@/lib/format";
import type { KegiatanKelas } from "@/types/domain";

function UbahKegiatan({ kegiatan, onSelesai }: { kegiatan: KegiatanKelas; onSelesai: () => void }) {
  const ubah = useUbahKegiatan(kegiatan.id);
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-extrabold">Ubah kegiatan</h2>
      <FormKegiatan
        kegiatan={kegiatan}
        labelSimpan="Simpan Perubahan"
        onBatal={onSelesai}
        kirim={async ({ tanggal, tema, judul, deskripsi }) => {
          const { message } = await ubah.mutateAsync({ tanggal, tema, judul, deskripsi });
          toast.success(message);
          onSelesai();
        }}
      />
    </div>
  );
}

export function DetailKegiatan({ id }: { id: number }) {
  const router = useRouter();
  const { user, isSuperAdmin } = useSession();
  const { data: kegiatan, isPending, isError, error, refetch } = useDetailKegiatan(id);
  const hapus = useHapusKegiatan();
  const [mengubah, setMengubah] = useState(false);

  if (isPending) return <Skeleton aria-label="Memuat kegiatan" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const bolehKelola = isSuperAdmin || (user?.guru?.id !== undefined && user.guru.id === kegiatan.guru.id);

  return (
    <div className="flex flex-col gap-6">
      {mengubah ? (
        <UbahKegiatan kegiatan={kegiatan} onSelesai={() => setMengubah(false)} />
      ) : (
        <header className="flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={kegiatan.tanggal}>{formatTanggal(kegiatan.tanggal)}</time>
            <span>· {kegiatan.kelas.nama}</span>
            {kegiatan.tema ? <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-xs font-bold text-highlight-foreground">{kegiatan.tema}</span> : null}
          </p>
          <h1 className="text-xl leading-tight font-extrabold">{kegiatan.judul}</h1>
          {kegiatan.deskripsi ? <p className="max-w-prose whitespace-pre-line">{kegiatan.deskripsi}</p> : null}
          <p className="text-sm text-muted-foreground">Dicatat oleh {kegiatan.guru.nama}</p>
          {bolehKelola ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setMengubah(true)}>
                <Pencil aria-hidden="true" />
                Ubah Kegiatan
              </Button>
              <DialogKonfirmasi
                pemicu={
                  <Button variant="ghost">
                    <Trash2 aria-hidden="true" />
                    Hapus Kegiatan
                  </Button>
                }
                judul={`Hapus kegiatan "${kegiatan.judul}"?`}
                deskripsi={`Kegiatan beserta ${kegiatan.foto.length} fotonya dihapus dan tidak bisa dikembalikan.`}
                labelAksi="Hapus Kegiatan"
                berbahaya
                onKonfirmasi={async () => {
                  const { message } = await hapus.mutateAsync(kegiatan.id);
                  toast.success(message);
                  router.replace("/dashboard/kegiatan");
                }}
              />
            </div>
          ) : null}
        </header>
      )}

      {kegiatan.foto.length > 0 ? (
        <GridFotoGaleri judulAlbum={kegiatan.judul} foto={kegiatan.foto} privat keteranganDiBawah />
      ) : (
        <EmptyState judul="Belum ada foto untuk kegiatan ini." deskripsi={bolehKelola ? "Tambahkan foto di bagian Kelola foto." : undefined} />
      )}

      {bolehKelola ? <KelolaFotoKegiatan kegiatan={kegiatan} /> : null}
    </div>
  );
}
