"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { useFormContext, type Path } from "react-hook-form";

import type { IsianFormulir } from "@/components/features/formulir-murid/skema";
import { KolomArea, KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";

export type FieldFormulir = Path<IsianFormulir>;

/**
 * Isian mana yang ditampilkan. Wizard menampilkan semuanya; halaman Lengkapi Data wali hanya menampilkan isian
 * yang masih kosong, karena isian yang sudah terisi hanya diubah sekolah.
 */
const TampilContext = createContext<(field: FieldFormulir) => boolean>(() => true);
export const TampilkanIsian = TampilContext.Provider;
export const useTampil = () => useContext(TampilContext);

export function useIsianFormulir() {
  return useFormContext<IsianFormulir>();
}

function usePesanError(field: FieldFormulir) {
  const { getFieldState, formState } = useIsianFormulir();
  return getFieldState(field, formState).error?.message;
}

type IsianTeksProps = Omit<ComponentProps<typeof KolomTeks>, "error" | "name"> & { field: FieldFormulir };

export function IsianTeks({ field, ...props }: IsianTeksProps) {
  const { register } = useIsianFormulir();
  const error = usePesanError(field);
  const tampil = useTampil();
  if (!tampil(field)) return null;
  return <KolomTeks autoComplete="off" error={error} {...props} {...register(field)} />;
}

export function IsianArea({ field, ...props }: Omit<ComponentProps<typeof KolomArea>, "error" | "name"> & { field: FieldFormulir }) {
  const { register } = useIsianFormulir();
  const error = usePesanError(field);
  const tampil = useTampil();
  if (!tampil(field)) return null;
  return <KolomArea rows={2} error={error} {...props} {...register(field)} />;
}

type IsianPilihProps = Omit<ComponentProps<typeof KolomPilih>, "error" | "name" | "children"> & {
  field: FieldFormulir;
  opsi: readonly { nilai: string; label: string }[];
  kosong: string;
};

export function IsianPilih({ field, opsi, kosong, ...props }: IsianPilihProps) {
  const { register } = useIsianFormulir();
  const error = usePesanError(field);
  const tampil = useTampil();
  if (!tampil(field)) return null;
  return (
    <KolomPilih error={error} {...props} {...register(field)}>
      <option value="">{kosong}</option>
      {opsi.map((item) => (
        <option key={item.nilai} value={item.nilai}>
          {item.label}
        </option>
      ))}
    </KolomPilih>
  );
}

/**
 * Kelompok isian dalam satu langkah, misalnya "Alamat". Tidak dirender kalau semua isian di `field` tersembunyi;
 * tanpa `field` selalu tampil (isian khusus form staf atau PPDB).
 */
export function KelompokIsian({ judul, keterangan, field, children }: { judul: string; keterangan?: string; field?: readonly FieldFormulir[]; children: ReactNode }) {
  const tampil = useTampil();
  if (field && !field.some(tampil)) return null;
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-1 font-heading font-bold">{judul}</legend>
      {keterangan ? <p className="-mt-2 text-sm text-muted-foreground">{keterangan}</p> : null}
      {children}
    </fieldset>
  );
}

export function Baris({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
