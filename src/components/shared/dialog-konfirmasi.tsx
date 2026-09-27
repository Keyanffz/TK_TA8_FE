"use client";

import { useId, useState, type ReactNode } from "react";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { pesanError } from "@/lib/api/errors";

type DialogKonfirmasiProps = {
  pemicu: ReactNode;
  judul: string;
  deskripsi: ReactNode;
  labelAksi: string;
  /** Tombol merah untuk aksi yang merugikan (hapus, tolak, nonaktifkan). */
  berbahaya?: boolean;
  /** Minta alasan (wajib diisi), misalnya tolak pendaftaran guru atau batalkan tagihan. */
  labelAlasan?: string;
  onKonfirmasi: (alasan: string) => Promise<unknown>;
};

/**
 * Konfirmasi sebelum aksi yang sulit dibatalkan (B2: ConfirmDialog). Error dari
 * backend ditampilkan di dalam dialog supaya pengguna tahu kenapa aksi gagal.
 */
export function DialogKonfirmasi({ pemicu, judul, deskripsi, labelAksi, berbahaya, labelAlasan, onKonfirmasi }: DialogKonfirmasiProps) {
  const idAlasan = useId();
  const [terbuka, setTerbuka] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [galatAlasan, setGalatAlasan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  const ubahTerbuka = (buka: boolean) => {
    setTerbuka(buka);
    if (!buka) {
      setAlasan("");
      setGalat(null);
      setGalatAlasan(null);
    }
  };

  const jalankan = async () => {
    if (labelAlasan && alasan.trim() === "") {
      setGalatAlasan(`${labelAlasan} wajib diisi.`);
      return;
    }
    setMemproses(true);
    setGalat(null);
    try {
      await onKonfirmasi(alasan.trim());
      ubahTerbuka(false);
    } catch (error) {
      setGalat(pesanError(error));
    } finally {
      setMemproses(false);
    }
  };

  return (
    <Dialog open={terbuka} onOpenChange={ubahTerbuka}>
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          <DialogDescription asChild>
            <div>{deskripsi}</div>
          </DialogDescription>
        </DialogHeader>
        {labelAlasan ? (
          <Field data-invalid={galatAlasan ? true : undefined}>
            <FieldLabel htmlFor={idAlasan}>{labelAlasan}</FieldLabel>
            <Textarea
              id={idAlasan}
              rows={3}
              maxLength={500}
              value={alasan}
              aria-invalid={galatAlasan ? true : undefined}
              onChange={(event) => {
                setAlasan(event.target.value);
                setGalatAlasan(null);
              }}
            />
            {galatAlasan ? <FieldError>{galatAlasan}</FieldError> : null}
          </Field>
        ) : null}
        {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => ubahTerbuka(false)} disabled={memproses}>
            Batal
          </Button>
          <Button variant={berbahaya ? "destructive" : "default"} onClick={() => void jalankan()} disabled={memproses}>
            {memproses ? "Memproses..." : labelAksi}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
