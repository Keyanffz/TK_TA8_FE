"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { FormProvider, get, useForm } from "react-hook-form";
import { toast } from "sonner";

import { isianDariData, keBodyFormulir } from "@/components/features/formulir-murid/isian";
import { TampilkanIsian, type FieldFormulir } from "@/components/features/formulir-murid/kolom-formulir";
import { FIELD_LANGKAH_FORMULIR, LANGKAH, SEMUA_FIELD_FORMULIR } from "@/components/features/formulir-murid/label-field";
import { LangkahDataAnak } from "@/components/features/formulir-murid/langkah-data-anak";
import { LangkahKesehatan } from "@/components/features/formulir-murid/langkah-kesehatan";
import { LangkahOrangTua } from "@/components/features/formulir-murid/langkah-orang-tua";
import { periksaKontakUtama, skemaFormulir, type IsianFormulir } from "@/components/features/formulir-murid/skema";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useLengkapiDataAnak } from "@/lib/api/wali";
import type { MuridDetail } from "@/types/domain";

const skemaLengkapi = skemaFormulir.superRefine(periksaKontakUtama);

/** Isian yang masih kosong di data tersimpan. `ada_wali` berarti tombol "Tambah data wali" (wali belum diisi). */
function kosongDi(awal: IsianFormulir, field: FieldFormulir): boolean {
  if (field === "ada_wali") return !awal.ada_wali;
  const [peran, kolom] = field.split(".");
  if (kolom === "alamat_rumah" && (peran === "ayah" || peran === "ibu" || peran === "wali")) {
    return !awal[peran].alamat_sama_dengan_anak && awal[peran].alamat_rumah.trim() === "";
  }
  const nilai: unknown = get(awal, field);
  if (Array.isArray(nilai)) return nilai.length === 0;
  if (typeof nilai === "string") return nilai.trim() === "";
  return nilai === false || nilai === null || nilai === undefined;
}

function Bagian({ id, judul, field, awal, children }: { id: string; judul: string; field: readonly FieldFormulir[] | null; awal: IsianFormulir; children: ReactNode }) {
  const adaKosong = field === null || field.some((nama) => kosongDi(awal, nama));
  return (
    <section aria-labelledby={id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 id={id} className="mb-4 text-lg font-extrabold">
        {judul}
      </h2>
      {adaKosong ? children : <p className="text-sm text-muted-foreground">Semua isian di bagian ini sudah terisi.</p>}
    </section>
  );
}

type LengkapiDataAnakProps = { murid: MuridDetail; onSelesai: () => void };

/**
 * Wali melengkapi isian formulir yang masih kosong. Isian yang sudah terisi tidak ditampilkan di sini, karena
 * perubahannya lewat sekolah; backend menolak nilai lain untuk isian yang sudah terisi.
 */
export function LengkapiDataAnak({ murid, onSelesai }: LengkapiDataAnakProps) {
  const awal = isianDariData(murid);
  const form = useForm<IsianFormulir>({ resolver: zodResolver(skemaLengkapi), defaultValues: awal, shouldUnregister: false });
  const lengkapi = useLengkapiDataAnak(murid.id);
  const { errors, isSubmitting } = form.formState;

  const simpan = form.handleSubmit(async (nilai) => {
    try {
      // Isian yang sudah terisi ikut terkirim dengan nilai yang sama, dan backend mengabaikannya.
      const { message } = await lengkapi.mutateAsync({ ...keBodyFormulir(nilai), nik: nilai.nik.trim() || null });
      toast.success(message);
      onSelesai();
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, SEMUA_FIELD_FORMULIR)) form.setError("root", { message: pesanError(error) });
    }
  });

  return (
    <FormProvider {...form}>
      <TampilkanIsian value={(field) => kosongDi(awal, field)}>
        <form noValidate onSubmit={(event) => void simpan(event)} className="flex flex-col gap-8">
          <Bagian id="judul-isi-anak" judul="Data anak" field={FIELD_LANGKAH_FORMULIR[LANGKAH.dataAnak]} awal={awal}>
            <LangkahDataAnak />
          </Bagian>
          <Bagian id="judul-isi-kesehatan" judul="Kesehatan" field={FIELD_LANGKAH_FORMULIR[LANGKAH.kesehatan]} awal={awal}>
            <LangkahKesehatan />
          </Bagian>
          <Bagian id="judul-isi-ortu" judul="Orang tua & wali" field={null} awal={awal}>
            <LangkahOrangTua />
          </Bagian>
          {errors.root?.message ? <KotakPesan nada="bahaya">{errors.root.message}</KotakPesan> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onSelesai} disabled={isSubmitting}>
              Batal
            </Button>
          </div>
        </form>
      </TampilkanIsian>
    </FormProvider>
  );
}
