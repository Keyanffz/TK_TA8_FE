"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DialogAlbum } from "@/components/features/galeri-sekolah/dialog-album";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KelolaFoto } from "@/components/shared/kelola-foto";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MAKS_FOTO_GALERI_PER_UNGGAHAN, useDetailAlbum, useHapusAlbum, useHapusFotoGaleri, useTambahFotoAlbum, useUbahFotoGaleri } from "@/lib/api/galeri";
import { formatTanggal } from "@/lib/format";

export function DetailAlbum({ id }: { id: number }) {
  const router = useRouter();
  const { data: album, isPending, isError, error, refetch } = useDetailAlbum(id);
  const hapus = useHapusAlbum();
  const tambah = useTambahFotoAlbum(id);
  const ubah = useUbahFotoGaleri();
  const hapusFoto = useHapusFotoGaleri();

  if (isPending) return <Skeleton aria-label="Memuat album" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <StatusBadge nada={album.is_publik ? "sukses" : "netral"}>{album.is_publik ? "Tampil di website" : "Disembunyikan"}</StatusBadge>
          {formatTanggal(album.tanggal)} · {album.jumlah_foto} foto
        </p>
        <h1 className="text-xl leading-tight font-extrabold">{album.judul}</h1>
        {album.deskripsi ? <p className="max-w-prose whitespace-pre-line text-muted-foreground">{album.deskripsi}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2">
          <DialogAlbum
            album={album}
            pemicu={
              <Button variant="outline">
                <Pencil aria-hidden="true" />
                Ubah Album
              </Button>
            }
          />
          {album.is_publik ? (
            <a href={`/galeri/${album.slug}`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink aria-hidden="true" />
              Lihat di Website
            </a>
          ) : null}
          <DialogKonfirmasi
            pemicu={
              <Button variant="ghost">
                <Trash2 aria-hidden="true" />
                Hapus Album
              </Button>
            }
            judul={`Hapus album "${album.judul}"?`}
            deskripsi={`Album beserta ${album.jumlah_foto} fotonya dihapus dari website dan tidak bisa dikembalikan.`}
            labelAksi="Hapus Album"
            berbahaya
            onKonfirmasi={async () => {
              toast.success((await hapus.mutateAsync(album.id)).message);
              router.replace("/mudarris/website/galeri");
            }}
          />
        </div>
      </header>
      <KelolaFoto
        foto={album.foto}
        deskripsi="Urutan di sini sama dengan urutan di halaman galeri website. Keterangan tampil saat foto diperbesar."
        maksPerUnggahan={MAKS_FOTO_GALERI_PER_UNGGAHAN}
        sisa={null}
        contohKeterangan="Keterangan foto, misalnya: Tari saman kelompok B"
        ubahFoto={(fotoId, body) => ubah.mutateAsync({ id: fotoId, ...body })}
        hapusFoto={(fotoId) => hapusFoto.mutateAsync(fotoId)}
        tambahFoto={(foto) => tambah.mutateAsync(foto)}
      />
    </div>
  );
}
