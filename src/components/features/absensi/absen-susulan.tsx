"use client";

import { useState } from "react";
import { toast } from "sonner";

import { TampilanGalatKamera } from "@/components/features/absensi/galat-kamera";
import { KameraSwafoto } from "@/components/features/absensi/kamera-swafoto";
import { useKamera } from "@/components/features/absensi/use-kamera";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { useAbsenSusulan } from "@/lib/api/absensi";
import { pesanError } from "@/lib/api/errors";
import { formatHariTanggal, formatJam } from "@/lib/format";
import type { AksesAbsenSusulan } from "@/types/domain";

/** Akses absen susulan yang belum dipakai, dari `GET /absensi/hari-ini`. */
export function DaftarAksesSusulan({ akses, onPilih }: { akses: readonly AksesAbsenSusulan[]; onPilih: (akses: AksesAbsenSusulan) => void }) {
  if (akses.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {akses.map((satu) => (
        <li key={satu.id}>
          <KotakPesan nada="proses" judul={`Akses absen ${satu.jenis} susulan, ${formatHariTanggal(satu.tanggal)}`}>
            <p>
              Diberikan {satu.diberikan_oleh.nama}, berlaku sampai pukul {formatJam(satu.berlaku_sampai)} hari ini. Catatan: {satu.catatan}
            </p>
            <Button className="mt-3 h-12 w-full sm:w-auto" onClick={() => onPilih(satu)}>
              Absen {satu.jenis === "masuk" ? "Masuk" : "Pulang"} Susulan
            </Button>
          </KotakPesan>
        </li>
      ))}
    </ul>
  );
}

type AlurAbsenSusulanProps = { akses: AksesAbsenSusulan; kepalaSekolah: boolean; onTutup: () => void };

/** Absen susulan hanya butuh swafoto dari kamera; lokasi dan jam tidak diperiksa backend. */
export function AlurAbsenSusulan({ akses, kepalaSekolah, onTutup }: AlurAbsenSusulanProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const kamera = useKamera(foto === null);
  const absen = useAbsenSusulan();

  if (kamera.status.tahap === "gagal") {
    return <TampilanGalatKamera galat={kamera.status.galat} jenis={akses.jenis} kepalaSekolah={kepalaSekolah} onCobaLagi={kamera.bukaLagi} onBatal={onTutup} />;
  }

  const kirim = () => {
    if (!foto) return;
    absen.mutate(
      { id: akses.id, foto },
      {
        onSuccess: (hasil) => {
          toast.success(hasil.message);
          onTutup();
        },
      },
    );
  };

  return (
    <section aria-labelledby="judul-alur-susulan" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div>
        <h2 id="judul-alur-susulan" className="text-lg font-extrabold">
          Absen {akses.jenis === "masuk" ? "Masuk" : "Pulang"} Susulan
        </h2>
        <p className="text-sm text-muted-foreground">
          Untuk {formatHariTanggal(akses.tanggal)}. Lokasi tidak diperiksa; cukup swafoto.
        </p>
      </div>

      <KameraSwafoto kamera={kamera} foto={foto} onFoto={setFoto} bolehGaleri={false} />

      {absen.isError ? (
        <KotakPesan nada="bahaya" judul="Absen belum tercatat">
          {pesanError(absen.error)}
        </KotakPesan>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button size="lg" className="h-14 sm:flex-1" disabled={!foto || absen.isPending} onClick={kirim}>
          {absen.isPending ? "Mengirim..." : `Kirim Absen ${akses.jenis === "masuk" ? "Masuk" : "Pulang"} Susulan`}
        </Button>
        <Button size="lg" variant="outline" className="h-14" disabled={absen.isPending} onClick={onTutup}>
          Batal
        </Button>
      </div>
    </section>
  );
}
