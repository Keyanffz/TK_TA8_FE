"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pesanError } from "@/lib/api/errors";
import {
  MAKS_FOTO_PER_KEGIATAN,
  MAKS_FOTO_PER_UNGGAHAN,
  useHapusFotoKegiatan,
  useTambahFotoKegiatan,
  useUbahFotoKegiatan,
} from "@/lib/api/kegiatan";
import type { KegiatanKelas } from "@/types/domain";

type Foto = KegiatanKelas["foto"][number];

function BarisFoto({ foto, nomor, jumlah, onGeser }: { foto: Foto; nomor: number; jumlah: number; onGeser: (arah: -1 | 1) => void }) {
  const [caption, setCaption] = useState(foto.caption ?? "");
  const ubah = useUbahFotoKegiatan();
  const hapus = useHapusFotoKegiatan();
  const berubah = caption.trim() !== (foto.caption ?? "");

  const simpanCaption = () =>
    ubah.mutate(
      { id: foto.id, caption: caption.trim() || null },
      { onSuccess: () => toast.success(`Keterangan foto ${nomor} tersimpan.`), onError: (error) => toast.error(pesanError(error)) },
    );

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
      <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm bg-muted sm:w-32">
        <Image src={foto.url} alt={foto.caption ?? `Foto ${nomor}`} fill unoptimized className="object-cover" />
        <span className="absolute top-1 left-1 rounded-full bg-foreground/75 px-2 text-xs font-bold text-white">{nomor}</span>
      </span>
      <form
        className="flex min-w-0 flex-1 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (berubah) simpanCaption();
        }}
      >
        <Input
          aria-label={`Keterangan foto ${nomor}`}
          placeholder="Keterangan foto, misalnya: Kinan menyiram tanaman"
          maxLength={255}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
        <Button type="submit" variant="outline" disabled={!berubah || ubah.isPending}>
          {ubah.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
      <div className="flex gap-1 self-end sm:self-auto">
        <Button variant="ghost" size="icon" aria-label={`Pindah foto ${nomor} ke atas`} disabled={nomor === 1} onClick={() => onGeser(-1)}>
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Pindah foto ${nomor} ke bawah`} disabled={nomor === jumlah} onClick={() => onGeser(1)}>
          <ArrowDown aria-hidden="true" />
        </Button>
        <DialogKonfirmasi
          pemicu={
            <Button variant="ghost" size="icon" aria-label={`Hapus foto ${nomor}`}>
              <Trash2 aria-hidden="true" />
            </Button>
          }
          judul={`Hapus foto ${nomor}?`}
          deskripsi="Foto dihapus dari kegiatan ini dan tidak bisa dikembalikan."
          labelAksi="Hapus Foto"
          berbahaya
          onKonfirmasi={async () => {
            await hapus.mutateAsync(foto.id);
            toast.success("Foto dihapus.");
          }}
        />
      </div>
    </li>
  );
}

/** Keterangan, urutan, hapus, dan tambah foto kegiatan (pembuat kegiatan dan Kepala Sekolah). */
export function KelolaFotoKegiatan({ kegiatan }: { kegiatan: KegiatanKelas }) {
  const [baru, setBaru] = useState<File[]>([]);
  const tambah = useTambahFotoKegiatan(kegiatan.id);
  const ubah = useUbahFotoKegiatan();
  const [menggeser, setMenggeser] = useState(false);
  const foto = kegiatan.foto;
  const sisa = MAKS_FOTO_PER_KEGIATAN - foto.length;

  // Urutan baru ditulis ulang 1..n hanya untuk foto yang nilainya berubah (biasanya dua foto).
  const geser = async (indeks: number, arah: -1 | 1) => {
    const susunan = [...foto];
    [susunan[indeks], susunan[indeks + arah]] = [susunan[indeks + arah], susunan[indeks]];
    setMenggeser(true);
    try {
      for (const [posisi, item] of susunan.entries()) {
        if (item.urutan !== posisi + 1) await ubah.mutateAsync({ id: item.id, urutan: posisi + 1 });
      }
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMenggeser(false);
    }
  };

  const unggah = () =>
    tambah.mutate(baru, {
      onSuccess: ({ message }) => {
        toast.success(message);
        setBaru([]);
      },
      onError: (error) => toast.error(pesanError(error)),
    });

  return (
    <section aria-labelledby="judul-kelola-foto" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 id="judul-kelola-foto" className="text-lg font-extrabold">
        Kelola foto
      </h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        Urutan di sini sama dengan urutan yang dilihat wali murid. Foto pertama menjadi sampul di feed.
      </p>
      {foto.length > 0 ? (
        <ol className={`flex flex-col gap-3 ${menggeser ? "pointer-events-none opacity-60" : ""}`}>
          {foto.map((item, indeks) => (
            <BarisFoto key={item.id} foto={item} nomor={indeks + 1} jumlah={foto.length} onGeser={(arah) => void geser(indeks, arah)} />
          ))}
        </ol>
      ) : null}
      <div className="mt-5 flex flex-col gap-3">
        {sisa > 0 ? (
          <>
            <ZonaUnggah
              label="Tambah foto"
              deskripsi={`Masih bisa ditambah ${sisa} foto, paling banyak ${MAKS_FOTO_PER_UNGGAHAN} sekali unggah.`}
              maks={Math.min(sisa, MAKS_FOTO_PER_UNGGAHAN)}
              nilai={baru}
              onUbah={setBaru}
            />
            {baru.length > 0 ? (
              <Button className="self-start" disabled={tambah.isPending} onClick={unggah}>
                {tambah.isPending ? "Mengunggah..." : `Unggah ${baru.length} Foto`}
              </Button>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Kegiatan ini sudah berisi {MAKS_FOTO_PER_KEGIATAN} foto, batas satu kegiatan.</p>
        )}
      </div>
    </section>
  );
}
