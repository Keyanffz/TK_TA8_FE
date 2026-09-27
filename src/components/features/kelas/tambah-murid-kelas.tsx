"use client";

import { useState } from "react";
import { toast } from "sonner";

import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomCari } from "@/components/shared/kolom-cari";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { pesanError } from "@/lib/api/errors";
import { useTempatkanMurid } from "@/lib/api/kelas";
import { useDaftarMurid } from "@/lib/api/murid";
import type { KelasDetail } from "@/types/domain";

/** Pilih murid aktif lalu tempatkan di kelas ini (`POST /kelas/{id}/murid`); kapasitas dicek backend. */
export function TambahMuridKelas({ kelas }: { kelas: KelasDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const [cari, setCari] = useState("");
  const [dipilih, setDipilih] = useState<ReadonlySet<number>>(new Set());
  const [galat, setGalat] = useState<string | null>(null);
  const tempatkan = useTempatkanMurid(kelas.id);
  const murid = useDaftarMurid({ search: cari, halaman: 1, kelasId: null, status: "aktif", tingkat: null, perHalaman: 30 }, terbuka);
  const sudahDiKelas = new Set(kelas.murid.map((item) => item.id));
  const sisa = kelas.kapasitas - kelas.jumlah_murid;

  const ubahPilihan = (id: number) =>
    setDipilih((lama) => {
      const baru = new Set(lama);
      if (baru.has(id)) baru.delete(id);
      else baru.add(id);
      return baru;
    });

  const simpan = () => {
    setGalat(null);
    tempatkan.mutate([...dipilih], {
      onSuccess: () => {
        toast.success(`${dipilih.size} murid ditempatkan di ${kelas.nama}.`);
        setTerbuka(false);
      },
      onError: (error) => setGalat(pesanError(error)),
    });
  };

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        setDipilih(new Set());
        setGalat(null);
      }}
    >
      <DialogTrigger asChild>
        <Button>Tempatkan Murid</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tempatkan murid di {kelas.nama}</DialogTitle>
          <DialogDescription>
            Sisa tempat {Math.max(0, sisa)} dari {kelas.kapasitas}. Satu murid hanya boleh di satu kelas per tahun ajaran.
          </DialogDescription>
        </DialogHeader>
        <KolomCari nilai={cari} onUbah={setCari} label="Cari murid" placeholder="Cari nama atau NIS" />
        <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
          {murid.isPending ? (
            <Skeleton className="m-2 h-24" />
          ) : murid.isError ? (
            <p className="p-3 text-sm text-destructive">{pesanError(murid.error)}</p>
          ) : murid.data.data.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Tidak ada murid aktif yang cocok.</p>
          ) : (
            <ul className="divide-y divide-border">
              {murid.data.data.map((item) => {
                const diSini = sudahDiKelas.has(item.id);
                return (
                  <li key={item.id}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 px-3 py-2 has-disabled:cursor-default has-disabled:opacity-60">
                      <input
                        type="checkbox"
                        className="size-5 accent-primary"
                        disabled={diSini}
                        checked={diSini || dipilih.has(item.id)}
                        onChange={() => ubahPilihan(item.id)}
                      />
                      <FotoProfil nama={item.nama_lengkap} url={item.foto_url} ukuran={32} className="size-8 text-xs" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{item.nama_lengkap}</span>
                        <span className="block text-xs text-muted-foreground">
                          {item.nis} · {diSini ? "sudah di kelas ini" : (item.kelas?.nama ?? "belum punya kelas")}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={simpan} disabled={dipilih.size === 0 || tempatkan.isPending}>
            {tempatkan.isPending ? "Menyimpan..." : `Tempatkan ${dipilih.size || ""} Murid`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
