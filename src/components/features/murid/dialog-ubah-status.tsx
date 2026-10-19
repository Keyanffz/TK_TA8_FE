"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { KolomArea, KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { ApiError, pesanError } from "@/lib/api/errors";
import { useDaftarKelas } from "@/lib/api/kelas";
import type { BodyUbahStatus } from "@/lib/api/murid";
import { LABEL_STATUS_MURID, STATUS_MURID } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";
import type { StatusMurid } from "@/types/domain";

type DialogUbahStatusProps = {
  judul: string;
  deskripsi: string;
  pemicu: ReactNode;
  /** Status murid sekarang (ubah satu murid); tidak ditawarkan lagi. */
  statusSekarang?: StatusMurid;
  /** Meluluskan satu kelas: status tetap lulus dan kelas dipilih di dialog. */
  luluskanKelas?: boolean;
  /** Mengirim isian ke backend dan mengembalikan pesan suksesnya. */
  kirim: (isian: BodyUbahStatus, kelasId: number | null) => Promise<string>;
};

/** Dimuat hanya saat dialog Luluskan Kelas dibuka. */
function PilihKelasAktif({ value, onChange, error }: { value: string; onChange: (kelasId: string) => void; error?: string }) {
  const kelas = useDaftarKelas(null);
  const kelasAktif = (kelas.data ?? []).filter((item) => item.tahun_ajaran.is_aktif);

  return (
    <KolomPilih
      label="Kelas"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={kelas.isPending}
      error={error ?? (kelas.isError ? pesanError(kelas.error) : undefined)}
    >
      <option value="">{kelas.isPending ? "Memuat kelas..." : "Pilih kelas"}</option>
      {kelasAktif.map((item) => (
        <option key={item.id} value={item.id}>
          {item.nama} ({item.jumlah_murid} murid)
        </option>
      ))}
    </KolomPilih>
  );
}

/**
 * Ubah status murid (A2.14). Isian menyesuaikan status: tahun lulus untuk lulus, sekolah tujuan untuk pindah;
 * keterangan selalu opsional. Aturan lain (tanggal sebelum tanggal masuk, kelas penuh) diperiksa backend.
 */
export function DialogUbahStatus({ judul, deskripsi, pemicu, statusSekarang, luluskanKelas = false, kirim }: DialogUbahStatusProps) {
  const pilihanStatus = STATUS_MURID.filter((status) => status !== statusSekarang);
  const statusAwal: StatusMurid = luluskanKelas ? "lulus" : (pilihanStatus[0] ?? "lulus");
  const [terbuka, setTerbuka] = useState(false);
  const [status, setStatus] = useState<StatusMurid>(statusAwal);
  const [tanggal, setTanggal] = useState(hariIniJakarta());
  const [tahunLulus, setTahunLulus] = useState(hariIniJakarta().slice(0, 4));
  const [sekolahTujuan, setSekolahTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [menyimpan, setMenyimpan] = useState(false);

  const reset = () => {
    setStatus(statusAwal);
    setTanggal(hariIniJakarta());
    setTahunLulus(hariIniJakarta().slice(0, 4));
    setSekolahTujuan("");
    setKeterangan("");
    setKelasId("");
    setGalat({});
  };

  const simpan = async () => {
    const galatBaru: Record<string, string> = {};
    if (luluskanKelas && !kelasId) galatBaru.kelas_id = "Pilih kelas yang diluluskan.";
    if (!tanggal) galatBaru.tanggal = "Tanggal wajib diisi.";
    if (status === "lulus" && !/^\d{4}$/.test(tahunLulus)) galatBaru.tahun_lulus = "Isi tahun lulus, misalnya 2026.";
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;

    setMenyimpan(true);
    try {
      const pesan = await kirim(
        {
          status,
          tanggal,
          tahun_lulus: status === "lulus" ? Number(tahunLulus) : null,
          sekolah_tujuan: status === "pindah" && sekolahTujuan.trim() ? sekolahTujuan.trim() : null,
          keterangan: keterangan.trim() || null,
        },
        kelasId ? Number(kelasId) : null,
      );
      toast.success(pesan);
      setTerbuka(false);
    } catch (error) {
      const pesan = error instanceof ApiError && error.errors ? Object.fromEntries(Object.entries(error.errors).map(([kunci, isi]) => [kunci.split(".")[0], isi[0] ?? ""])) : {};
      setGalat(Object.keys(pesan).length > 0 ? pesan : { umum: pesanError(error) });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) reset();
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          <DialogDescription>{deskripsi}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          {luluskanKelas ? (
            <PilihKelasAktif value={kelasId} onChange={setKelasId} error={galat.kelas_id} />
          ) : (
            <KolomPilih
              label="Status baru"
              value={status}
              onChange={(e) => setStatus(pilihanStatus.find((nilai) => nilai === e.target.value) ?? statusAwal)}
              error={galat.status}
            >
              {pilihanStatus.map((nilai) => (
                <option key={nilai} value={nilai}>
                  {LABEL_STATUS_MURID[nilai]}
                </option>
              ))}
            </KolomPilih>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomTeks
              label={status === "aktif" ? "Tanggal aktif kembali" : `Tanggal ${LABEL_STATUS_MURID[status].toLowerCase()}`}
              type="date"
              max={hariIniJakarta()}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              error={galat.tanggal}
            />
            {status === "lulus" ? (
              <KolomTeks
                label="Tahun lulus"
                inputMode="numeric"
                maxLength={4}
                value={tahunLulus}
                onChange={(e) => setTahunLulus(e.target.value)}
                error={galat.tahun_lulus}
              />
            ) : null}
          </div>
          {status === "pindah" ? (
            <KolomTeks label="Sekolah tujuan (opsional)" value={sekolahTujuan} onChange={(e) => setSekolahTujuan(e.target.value)} error={galat.sekolah_tujuan} />
          ) : null}
          <KolomArea label="Keterangan (opsional)" rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} error={galat.keterangan} />
          {status === "aktif" ? null : (
            <KotakPesan nada="proses">
              Murid keluar dari kelas aktif dan tidak ditagih SPP bulan berikutnya. Tagihan yang sudah ada tetap tercatat.
            </KotakPesan>
          )}
          {galat.umum ? <KotakPesan nada="bahaya">{galat.umum}</KotakPesan> : null}
          {galat.murid_ids ? <KotakPesan nada="bahaya">{galat.murid_ids}</KotakPesan> : null}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={() => void simpan()} disabled={menyimpan}>
            {menyimpan ? "Menyimpan..." : luluskanKelas ? "Luluskan Kelas" : "Simpan Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
