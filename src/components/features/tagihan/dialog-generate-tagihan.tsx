"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { pesanError } from "@/lib/api/errors";
import { useGenerateTagihan } from "@/lib/api/tagihan";
import { bulanJakarta } from "@/lib/tanggal";

/**
 * Generate tagihan bulanan manual (SA). Idempoten: murid yang sudah punya
 * tagihan periode itu (termasuk yang dibatalkan) dilewati backend.
 */
export function DialogGenerateTagihan() {
  const [terbuka, setTerbuka] = useState(false);
  const [periode, setPeriode] = useState(bulanJakarta(0));
  const [galat, setGalat] = useState<string | null>(null);
  const generate = useGenerateTagihan();

  const jalankan = () => {
    setGalat(null);
    if (!periode) {
      setGalat("Pilih bulan.");
      return;
    }
    generate.mutate(periode, {
      onSuccess: ({ data }) => {
        toast.success(`${data.dibuat} tagihan dibuat, ${data.dilewati} dilewati karena sudah ada.`);
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
        setGalat(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Generate Tagihan Bulanan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate tagihan bulanan</DialogTitle>
          <DialogDescription>
            Biasanya berjalan otomatis tiap tanggal 1. Pakai ini kalau ada murid baru atau jenis tagihan baru di tengah bulan. Aman
            dijalankan berulang: tagihan yang sudah ada tidak dibuat dua kali.
          </DialogDescription>
        </DialogHeader>
        <KolomTeks label="Bulan" type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} />
        {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={jalankan} disabled={generate.isPending}>
            {generate.isPending ? "Memproses..." : "Generate Tagihan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
