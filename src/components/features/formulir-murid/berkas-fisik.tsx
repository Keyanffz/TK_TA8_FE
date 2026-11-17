"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { pesanError } from "@/lib/api/errors";
import type { CentangBerkas } from "@/lib/api/murid";
import { formatTanggalWaktu } from "@/lib/format";
import type { BerkasFisik as DataBerkas } from "@/types/domain";

const BERKAS = [
  { kunci: "kartu_keluarga", label: "Kartu Keluarga" },
  { kunci: "akta_kelahiran", label: "Akta kelahiran" },
] as const;

/** Berkas yang belum dicentang, untuk peringatan saat menerima pendaftar. */
export function berkasBelumDiterima(berkas: DataBerkas): string[] {
  return BERKAS.filter(({ kunci }) => berkas[kunci] === null).map(({ label }) => label);
}

type BerkasFisikProps = {
  berkas: DataBerkas;
  /** null kalau pengguna hanya boleh melihat. */
  ubah: ((body: CentangBerkas) => Promise<unknown>) | null;
  keterangan?: string;
};

/** Centang Kartu Keluarga dan akta kelahiran yang diserahkan langsung ke sekolah (berkas tidak diunggah). */
export function BerkasFisik({ berkas, ubah, keterangan }: BerkasFisikProps) {
  const [memproses, setMemproses] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const centang = async (kunci: (typeof BERKAS)[number]["kunci"], diterima: boolean) => {
    if (!ubah) return;
    setMemproses(kunci);
    setGalat(null);
    try {
      await ubah({ [kunci]: diterima });
      toast.success(diterima ? "Berkas dicentang sudah diterima." : "Centang berkas dihapus.");
    } catch (error) {
      setGalat(pesanError(error));
    } finally {
      setMemproses(null);
    }
  };

  return (
    <section aria-labelledby="judul-berkas" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 id="judul-berkas" className="font-heading text-lg font-extrabold">
        Berkas fisik
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{keterangan ?? "Diserahkan langsung ke sekolah, tidak diunggah."}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {BERKAS.map(({ kunci, label }) => {
          const data = berkas[kunci];
          const keteranganCentang = data
            ? `Diterima ${formatTanggalWaktu(data.diterima_at)}${data.diterima_oleh ? ` oleh ${data.diterima_oleh.nama}` : ""}`
            : "Belum diterima";
          return (
            <li key={kunci}>
              {ubah ? (
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-5 shrink-0 accent-primary disabled:cursor-not-allowed"
                    checked={data !== null}
                    disabled={memproses !== null}
                    onChange={(event) => void centang(kunci, event.target.checked)}
                  />
                  <span>
                    <span className="block font-bold">{label}</span>
                    <span className="block text-sm text-muted-foreground">{memproses === kunci ? "Menyimpan..." : keteranganCentang}</span>
                  </span>
                </label>
              ) : (
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="text-sm text-muted-foreground">{keteranganCentang}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {galat ? <KotakPesan nada="bahaya" className="mt-3">{galat}</KotakPesan> : null}
    </section>
  );
}
