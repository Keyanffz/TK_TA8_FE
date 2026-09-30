"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PilihKelas } from "@/components/features/pengumuman/pilih-kelas";
import { EditorTeks } from "@/components/shared/editor-teks";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { PilihMurid, type MuridTerpilih } from "@/components/shared/pilih-murid";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useSimpanPengumuman } from "@/lib/api/pengumuman";
import { useSession } from "@/lib/auth/use-session";
import { teksDariHtml } from "@/lib/html";
import type { Pengumuman, TargetPengumuman } from "@/types/domain";

const OPSI_SEMUA = [
  { nilai: "semua", label: "Semua", keterangan: "Semua guru dan wali murid." },
  { nilai: "wali_murid", label: "Wali murid", keterangan: "Semua wali murid." },
  { nilai: "guru", label: "Guru", keterangan: "Semua guru." },
  { nilai: "kelas", label: "Kelas tertentu", keterangan: "Wali murid dan guru kelas yang dipilih." },
  { nilai: "murid", label: "Murid tertentu", keterangan: "Wali murid dari murid yang dipilih." },
] as const;
const OPSI_GURU = OPSI_SEMUA.filter((opsi) => opsi.nilai === "kelas" || opsi.nilai === "murid");

const skema = z
  .object({
    judul: z.string().trim().min(1, "Judul wajib diisi.").max(255, "Judul terlalu panjang."),
    isi: z.string().refine((html) => teksDariHtml(html) !== "", "Isi pengumuman wajib diisi."),
    target: z.enum(["semua", "guru", "wali_murid", "kelas", "murid"]),
    kelas_ids: z.array(z.number()),
    murid: z.array(z.custom<MuridTerpilih>()),
    is_publik: z.boolean(),
    is_pinned: z.boolean(),
  })
  .refine((nilai) => nilai.target !== "kelas" || nilai.kelas_ids.length > 0, { path: ["kelas_ids"], message: "Pilih minimal satu kelas." })
  .refine((nilai) => nilai.target !== "murid" || nilai.murid.length > 0, { path: ["murid"], message: "Pilih minimal satu murid." });

export type NilaiPengumuman = z.infer<typeof skema>;

export function nilaiDariPengumuman(pengumuman: Pengumuman): NilaiPengumuman {
  return {
    judul: pengumuman.judul,
    isi: pengumuman.isi,
    target: pengumuman.target,
    kelas_ids: (pengumuman.kelas ?? []).map((kelas) => kelas.id),
    murid: (pengumuman.murid ?? []).map((murid) => ({ id: murid.id, nama_lengkap: murid.nama_lengkap, nis: "" })),
    is_publik: pengumuman.is_publik,
    is_pinned: pengumuman.is_pinned,
  };
}

type FormPengumumanProps = {
  /** Null untuk pengumuman baru. */
  id: number | null;
  awal: NilaiPengumuman;
  sudahTerbit: boolean;
};

export function FormPengumuman({ id, awal, sudahTerbit }: FormPengumumanProps) {
  const router = useRouter();
  const { isSuperAdmin } = useSession();
  const simpan = useSimpanPengumuman(id);
  const form = useForm<NilaiPengumuman>({ resolver: zodResolver(skema), defaultValues: awal });
  const { errors, isSubmitting } = form.formState;
  const target = useWatch({ control: form.control, name: "target" });

  const kirim = (publish: boolean) =>
    form.handleSubmit(async (nilai) => {
      try {
        const { data, message } = await simpan.mutateAsync({
          judul: nilai.judul,
          isi: nilai.isi,
          target: nilai.target,
          ...(nilai.target === "kelas" ? { kelas_ids: nilai.kelas_ids } : {}),
          ...(nilai.target === "murid" ? { murid_ids: nilai.murid.map((murid) => murid.id) } : {}),
          is_publik: isSuperAdmin && nilai.target === "semua" ? nilai.is_publik : false,
          is_pinned: nilai.is_pinned,
          publish,
        });
        toast.success(message);
        router.replace(`/mudarris/pengumuman/${data.id}`);
      } catch (error) {
        const errorsApi = error instanceof ApiError ? (error.errors ?? {}) : {};
        const pesanMurid = Object.entries(errorsApi).find(([kunci]) => kunci.startsWith("murid_ids"))?.[1][0];
        const pesanKelas = Object.entries(errorsApi).find(([kunci]) => kunci.startsWith("kelas_ids"))?.[1][0];
        if (pesanMurid) form.setError("murid", { type: "server", message: pesanMurid });
        if (pesanKelas) form.setError("kelas_ids", { type: "server", message: pesanKelas });
        const terpasang = terapkanErrorValidasi(error, form.setError, ["judul", "isi", "target", "is_publik"]);
        if (!terpasang && !pesanMurid && !pesanKelas) toast.error(pesanError(error));
      }
    });

  return (
    <form noValidate onSubmit={(event) => void kirim(true)(event)} className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <FieldGroup>
        <KolomTeks label="Judul" error={errors.judul?.message} {...form.register("judul")} />
        <Controller
          control={form.control}
          name="isi"
          render={({ field }) => <EditorTeks label="Isi pengumuman" nilai={field.value} onUbah={field.onChange} error={errors.isi?.message} />}
        />
        <Controller
          control={form.control}
          name="target"
          render={({ field }) => (
            <KolomRadio<TargetPengumuman>
              label="Dikirim ke"
              opsi={isSuperAdmin ? OPSI_SEMUA : OPSI_GURU}
              nilai={field.value}
              onUbah={field.onChange}
              error={errors.target?.message}
            />
          )}
        />
        {target === "kelas" ? (
          <Controller
            control={form.control}
            name="kelas_ids"
            render={({ field }) => <PilihKelas dipilih={field.value} onUbah={field.onChange} error={errors.kelas_ids?.message} />}
          />
        ) : null}
        {target === "murid" ? (
          <Controller
            control={form.control}
            name="murid"
            render={({ field }) => <PilihMurid dipilih={field.value} onUbah={field.onChange} error={errors.murid?.message} />}
          />
        ) : null}
        <Controller
          control={form.control}
          name="is_pinned"
          render={({ field }) => (
            <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <FieldLabel htmlFor="pengumuman-pin">Sematkan di atas</FieldLabel>
                <FieldDescription>Tampil paling atas di feed penerima sampai sematan dilepas.</FieldDescription>
              </div>
              <Switch id="pengumuman-pin" checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
        {isSuperAdmin && target === "semua" ? (
          <Controller
            control={form.control}
            name="is_publik"
            render={({ field }) => (
              <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
                <div>
                  <FieldLabel htmlFor="pengumuman-publik">Tampilkan di website sekolah</FieldLabel>
                  <FieldDescription>Bisa dibaca siapa saja di halaman Pengumuman website setelah terbit.</FieldDescription>
                </div>
                <Switch id="pengumuman-publik" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : sudahTerbit ? "Simpan Perubahan" : "Terbitkan Pengumuman"}
          </Button>
          {sudahTerbit ? null : (
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={(event) => void kirim(false)(event)}>
              Simpan Draft
            </Button>
          )}
        </div>
        {sudahTerbit ? null : <p className="text-sm text-muted-foreground">Penerima mendapat notifikasi saat pengumuman diterbitkan, bukan saat draft disimpan.</p>}
      </FieldGroup>
    </form>
  );
}
