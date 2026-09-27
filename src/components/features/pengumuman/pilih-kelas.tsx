"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { pesanError } from "@/lib/api/errors";
import { useKelasAktif } from "@/lib/api/kelas";

/** Centang satu atau beberapa kelas tahun ajaran aktif (guru: hanya kelas yang diampu). */
export function PilihKelas({ dipilih, onUbah, error }: { dipilih: readonly number[]; onUbah: (ids: number[]) => void; error?: string }) {
  const kelas = useKelasAktif();

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold">Kelas penerima</legend>
      {kelas.isPending ? (
        <Skeleton className="h-12" />
      ) : kelas.isError ? (
        <p className="text-sm text-destructive">{pesanError(kelas.error)}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(kelas.data ?? []).map((item) => (
            <label
              key={item.id}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 has-checked:border-primary has-checked:bg-primary-soft"
            >
              <input
                type="checkbox"
                className="size-5 accent-primary"
                checked={dipilih.includes(item.id)}
                onChange={(event) => onUbah(event.target.checked ? [...dipilih, item.id] : dipilih.filter((id) => id !== item.id))}
              />
              <span className="font-bold">{item.nama}</span>
              <span className="text-xs text-muted-foreground">{item.jumlah_murid} murid</span>
            </label>
          ))}
        </div>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
