"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomCari } from "@/components/shared/kolom-cari";
import { Skeleton } from "@/components/ui/skeleton";
import { pesanError } from "@/lib/api/errors";
import { useDaftarMurid } from "@/lib/api/murid";
import type { Murid } from "@/types/domain";

const HASIL_CARI = 30;

export type MuridTerpilih = Pick<Murid, "id" | "nama_lengkap" | "nis">;

type PilihMuridProps = {
  dipilih: readonly MuridTerpilih[];
  onUbah: (dipilih: MuridTerpilih[]) => void;
  /** 1 = pilihan tunggal (keringanan); lebih = centang banyak (penempatan, tagihan sekali). */
  maks?: number;
  /** Alasan murid tidak bisa dipilih, misalnya sudah di kelas ini. */
  alasanNonaktif?: (murid: Murid) => string | null;
  error?: string;
};

/** Cari murid aktif (nama/NIS) lalu pilih satu atau beberapa. */
export function PilihMurid({ dipilih, onUbah, maks = Infinity, alasanNonaktif, error }: PilihMuridProps) {
  const [cari, setCari] = useState("");
  const hasil = useDaftarMurid({ search: cari, halaman: 1, kelasId: null, status: "aktif", tingkat: null, perHalaman: HASIL_CARI });
  const idDipilih = new Set(dipilih.map((murid) => murid.id));
  const tunggal = maks === 1;

  const ubah = (murid: Murid) => {
    if (idDipilih.has(murid.id)) onUbah(dipilih.filter((item) => item.id !== murid.id));
    else if (tunggal) onUbah([murid]);
    else if (dipilih.length < maks) onUbah([...dipilih, murid]);
  };

  return (
    <div className="flex flex-col gap-3">
      {dipilih.length > 0 ? (
        <ul aria-label="Murid terpilih" className="flex flex-wrap gap-2">
          {dipilih.map((murid) => (
            <li key={murid.id} className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pr-1 pl-3 text-sm font-bold text-primary-strong">
              {murid.nama_lengkap}
              <button
                type="button"
                onClick={() => onUbah(dipilih.filter((item) => item.id !== murid.id))}
                aria-label={`Batal pilih ${murid.nama_lengkap}`}
                className="flex size-7 items-center justify-center rounded-full hover:bg-primary-soft-strong"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <KolomCari nilai={cari} onUbah={setCari} label="Cari murid" placeholder="Cari nama atau NIS" />
      <div className="max-h-64 overflow-y-auto rounded-lg border border-border" aria-invalid={error ? true : undefined}>
        {hasil.isPending ? (
          <Skeleton className="m-2 h-20" />
        ) : hasil.isError ? (
          <p className="p-3 text-sm text-destructive">{pesanError(hasil.error)}</p>
        ) : hasil.data.data.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Tidak ada murid aktif yang cocok.</p>
        ) : (
          <ul className="divide-y divide-border">
            {hasil.data.data.map((murid) => {
              const alasan = alasanNonaktif?.(murid) ?? null;
              return (
                <li key={murid.id}>
                  <label className="flex min-h-14 cursor-pointer items-center gap-3 px-3 py-2 has-disabled:cursor-default has-disabled:opacity-60">
                    <input
                      type={tunggal ? "radio" : "checkbox"}
                      name={tunggal ? "pilih-murid" : undefined}
                      className="size-5 accent-primary"
                      disabled={alasan !== null}
                      checked={alasan !== null || idDipilih.has(murid.id)}
                      onChange={() => ubah(murid)}
                    />
                    <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={32} className="size-8 text-xs" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{murid.nama_lengkap}</span>
                      <span className="block text-xs text-muted-foreground">
                        {murid.nis} · {alasan ?? murid.kelas?.nama ?? "belum punya kelas"}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
