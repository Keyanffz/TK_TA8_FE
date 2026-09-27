"use client";

import { FormPengumuman, type NilaiPengumuman } from "@/components/features/pengumuman/form-pengumuman";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Skeleton } from "@/components/ui/skeleton";
import { useLaporanTunggakan } from "@/lib/api/laporan";
import { useSession } from "@/lib/auth/use-session";
import { formatRupiah } from "@/lib/format";

const KOSONG: NilaiPengumuman = { judul: "", isi: "", target: "semua", kelas_ids: [], murid: [], is_publik: false, is_pinned: false };

const ISI_TUNGGAKAN =
  "<p>Assalamu'alaikum, Bapak/Ibu wali murid.</p>" +
  "<p>Kami mengingatkan bahwa ada tagihan sekolah ananda yang sudah lewat jatuh tempo. Rincian tagihan bisa dilihat di menu Tagihan. " +
  "Pembayaran dilakukan dengan transfer ke rekening sekolah lalu mengunggah bukti transfer, atau tunai di kantor sekolah.</p>" +
  "<p>Kalau ada kendala, silakan menghubungi sekolah. Terima kasih.</p>";

/**
 * Pengumuman untuk wali murid yang menunggak (B4, tombol "Kirim pengumuman" di halaman Tunggakan).
 * Murid diambil dari laporan tunggakan dengan saringan kelas yang sama; guru petugas keuangan hanya
 * boleh menyasar murid di kelas yang dia ampu, jadi murid kelas lain tidak ikut dipilih.
 */
function PengumumanTunggakan({ kelasId }: { kelasId: number | null }) {
  const { user, isSuperAdmin } = useSession();
  const tunggakan = useLaporanTunggakan(kelasId);

  if (tunggakan.isPending) return <Skeleton aria-label="Memuat daftar tunggakan" className="h-96 rounded-xl" />;
  if (tunggakan.isError) return <GalatMuat error={tunggakan.error} onCobaLagi={() => void tunggakan.refetch()} />;

  const kelasDiampu = new Set((user?.guru?.kelas_diampu ?? []).map((kelas) => kelas.id));
  const murid = tunggakan.data.murid.filter((item) => isSuperAdmin || (item.kelas !== null && kelasDiampu.has(item.kelas.id)));
  const dilewati = tunggakan.data.murid.length - murid.length;

  return (
    <div className="flex flex-col gap-4">
      <KotakPesan nada="proses">
        {murid.length} murid menunggak dipilih sebagai penerima, total tunggakan {formatRupiah(murid.reduce((jumlah, item) => jumlah + item.total, 0))}.
        {dilewati > 0 ? ` ${dilewati} murid dari kelas lain tidak ikut karena guru hanya bisa mengirim pengumuman ke murid di kelasnya.` : ""}
      </KotakPesan>
      <FormPengumuman
        id={null}
        sudahTerbit={false}
        awal={{
          ...KOSONG,
          judul: "Pengingat tagihan yang lewat jatuh tempo",
          isi: ISI_TUNGGAKAN,
          target: "murid",
          murid: murid.map((item) => ({ id: item.id, nama_lengkap: item.nama_lengkap, nis: item.nis })),
        }}
      />
    </div>
  );
}

export function PengumumanBaru({ dariTunggakan, kelasId }: { dariTunggakan: boolean; kelasId: number | null }) {
  const { isSuperAdmin } = useSession();
  if (dariTunggakan) return <PengumumanTunggakan kelasId={kelasId} />;
  return <FormPengumuman id={null} sudahTerbit={false} awal={isSuperAdmin ? KOSONG : { ...KOSONG, target: "kelas" }} />;
}
