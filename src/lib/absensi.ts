import { formatTanggal } from "@/lib/format";
import type { Absensi, AbsensiHariIni, JenisAbsensi } from "@/types/domain";

const JARI_JARI_BUMI_METER = 6_371_000;

type Titik = { latitude: number; longitude: number };

/** Jarak dua titik (Haversine) dalam meter. Hanya untuk ditampilkan; keputusan absen ada di backend. */
export function jarakMeter(a: Titik, b: Titik): number {
  const radian = (derajat: number) => (derajat * Math.PI) / 180;
  const selisihLat = radian(b.latitude - a.latitude);
  const selisihLng = radian(b.longitude - a.longitude);
  const h = Math.sin(selisihLat / 2) ** 2 + Math.cos(radian(a.latitude)) * Math.cos(radian(b.latitude)) * Math.sin(selisihLng / 2) ** 2;
  return JARI_JARI_BUMI_METER * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Foto absensi dilayani backend lewat BFF dengan cookie sesi, jadi bisa langsung dipakai di <img>. */
export function urlFotoAbsensi(id: number): string {
  return `/api/proxy/absensi/${id}/foto`;
}

export type AbsensiHarian = { tanggal: string; masuk: Absensi | null; pulang: Absensi | null };

/** `GET /absensi` mengirim baris masuk dan pulang terpisah; digabung per tanggal, terbaru dulu. */
export function kelompokkanPerHari(absensi: readonly Absensi[]): AbsensiHarian[] {
  const perTanggal = new Map<string, AbsensiHarian>();
  for (const satu of absensi) {
    const hari = perTanggal.get(satu.tanggal) ?? { tanggal: satu.tanggal, masuk: null, pulang: null };
    hari[satu.jenis] = satu;
    perTanggal.set(satu.tanggal, hari);
  }
  return [...perTanggal.values()].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

/** "2026-10-01T08:24:50+07:00" → "08:24", sebanding dengan jam `HH:MM` dari pengaturan. */
function jamServer(status: AbsensiHariIni): string {
  return status.waktu_server.slice(11, 16);
}

export type LangkahAbsen =
  | { boleh: true; jenis: JenisAbsensi }
  | { boleh: false; keterangan: string };

/**
 * Apa yang bisa dilakukan sekarang menurut status dari backend. Tombol hanya muncul kalau backend bilang
 * jamnya terbuka; selain itu pengguna diberi tahu sebabnya.
 */
export function langkahAbsen(status: AbsensiHariIni): LangkahAbsen {
  const { masuk, pulang } = status;
  const sudahMasuk = masuk.absensi !== null && masuk.absensi.status !== "tidak_hadir";

  if (!status.hari_kerja) {
    return { boleh: false, keterangan: status.tanggal_libur ? "Hari ini libur sekolah, jadi tidak ada absensi." : "Hari ini bukan hari kerja, jadi tidak ada absensi." };
  }
  if (status.tanggal_mulai !== null && status.tanggal < status.tanggal_mulai) {
    return { boleh: false, keterangan: `Absensi baru berlaku mulai ${formatTanggal(status.tanggal_mulai)}.` };
  }
  if (status.lokasi === null) {
    return { boleh: false, keterangan: "Lokasi sekolah belum diatur, jadi absen belum bisa dilakukan. Minta Kepala Sekolah mengisi pengaturan absensi." };
  }
  if (masuk.terbuka && masuk.absensi === null) return { boleh: true, jenis: "masuk" };
  if (pulang.terbuka && pulang.absensi === null && sudahMasuk) return { boleh: true, jenis: "pulang" };

  const jam = jamServer(status);
  if (masuk.absensi === null && jam < masuk.buka) return { boleh: false, keterangan: `Absen masuk dibuka pukul ${masuk.buka}.` };
  if (masuk.absensi === null) {
    return { boleh: false, keterangan: `Jam absen masuk sudah tutup pukul ${masuk.tutup} dan Anda belum absen. Hubungi Kepala Sekolah kalau perlu koreksi.` };
  }
  if (!sudahMasuk) return { boleh: false, keterangan: "Hari ini Anda tercatat tidak hadir. Hubungi Kepala Sekolah kalau perlu koreksi." };
  if (pulang.absensi !== null) return { boleh: false, keterangan: "Absen masuk dan pulang hari ini sudah tercatat." };
  if (jam < pulang.buka) return { boleh: false, keterangan: `Absen pulang dibuka pukul ${pulang.buka}.` };
  return { boleh: false, keterangan: `Jam absen pulang sudah tutup pukul ${pulang.tutup}.` };
}
