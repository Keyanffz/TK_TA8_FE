import Image from "next/image";

import type { RaporDetail } from "@/types/domain";

const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** Isi rapor hanya-baca: dipakai wali, dan guru/Kepala Sekolah saat rapor tidak bisa diubah. */
export function TampilanRapor({ rapor }: { rapor: RaporDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <dt className="text-sm text-muted-foreground">Tinggi badan</dt>
          <dd className="font-heading text-lg font-bold">{rapor.tinggi_badan === null ? "-" : `${angka.format(rapor.tinggi_badan)} cm`}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Berat badan</dt>
          <dd className="font-heading text-lg font-bold">{rapor.berat_badan === null ? "-" : `${angka.format(rapor.berat_badan)} kg`}</dd>
        </div>
      </dl>
      {rapor.detail.map((detail) => (
        <section key={detail.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-lg font-bold">{detail.elemen.nama}</h2>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
            <p className="flex-1 whitespace-pre-line">{detail.deskripsi || <span className="text-muted-foreground">Belum diisi.</span>}</p>
            {detail.foto_url ? (
              <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-56">
                <Image src={detail.foto_url} alt={`Foto ${detail.elemen.nama}`} fill unoptimized className="object-cover" />
              </span>
            ) : null}
          </div>
        </section>
      ))}
      <section className="rounded-xl bg-highlight-soft p-5">
        <h2 className="font-heading text-lg font-bold">Catatan guru</h2>
        <p className="mt-2 whitespace-pre-line">{rapor.catatan_guru || <span className="text-muted-foreground">Tidak ada catatan.</span>}</p>
      </section>
    </div>
  );
}
