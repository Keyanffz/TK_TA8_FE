"use client";

import { toast } from "sonner";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useBeriAksesSusulan, useCabutAksesSusulan } from "@/lib/api/absensi";
import { formatHariTanggal, formatJam } from "@/lib/format";
import type { Absensi, AksesAbsenSusulan, JenisAbsensi } from "@/types/domain";

/** Tidak hadir buatan scheduler yang belum dikoreksi: boleh diganti absen masuk susulan (sama dengan backend). */
function tidakHadirOtomatis(masuk: Absensi): boolean {
  return masuk.status === "tidak_hadir" && masuk.waktu === null && !masuk.ada_foto && masuk.dikoreksi_at === null;
}

function aksesBelumDipakai(akses: readonly AksesAbsenSusulan[], jenis: JenisAbsensi): boolean {
  return akses.some((satu) => satu.jenis === jenis && satu.dipakai_at === null && new Date(satu.berlaku_sampai) > new Date());
}

/** Jenis absen yang masih bisa diberi akses susulan untuk peserta ini di tanggal itu. */
function jenisBisaDiberi(masuk: Absensi | null, pulang: Absensi | null, akses: readonly AksesAbsenSusulan[]): JenisAbsensi[] {
  const jenis: JenisAbsensi[] = [];
  if ((masuk === null || tidakHadirOtomatis(masuk)) && !aksesBelumDipakai(akses, "masuk")) jenis.push("masuk");
  const berhalangan = masuk?.status === "izin" || masuk?.status === "sakit";
  if (pulang === null && !berhalangan && !aksesBelumDipakai(akses, "pulang")) jenis.push("pulang");
  return jenis;
}

function keadaanAkses(akses: AksesAbsenSusulan): string {
  if (akses.dipakai_at) return `dipakai pukul ${formatJam(akses.dipakai_at)}`;
  if (new Date(akses.berlaku_sampai) <= new Date()) return "kedaluwarsa, tidak dipakai";
  return `belum dipakai, berlaku sampai pukul ${formatJam(akses.berlaku_sampai)}`;
}

type AksesSusulanHarianProps = {
  nama: string;
  userId: number;
  tanggal: string;
  masuk: Absensi | null;
  pulang: Absensi | null;
  akses: readonly AksesAbsenSusulan[];
  /** Kepala Sekolah di tanggal yang boleh diberi akses (hari ini atau hari kerja terakhir), bukan untuk dirinya sendiri. */
  bolehBeri: boolean;
};

/** Akses absen susulan satu peserta di satu tanggal: daftar, cabut yang belum dipakai, dan beri akses baru. */
export function AksesSusulanHarian({ nama, userId, tanggal, masuk, pulang, akses, bolehBeri }: AksesSusulanHarianProps) {
  const beri = useBeriAksesSusulan();
  const cabut = useCabutAksesSusulan();
  const jenisBaru = bolehBeri ? jenisBisaDiberi(masuk, pulang, akses) : [];
  if (akses.length === 0 && jenisBaru.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {akses.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {akses.map((satu) => (
            <li key={satu.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
              <span>
                <span className="font-semibold">Akses absen {satu.jenis} susulan</span>, {keadaanAkses(satu)}. {satu.catatan}
              </span>
              {bolehBeri && satu.dipakai_at === null ? (
                <DialogKonfirmasi
                  pemicu={
                    <Button size="sm" variant="ghost">
                      Cabut
                    </Button>
                  }
                  judul="Cabut akses absen susulan?"
                  deskripsi={`${nama} tidak bisa lagi absen ${satu.jenis} susulan untuk ${formatHariTanggal(satu.tanggal)}.`}
                  labelAksi="Cabut Akses"
                  berbahaya
                  onKonfirmasi={async () => toast.success((await cabut.mutateAsync(satu.id)).message)}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {jenisBaru.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {jenisBaru.map((jenis) => (
            <DialogKonfirmasi
              key={jenis}
              pemicu={
                <Button size="sm" variant="outline">
                  Beri Akses {jenis === "masuk" ? "Masuk" : "Pulang"} Susulan
                </Button>
              }
              judul={`Akses absen ${jenis} susulan untuk ${nama}`}
              deskripsi={`${nama} bisa absen ${jenis} sendiri untuk ${formatHariTanggal(tanggal)} dengan swafoto, tanpa pemeriksaan lokasi dan jam. Akses berlaku sampai pukul 23:59 hari ini dan hanya bisa dipakai sekali.`}
              labelAksi="Beri Akses"
              labelAlasan="Alasan, misalnya wifi sekolah mati sejak pagi"
              onKonfirmasi={async (catatan) => toast.success((await beri.mutateAsync({ user_id: userId, tanggal, jenis, catatan })).message)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
