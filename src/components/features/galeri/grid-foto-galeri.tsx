"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type FotoGaleri = { id: number; url: string; caption: string | null };

type GridFotoGaleriProps = {
  judulAlbum: string;
  foto: FotoGaleri[];
  /** Foto private (kegiatan kelas) berupa signed URL yang kedaluwarsa, jadi tidak lewat optimasi gambar Next. */
  privat?: boolean;
  /** Keterangan tampil di bawah tiap foto, bukan hanya di lightbox. */
  keteranganDiBawah?: boolean;
};

export function GridFotoGaleri({ judulAlbum, foto, privat = false, keteranganDiBawah = false }: GridFotoGaleriProps) {
  const [indeksAktif, setIndeksAktif] = useState<number | null>(null);
  const aktif = indeksAktif === null ? null : foto[indeksAktif];

  const geser = (arah: 1 | -1) =>
    setIndeksAktif((indeks) => (indeks === null ? null : (indeks + arah + foto.length) % foto.length));

  const tanganiTombol = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") geser(1);
    if (event.key === "ArrowLeft") geser(-1);
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {foto.map((item, indeks) => (
          <li key={item.id} className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setIndeksAktif(indeks)}
              className="relative block aspect-square w-full overflow-hidden rounded-md bg-muted"
              aria-label={`Buka foto ${indeks + 1}${item.caption ? `: ${item.caption}` : ""}`}
            >
              <Image
                src={item.url}
                alt={item.caption ?? `Foto ${indeks + 1} dari ${judulAlbum}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                unoptimized={privat}
                className="object-cover"
              />
            </button>
            {keteranganDiBawah && item.caption ? <p className="text-sm text-muted-foreground">{item.caption}</p> : null}
          </li>
        ))}
      </ul>

      <Dialog open={aktif !== null} onOpenChange={(terbuka) => !terbuka && setIndeksAktif(null)}>
        <DialogContent className="max-w-[calc(100%-1rem)] gap-3 p-3 sm:max-w-4xl" onKeyDown={tanganiTombol}>
          {aktif && indeksAktif !== null ? (
            <>
              <DialogTitle className="pr-10 text-sm">
                {judulAlbum} · Foto {indeksAktif + 1} dari {foto.length}
              </DialogTitle>
              <DialogDescription className={aktif.caption ? undefined : "sr-only"}>
                {aktif.caption ?? "Tanpa keterangan"}
              </DialogDescription>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-foreground">
                <Image
                  src={aktif.url}
                  alt={aktif.caption ?? `Foto ${indeksAktif + 1} dari ${judulAlbum}`}
                  fill
                  sizes="(min-width: 896px) 896px, 100vw"
                  unoptimized={privat}
                  className="object-contain"
                />
              </div>
              {foto.length > 1 ? (
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => geser(-1)}>
                    <ChevronLeft aria-hidden="true" />
                    Sebelumnya
                  </Button>
                  <Button variant="outline" onClick={() => geser(1)}>
                    Berikutnya
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
