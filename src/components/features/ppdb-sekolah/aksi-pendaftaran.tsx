"use client";

import { toast } from "sonner";

import { DialogTerima } from "@/components/features/ppdb-sekolah/dialog-terima";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useBatalkanMundur, useMundurPendaftaran, useTolakPendaftaran, useVerifikasiPendaftaran } from "@/lib/api/ppdb";
import { LABEL_STATUS_PENDAFTARAN } from "@/lib/constants/label";
import type { PendaftaranDetail } from "@/types/domain";

function AksiMundur({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const mundur = useMundurPendaftaran(pendaftaran.id);
  const sudahDiterima = pendaftaran.status === "diterima";

  return (
    <DialogKonfirmasi
      pemicu={<Button variant="ghost">Mengundurkan Diri</Button>}
      judul={`Catat ${pendaftaran.nama_panggilan} mengundurkan diri?`}
      deskripsi={
        sudahDiterima ? (
          <div className="flex flex-col gap-2">
            <p>{pendaftaran.nama_lengkap} sudah diterima sebagai murid. Kalau dicatat mengundurkan diri:</p>
            <ul className="list-disc pl-5">
              <li>Data murid {pendaftaran.nama_panggilan} dihapus dan penempatan kelasnya dilepas.</li>
              <li>NIS, NISN, dan NIK murid itu dikosongkan.</li>
              <li>Akun wali otomatis yang belum pernah dipakai dinonaktifkan.</li>
            </ul>
            <p className="font-bold">Status ini tidak bisa dibatalkan. Murid yang sudah punya tagihan, rapor, atau absensi tidak bisa dicatat mundur.</p>
          </div>
        ) : (
          "Data pendaftaran tetap disimpan tetapi tidak tampil di daftar bawaan dan tidak dihitung kuota. Statusnya masih bisa dikembalikan selama kuota ada."
        )
      }
      labelAksi="Catat Mengundurkan Diri"
      labelAlasan="Alasan (opsional)"
      alasanOpsional
      berbahaya={sudahDiterima}
      onKonfirmasi={async (alasan) => {
        toast.success((await mundur.mutateAsync(alasan)).message);
      }}
    />
  );
}

/** Aksi Kepala Sekolah di detail pendaftaran: verifikasi, terima, tolak, mengundurkan diri, dan membatalkannya. */
export function AksiPendaftaran({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const verifikasi = useVerifikasiPendaftaran(pendaftaran.id);
  const tolak = useTolakPendaftaran(pendaftaran.id);
  const batalkanMundur = useBatalkanMundur(pendaftaran.id);
  const { status, status_sebelum_mundur: sebelum } = pendaftaran;
  const masihProses = status === "diajukan" || status === "diverifikasi";

  return (
    <div className="flex flex-col gap-2">
      {status === "diajukan" ? (
        <DialogKonfirmasi
          pemicu={<Button>Data Sudah Dicek</Button>}
          judul="Tandai data formulir sudah dicek?"
          deskripsi="Pastikan isian formulir sama dengan Kartu Keluarga dan akta kelahiran yang dibawa pendaftar. Keputusan terima atau tolak diambil setelah ini."
          labelAksi="Verifikasi Data"
          onKonfirmasi={async () => {
            toast.success((await verifikasi.mutateAsync()).message);
          }}
        />
      ) : null}
      {status === "diverifikasi" ? <DialogTerima pendaftaran={pendaftaran} /> : null}
      {masihProses ? (
        <DialogKonfirmasi
          pemicu={<Button variant="outline">Tolak Pendaftaran</Button>}
          judul={`Tolak pendaftaran ${pendaftaran.nama_panggilan}?`}
          deskripsi="Alasan ditampilkan ke orang tua saat mengecek status pendaftaran."
          labelAksi="Tolak Pendaftaran"
          labelAlasan="Alasan penolakan"
          berbahaya
          onKonfirmasi={async (alasan) => {
            toast.success((await tolak.mutateAsync(alasan)).message);
          }}
        />
      ) : null}
      {masihProses || status === "diterima" ? <AksiMundur pendaftaran={pendaftaran} /> : null}
      {status === "mengundurkan_diri" && (sebelum === "diajukan" || sebelum === "diverifikasi") ? (
        <DialogKonfirmasi
          pemicu={<Button variant="outline">Batalkan Mundur</Button>}
          judul="Kembalikan pendaftaran ini?"
          deskripsi={`Status kembali menjadi "${LABEL_STATUS_PENDAFTARAN[sebelum]}" dan pendaftaran dihitung kuota lagi. Ditolak kalau kuota sudah penuh atau NIK anak sudah dipakai pendaftaran lain.`}
          labelAksi="Batalkan Mundur"
          onKonfirmasi={async () => {
            toast.success((await batalkanMundur.mutateAsync()).message);
          }}
        />
      ) : null}
    </div>
  );
}
