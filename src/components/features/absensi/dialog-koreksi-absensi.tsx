"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { KolomArea, KolomPilih } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCatatAbsen, useKoreksiAbsensi, type IsianAbsenBaru } from "@/lib/api/absensi";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { LABEL_STATUS_ABSENSI, OPSI_STATUS_ABSENSI } from "@/lib/constants/label";
import { formatHariTanggal } from "@/lib/format";
import type { Absensi, JenisAbsensi } from "@/types/domain";

const MAKS_CATATAN = 500;

const catatan = z.string().trim().min(1, "Catatan wajib diisi.").max(MAKS_CATATAN, `Catatan maksimal ${MAKS_CATATAN} karakter.`);
const skema = z.object({ status: z.enum(["hadir", "terlambat", "izin", "sakit", "tidak_hadir"]), catatan });
// Absen masuk baru tidak pernah berstatus tidak hadir (yang tidak absen ditandai scheduler); pilihan itu tidak
// ditampilkan, dan skema ini mempersempit tipenya saat dikirim.
const skemaMasukBaru = z.object({ status: z.enum(["hadir", "terlambat", "izin", "sakit"]), catatan });

type NilaiForm = z.infer<typeof skema>;

type Mode = "koreksi" | JenisAbsensi;

const TEKS: Record<Mode, { tombol: string; simpan: string; deskripsiCatatan: string }> = {
  koreksi: { tombol: "Koreksi Status", simpan: "Simpan Koreksi", deskripsiCatatan: "Alasan koreksi, misalnya dinas luar atau GPS HP bermasalah." },
  masuk: { tombol: "Catat Absen Masuk", simpan: "Simpan Absen Masuk", deskripsiCatatan: "Alasan, misalnya lupa absen, HP tertinggal, atau izin acara keluarga." },
  pulang: { tombol: "Catat Absen Pulang", simpan: "Simpan Absen Pulang", deskripsiCatatan: "Alasan, misalnya lupa absen pulang atau HP mati." },
};

type DialogKoreksiAbsensiProps =
  | { nama: string; absensi: Absensi }
  /** Absen yang belum ada di tanggal itu, misalnya lupa absen masuk atau pulang padahal masuk. */
  | { nama: string; absensi: null; jenis: JenisAbsensi; userId: number; tanggal: string };

function keterangan(props: DialogKoreksiAbsensiProps): string {
  const pencatat = "Jam tidak dicatat; nama Anda dan waktu pencatatan ikut tersimpan.";
  if (props.absensi !== null) {
    const status = props.absensi.status ? LABEL_STATUS_ABSENSI[props.absensi.status] : "tanpa status";
    return `${formatHariTanggal(props.absensi.tanggal)}, sekarang ${status}. Nama Anda dan waktu koreksi ikut tersimpan.`;
  }
  const tanggal = formatHariTanggal(props.tanggal);
  return props.jenis === "masuk"
    ? `${tanggal}, belum ada absen masuk. Pakai ini kalau ${props.nama} masuk tetapi lupa absen, atau untuk mencatat izin atau sakit. ${pencatat}`
    : `${tanggal}, sudah absen masuk tetapi belum ada absen pulang. Pakai ini kalau ${props.nama} lupa absen pulang. ${pencatat}`;
}

function isianBaru(sasaran: { jenis: JenisAbsensi; userId: number; tanggal: string }, nilai: NilaiForm): IsianAbsenBaru {
  const dasar = { user_id: sasaran.userId, tanggal: sasaran.tanggal };
  return sasaran.jenis === "masuk" ? { ...dasar, jenis: "masuk", ...skemaMasukBaru.parse(nilai) } : { ...dasar, jenis: "pulang", catatan: nilai.catatan };
}

/**
 * Koreksi status absen masuk oleh Kepala Sekolah, atau pencatatan absen masuk/pulang untuk peserta yang lupa absen.
 * Catatan wajib dan tersimpan bersama nama pengoreksi.
 */
