"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { PilihMurid, type MuridTerpilih } from "@/components/shared/pilih-murid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { pesanError } from "@/lib/api/errors";
import { useTempatkanMurid } from "@/lib/api/kelas";
import type { KelasDetail } from "@/types/domain";

/** Pilih murid aktif lalu tempatkan di kelas ini (`POST /kelas/{id}/murid`); kapasitas dicek backend. */
export function TambahMuridKelas({ kelas }: { kelas: KelasDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState<MuridTerpilih[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const tempatkan = useTempatkanMurid(kelas.id);
  const sudahDiKelas = new Set(kelas.murid.map((item) => item.id));
  const sisa = kelas.kapasitas - kelas.jumlah_murid;

  const simpan = () => {
    setGalat(null);
    tempatkan.mutate(dipilih.map((murid) => murid.id), {
      onSuccess: () => {
        toast.success(`${dipilih.length} murid ditempatkan di ${kelas.nama}.`);
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
        setDipilih([]);
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
        <PilihMurid
          dipilih={dipilih}
          onUbah={setDipilih}
          alasanNonaktif={(murid) => (sudahDiKelas.has(murid.id) ? "sudah di kelas ini" : null)}
        />
        {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={simpan} disabled={dipilih.length === 0 || tempatkan.isPending}>
            {tempatkan.isPending ? "Menyimpan..." : `Tempatkan ${dipilih.length || ""} Murid`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
