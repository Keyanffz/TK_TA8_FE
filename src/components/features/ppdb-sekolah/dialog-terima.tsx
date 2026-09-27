"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KolomPilih } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { pesanError } from "@/lib/api/errors";
import { useDaftarKelas } from "@/lib/api/kelas";
import { useTerimaPendaftaran } from "@/lib/api/ppdb";
import { LABEL_TINGKAT } from "@/lib/constants/label";
import type { PendaftaranDetail } from "@/types/domain";

/**
 * Terima pendaftaran dengan kelas opsional (A7 `POST /pendaftaran/{id}/terima`). Pilihan kelas hanya
 * kelas di tahun ajaran tujuan; kelas dengan kelompok yang sama didahulukan, kelas penuh tidak bisa dipilih.
 */
export function DialogTerima({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const [kelasId, setKelasId] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const kelas = useDaftarKelas(pendaftaran.tahun_ajaran.id);
  const terima = useTerimaPendaftaran(pendaftaran.id);
  const pilihan = [...(kelas.data ?? [])].sort(
    (a, b) => Number(b.tingkat === pendaftaran.tingkat_tujuan) - Number(a.tingkat === pendaftaran.tingkat_tujuan),
  );

  const simpan = () => {
    setGalat(null);
    terima.mutate(kelasId ? Number(kelasId) : null, {
      onSuccess: ({ message }) => {
        toast.success(message);
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
        setKelasId("");
        setGalat(null);
      }}
    >
      <DialogTrigger asChild>
        <Button>Terima Pendaftaran</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terima {pendaftaran.nama_panggilan}?</DialogTitle>
          <DialogDescription>
            Data murid dibuat dengan NIS baru untuk Tahun Ajaran {pendaftaran.tahun_ajaran.nama}.{" "}
            {pendaftaran.wali ? `Murid langsung tertaut ke akun ${pendaftaran.wali.nama}.` : "Akun wali dibuat otomatis dengan username NIS anak; kartu akunnya bisa dicetak dari halaman murid."}
          </DialogDescription>
        </DialogHeader>
        <KolomPilih
          label="Kelas (opsional)"
          deskripsi="Kosongkan kalau kelas ditentukan nanti di menu Kelas."
          value={kelasId}
          disabled={kelas.isPending}
          onChange={(event) => setKelasId(event.target.value)}
        >
          <option value="">{kelas.isPending ? "Memuat kelas..." : "Belum ditempatkan"}</option>
          {pilihan.map((item) => (
            <option key={item.id} value={item.id} disabled={item.jumlah_murid >= item.kapasitas}>
              {item.nama} · {LABEL_TINGKAT[item.tingkat]} · {item.jumlah_murid}/{item.kapasitas} murid{item.jumlah_murid >= item.kapasitas ? " (penuh)" : ""}
            </option>
          ))}
        </KolomPilih>
        {kelas.isSuccess && pilihan.length === 0 ? (
          <KotakPesan nada="menunggu">Belum ada kelas di Tahun Ajaran {pendaftaran.tahun_ajaran.nama}. Murid tetap bisa diterima tanpa kelas.</KotakPesan>
        ) : null}
        {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)} disabled={terima.isPending}>
            Batal
          </Button>
          <Button onClick={simpan} disabled={terima.isPending}>
            {terima.isPending ? "Memproses..." : "Terima Pendaftaran"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