export function DialogKoreksiAbsensi(props: DialogKoreksiAbsensiProps) {
  const { nama, absensi } = props;
  const mode: Mode = props.absensi === null ? props.jenis : "koreksi";
  const [terbuka, setTerbuka] = useState(false);
  const koreksi = useKoreksiAbsensi();
  const catat = useCatatAbsen();
  const menyimpan = koreksi.isPending || catat.isPending;
  const opsiStatus = OPSI_STATUS_ABSENSI.filter((opsi) => (absensi === null ? opsi.nilai !== "tidak_hadir" : opsi.nilai !== absensi.status));
  const form = useForm<NilaiForm>({ resolver: zodResolver(skema), defaultValues: { status: opsiStatus[0].nilai, catatan: "" } });
  const [galat, setGalat] = useState<string | null>(null);

  const ubahTerbuka = (buka: boolean) => {
    setTerbuka(buka);
    setGalat(null);
    // Status sekarang bisa sudah berubah oleh koreksi sebelumnya, jadi pilihan awal dihitung ulang dari props terbaru.
    form.reset({ status: opsiStatus[0].nilai, catatan: "" });
  };

  const kirim = form.handleSubmit(async (nilai) => {
    setGalat(null);
    try {
      const hasil =
        props.absensi !== null ? await koreksi.mutateAsync({ id: props.absensi.id, ...nilai }) : await catat.mutateAsync(isianBaru(props, nilai));
      toast.success(hasil.message);
      ubahTerbuka(false);
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, ["status", "catatan"])) setGalat(pesanError(error));
    }
  });

  return (
    <Dialog open={terbuka} onOpenChange={ubahTerbuka}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {TEKS[mode].tombol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{mode === "koreksi" ? `Koreksi absensi ${nama}` : `Catat absen ${mode} ${nama}`}</DialogTitle>
            <DialogDescription>{keterangan(props)}</DialogDescription>
          </DialogHeader>
          {mode === "pulang" ? null : (
            <KolomPilih label={mode === "masuk" ? "Status" : "Status baru"} error={form.formState.errors.status?.message} {...form.register("status")}>
              {opsiStatus.map((opsi) => (
                <option key={opsi.nilai} value={opsi.nilai}>
                  {opsi.label}
                </option>
              ))}
            </KolomPilih>
          )}
          <KolomArea
            label="Catatan"
            rows={3}
            maxLength={MAKS_CATATAN}
            deskripsi={TEKS[mode].deskripsiCatatan}
            error={form.formState.errors.catatan?.message}
            {...form.register("catatan")}
          />
          {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => ubahTerbuka(false)} disabled={menyimpan}>
              Batal
            </Button>
            <Button type="submit" disabled={menyimpan}>
              {menyimpan ? "Menyimpan..." : TEKS[mode].simpan}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Siapa yang boleh mengoreksi di rekap: Kepala Sekolah (termasuk absensinya sendiri) dan guru berizin kelola laporan
 * absensi, kecuali untuk absensinya sendiri (`kecualiUserId`), sama dengan aturan backend (A2.13).
 */
export type HakKoreksi = { boleh: boolean; kecualiUserId: number | null };

type AksiKoreksiHarianProps = {
  hak: HakKoreksi;
  nama: string;
  userId: number;
  tanggal: string;
  masuk: Absensi | null;
  pulang: Absensi | null;
  /** False di tanggal libur, bukan hari kerja, atau sebelum tanggal mulai: tidak ada absen yang bisa dicatat. */
  bolehCatat: boolean;
};

/** Tombol untuk satu peserta di satu hari: koreksi status masuk, atau catat absen yang terlupa. */
export function AksiKoreksiHarian({ hak, nama, userId, tanggal, masuk, pulang, bolehCatat }: AksiKoreksiHarianProps) {
  if (!hak.boleh || userId === hak.kecualiUserId) return null;
  const sudahMasuk = masuk?.status === "hadir" || masuk?.status === "terlambat";
  const catatMasuk = masuk === null && bolehCatat;
  const catatPulang = sudahMasuk && pulang === null && bolehCatat;
  if (!masuk && !catatMasuk && !catatPulang) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {masuk ? <DialogKoreksiAbsensi key="koreksi" absensi={masuk} nama={nama} /> : null}
      {catatMasuk ? <DialogKoreksiAbsensi key="masuk" absensi={null} jenis="masuk" userId={userId} tanggal={tanggal} nama={nama} /> : null}
      {catatPulang ? <DialogKoreksiAbsensi key="pulang" absensi={null} jenis="pulang" userId={userId} tanggal={tanggal} nama={nama} /> : null}
    </div>
  );
}
