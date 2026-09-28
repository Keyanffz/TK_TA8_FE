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

type Foto = { id: number; url: string; caption: string | null; urutan: number };
type UbahFoto = { caption?: string | null; urutan?: number };

type KelolaFotoProps = {
  foto: Foto[];
  deskripsi: string;
  /** Foto kegiatan (private) berupa signed URL, jadi tidak lewat optimasi gambar Next. */
  privat?: boolean;
  maksPerUnggahan: number;
  /** Sisa kuota foto; null kalau tidak dibatasi (galeri). */
  sisa: number | null;
  contohKeterangan: string;
  ubahFoto: (id: number, body: UbahFoto) => Promise<unknown>;
  hapusFoto: (id: number) => Promise<unknown>;
  tambahFoto: (foto: File[]) => Promise<{ message: string }>;
};

function BarisFoto({ foto, nomor, jumlah, privat, contoh, onGeser, ubahFoto, hapusFoto }: {
  foto: Foto;
  nomor: number;
  jumlah: number;
  privat: boolean;
  contoh: string;
  onGeser: (arah: -1 | 1) => void;
  ubahFoto: KelolaFotoProps["ubahFoto"];
  hapusFoto: KelolaFotoProps["hapusFoto"];
}) {
  const [caption, setCaption] = useState(foto.caption ?? "");
  const [menyimpan, setMenyimpan] = useState(false);
  const berubah = caption.trim() !== (foto.caption ?? "");

  const simpanCaption = async () => {
    setMenyimpan(true);
    try {
      await ubahFoto(foto.id, { caption: caption.trim() || null });
      toast.success(`Keterangan foto ${nomor} tersimpan.`);
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
      <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm bg-muted sm:w-32">
        <Image src={foto.url} alt={foto.caption ?? `Foto ${nomor}`} fill unoptimized={privat} sizes="128px" className="object-cover" />
        <span className="absolute top-1 left-1 rounded-full bg-foreground/75 px-2 text-xs font-bold text-white">{nomor}</span>
      </span>
      <form
        className="flex min-w-0 flex-1 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (berubah) void simpanCaption();
        }}
      >
        <Input aria-label={`Keterangan foto ${nomor}`} placeholder={contoh} maxLength={255} value={caption} onChange={(event) => setCaption(event.target.value)} />
        <Button type="submit" variant="outline" disabled={!berubah || menyimpan}>
          {menyimpan ? "Menyimpan..." : "Simpan"}
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
          deskripsi="Foto dihapus dan tidak bisa dikembalikan."
          labelAksi="Hapus Foto"
          berbahaya
          onKonfirmasi={async () => {
            await hapusFoto(foto.id);
            toast.success("Foto dihapus.");
          }}
        />
      </div>
    </li>
  );
}

/** Keterangan, urutan, hapus, dan tambah foto (kegiatan kelas dan album galeri). */
export function KelolaFoto({ foto, deskripsi, privat = false, maksPerUnggahan, sisa, contohKeterangan, ubahFoto, hapusFoto, tambahFoto }: KelolaFotoProps) {
  const [baru, setBaru] = useState<File[]>([]);
  const [mengunggah, setMengunggah] = useState(false);
  const [menggeser, setMenggeser] = useState(false);

  // Urutan baru ditulis ulang 1..n hanya untuk foto yang nilainya berubah (biasanya dua foto).
  const geser = async (indeks: number, arah: -1 | 1) => {
    const susunan = [...foto];
    [susunan[indeks], susunan[indeks + arah]] = [susunan[indeks + arah], susunan[indeks]];
    setMenggeser(true);
    try {
      for (const [posisi, item] of susunan.entries()) {
        if (item.urutan !== posisi + 1) await ubahFoto(item.id, { urutan: posisi + 1 });
      }
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMenggeser(false);
    }
  };

  const unggah = async () => {
    setMengunggah(true);
    try {
      toast.success((await tambahFoto(baru)).message);
      setBaru([]);
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMengunggah(false);
    }
  };

  const maks = sisa === null ? maksPerUnggahan : Math.min(sisa, maksPerUnggahan);

  return (
    <section aria-labelledby="judul-kelola-foto" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 id="judul-kelola-foto" className="text-lg font-extrabold">
        Kelola foto
      </h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{deskripsi}</p>
      {foto.length > 0 ? (
        <ol className={`flex flex-col gap-3 ${menggeser ? "pointer-events-none opacity-60" : ""}`}>
          {foto.map((item, indeks) => (
            <BarisFoto
              key={item.id}
              foto={item}
              nomor={indeks + 1}
              jumlah={foto.length}
              privat={privat}
              contoh={contohKeterangan}
              onGeser={(arah) => void geser(indeks, arah)}
              ubahFoto={ubahFoto}
              hapusFoto={hapusFoto}
            />
          ))}
        </ol>
      ) : null}
      <div className="mt-5 flex flex-col gap-3">
        {maks > 0 ? (
          <>
            <ZonaUnggah
              label="Tambah foto"
              deskripsi={
                sisa === null ? `Paling banyak ${maksPerUnggahan} foto sekali unggah.` : `Masih bisa ditambah ${sisa} foto, paling banyak ${maksPerUnggahan} sekali unggah.`
              }
              maks={maks}
              nilai={baru}
              onUbah={setBaru}
            />
            {baru.length > 0 ? (
              <Button className="self-start" disabled={mengunggah} onClick={() => void unggah()}>
                {mengunggah ? "Mengunggah..." : `Unggah ${baru.length} Foto`}
              </Button>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Batas jumlah foto sudah tercapai.</p>
        )}
      </div>
    </section>
  );
}
