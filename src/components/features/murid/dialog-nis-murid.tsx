"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { ApiError, pesanError } from "@/lib/api/errors";
import { useIsiNis } from "@/lib/api/murid";
import type { MuridDetail } from "@/types/domain";

/**
 * Kepala Sekolah mengisi NIS murid yang menunggu NIS atau mengubahnya. Backend yang memeriksa format dan
 * keunikan; pesannya muncul di bawah isian.
 */
export function DialogNisMurid({ murid }: { murid: MuridDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const [nis, setNis] = useState("");
  const [galat, setGalat] = useState<{ nis?: string; umum?: string }>({});
  const isiNis = useIsiNis(murid.id);
  const mengubah = murid.nis !== null;
  const akunIkutBerubah = murid.wali.filter((wali) => wali.username !== null && wali.username === murid.nis);
  const akanBuatAkun = !mengubah && murid.status === "aktif" && murid.wali.length === 0;

  const simpan = async () => {
    if (!nis.trim()) return setGalat({ nis: "NIS wajib diisi." });
    setGalat({});
    try {
      toast.success((await isiNis.mutateAsync(nis)).message);
      setTerbuka(false);
    } catch (error) {
      const pesanNis = error instanceof ApiError ? error.errors?.nis?.[0] : undefined;
      setGalat(pesanNis ? { nis: pesanNis } : { umum: pesanError(error) });
    }
  };

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) {
          setNis(murid.nis ?? "");
          setGalat({});
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={mengubah ? "outline" : "default"}>{mengubah ? "Ubah NIS" : "Isi NIS"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mengubah ? "Ubah" : "Isi"} NIS {murid.nama_panggilan}
          </DialogTitle>
          <DialogDescription>
            Huruf, angka, titik, strip, atau garis miring, maksimal 20 karakter. Disimpan dengan huruf besar tanpa spasi.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <KolomTeks label="NIS" value={nis} onChange={(event) => setNis(event.target.value)} autoComplete="off" className="tabular-nums" error={galat.nis} />
          {akunIkutBerubah.length > 0 ? (
            <KotakPesan nada="menunggu" judul="Username login wali ikut berubah">
              {akunIkutBerubah.map((wali) => wali.nama).join(", ")} sekarang masuk dengan username {murid.nis}. Setelah NIS diubah, username login
              menjadi NIS baru; password tidak berubah dan wali mendapat pemberitahuan di aplikasi. Cetak ulang kartu akunnya.
            </KotakPesan>
          ) : null}
          {akanBuatAkun ? (
            <KotakPesan nada="proses">Akun wali dibuat dengan username NIS ini dan password awal tanggal lahir anak (DDMMYYYY).</KotakPesan>
          ) : null}
          {galat.umum ? <KotakPesan nada="bahaya">{galat.umum}</KotakPesan> : null}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={() => void simpan()} disabled={isiNis.isPending}>
            {isiNis.isPending ? "Menyimpan..." : "Simpan NIS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
