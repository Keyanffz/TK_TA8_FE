"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { PilihMurid, type MuridTerpilih } from "@/components/shared/pilih-murid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { ApiError, pesanError } from "@/lib/api/errors";
import { useDaftarJenisTagihan } from "@/lib/api/jenis-tagihan";
import { useDaftarKelas } from "@/lib/api/kelas";
import { useBuatTagihanSekali } from "@/lib/api/tagihan";
import { formatRupiah } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";

type Sasaran = "kelas" | "murid";
const OPSI_SASARAN = [
  { nilai: "kelas", label: "Satu kelas", keterangan: "Semua murid aktif di kelas itu." },
  { nilai: "murid", label: "Murid tertentu", keterangan: "Pilih satu atau beberapa murid." },
] as const;

/** Tagihan sekali bayar (uang pangkal, seragam) untuk satu kelas atau murid tertentu (A7 `POST /tagihan`). */
export function DialogTagihanSekali() {
  const [terbuka, setTerbuka] = useState(false);
  const [jenisId, setJenisId] = useState("");
  const [sasaran, setSasaran] = useState<Sasaran>("kelas");
  const [kelasId, setKelasId] = useState("");
  const [murid, setMurid] = useState<MuridTerpilih[]>([]);
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [galat, setGalat] = useState<Record<string, string>>({});
  const jenis = useDaftarJenisTagihan(null, terbuka);
  const kelas = useDaftarKelas(null);
  const buat = useBuatTagihanSekali();
  const jenisSekali = (jenis.data ?? []).filter((item) => item.periode === "sekali" && item.is_aktif);
  const kelasAktif = (kelas.data ?? []).filter((item) => item.tahun_ajaran.is_aktif);

  const reset = () => {
    setJenisId("");
    setSasaran("kelas");
    setKelasId("");
    setMurid([]);
    setJatuhTempo("");
    setGalat({});
  };

  const simpan = () => {
    const galatBaru: Record<string, string> = {};
    if (!jenisId) galatBaru.jenis_tagihan_id = "Pilih jenis tagihan.";
    if (sasaran === "kelas" && !kelasId) galatBaru.kelas_id = "Pilih kelas.";
    if (sasaran === "murid" && murid.length === 0) galatBaru.murid_ids = "Pilih minimal satu murid.";
    if (!jatuhTempo) galatBaru.jatuh_tempo = "Jatuh tempo wajib diisi.";
    else if (jatuhTempo < hariIniJakarta()) galatBaru.jatuh_tempo = "Jatuh tempo paling cepat hari ini.";
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;

    buat.mutate(
      {
        jenis_tagihan_id: Number(jenisId),
        jatuh_tempo: jatuhTempo,
        ...(sasaran === "kelas" ? { kelas_id: Number(kelasId) } : { murid_ids: murid.map((item) => item.id) }),
      },
      {
        onSuccess: ({ data }) => {
          toast.success(`${data.dibuat} tagihan dibuat${data.dilewati > 0 ? `, ${data.dilewati} murid dilewati karena sudah punya tagihan ini` : ""}.`);
          setTerbuka(false);
        },
        onError: (error) => {
          const pesan = error instanceof ApiError && error.errors ? Object.fromEntries(Object.entries(error.errors).map(([kunci, isi]) => [kunci.split(".")[0], isi[0] ?? ""])) : {};
          if (Object.keys(pesan).length > 0) setGalat(pesan);
          else setGalat({ umum: pesanError(error) });
        },
      },
    );
  };

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Buat Tagihan Sekali Bayar</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat tagihan sekali bayar</DialogTitle>
          <DialogDescription>Murid yang sudah punya tagihan jenis ini (selain yang dibatalkan) dilewati.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <KolomPilih label="Jenis tagihan" value={jenisId} onChange={(e) => setJenisId(e.target.value)} error={galat.jenis_tagihan_id}>
            <option value="">Pilih jenis tagihan</option>
            {jenisSekali.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} · {formatRupiah(item.nominal)} ({item.tahun_ajaran.nama})
              </option>
            ))}
          </KolomPilih>
          {jenis.isSuccess && jenisSekali.length === 0 ? (
            <KotakPesan nada="menunggu">Belum ada jenis tagihan sekali bayar yang aktif. Tambahkan di menu Jenis Tagihan.</KotakPesan>
          ) : null}
          <KolomRadio label="Ditagihkan ke" opsi={OPSI_SASARAN} nilai={sasaran} onUbah={setSasaran} />
          {sasaran === "kelas" ? (
            <KolomPilih label="Kelas" value={kelasId} onChange={(e) => setKelasId(e.target.value)} error={galat.kelas_id}>
              <option value="">Pilih kelas</option>
              {kelasAktif.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.jumlah_murid} murid)
                </option>
              ))}
            </KolomPilih>
          ) : (
            <PilihMurid dipilih={murid} onUbah={setMurid} error={galat.murid_ids} />
          )}
          <KolomTeks label="Jatuh tempo" type="date" min={hariIniJakarta()} value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} error={galat.jatuh_tempo} />
          {galat.umum ? <KotakPesan nada="bahaya">{galat.umum}</KotakPesan> : null}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={simpan} disabled={buat.isPending}>
            {buat.isPending ? "Membuat..." : "Buat Tagihan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
