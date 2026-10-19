"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KolomPilih } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { pesanError } from "@/lib/api/errors";
import { useSimpanIzinGuru, useTerapkanPreset } from "@/lib/api/izin";
import type { DaftarIzin, Guru, IzinEfektif, LevelIzin, PresetIzin } from "@/types/domain";

const TANPA_IZIN = "";

function levelDari(nilai: string, daftar: DaftarIzin): LevelIzin | null {
  return daftar.level.find((level) => level.kode === nilai)?.kode ?? null;
}

/**
 * Atur izin satu guru (A2.13): terapkan preset (langsung tersimpan dan mengganti semua izin), lalu sesuaikan per
 * modul dan simpan. Izin berlaku pada permintaan berikutnya guru itu, tanpa perlu masuk ulang.
 */
export function DialogIzinGuru({ guru, daftar }: { guru: Guru; daftar: DaftarIzin }) {
  const [terbuka, setTerbuka] = useState(false);
  const [izin, setIzin] = useState<IzinEfektif>(guru.izin);
  const [preset, setPreset] = useState<PresetIzin | "">("");
  const [galat, setGalat] = useState<string | null>(null);
  const simpan = useSimpanIzinGuru(guru.id);
  const terapkan = useTerapkanPreset(guru.id);
  const memproses = simpan.isPending || terapkan.isPending;

  const terapkanPreset = () => {
    if (preset === "") return;
    setGalat(null);
    terapkan.mutate(preset, {
      onSuccess: ({ data, message }) => {
        setIzin(data.izin);
        setPreset("");
        toast.success(message);
      },
      onError: (error) => setGalat(pesanError(error)),
    });
  };

  const simpanIzin = () => {
    setGalat(null);
    simpan.mutate(izin, {
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
        if (buka) {
          setIzin(guru.izin);
          setPreset("");
          setGalat(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Atur Izin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Hak akses {guru.user.name}</DialogTitle>
          <DialogDescription>Kelola selalu mencakup lihat. Perubahan berlaku pada permintaan berikutnya guru ini.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="flex flex-col gap-2 rounded-lg bg-muted p-3 sm:flex-row sm:items-end">
            <KolomPilih
              label="Preset"
              className="sm:flex-1"
              value={preset}
              onChange={(e) => setPreset(daftar.preset.find((item) => item.kode === e.target.value)?.kode ?? "")}
              deskripsi="Menerapkan preset mengganti semua izin guru ini."
            >
              <option value="">Pilih preset</option>
              {daftar.preset.map((item) => (
                <option key={item.kode} value={item.kode}>
                  {item.nama}
                </option>
              ))}
            </KolomPilih>
            <Button variant="secondary" onClick={terapkanPreset} disabled={preset === "" || memproses}>
              {terapkan.isPending ? "Menerapkan..." : "Terapkan Preset"}
            </Button>
          </div>
          {daftar.modul.map((modul) => (
            <KolomPilih
              key={modul.kode}
              label={modul.label}
              deskripsi={modul.deskripsi}
              value={izin[modul.kode] ?? TANPA_IZIN}
              onChange={(e) => setIzin({ ...izin, [modul.kode]: levelDari(e.target.value, daftar) })}
            >
              <option value={TANPA_IZIN}>Tanpa izin</option>
              {daftar.level.map((level) => (
                <option key={level.kode} value={level.kode}>
                  {level.label}
                </option>
              ))}
            </KolomPilih>
          ))}
          {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)}>
            Batal
          </Button>
          <Button onClick={simpanIzin} disabled={memproses}>
            {simpan.isPending ? "Menyimpan..." : "Simpan Izin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
