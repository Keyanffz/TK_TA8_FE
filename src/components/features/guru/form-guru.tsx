"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import type { BodyGuru } from "@/lib/api/guru";
import { skemaEmail, skemaNama, skemaNomorHp } from "@/lib/auth/skema";
import { OPSI_JENIS_KELAMIN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";
import type { Guru } from "@/types/domain";

const teksOpsional = (maks: number) => z.string().trim().max(maks, `Maksimal ${maks} karakter.`);

const skemaGuru = z.object({
  name: skemaNama,
  email: skemaEmail,
  no_hp: skemaNomorHp,
  jenis_kelamin: z.enum(["L", "P"], { error: "Pilih jenis kelamin." }),
  jabatan: z.string().trim().min(1, "Jabatan wajib diisi.").max(100, "Maksimal 100 karakter."),
  nip: teksOpsional(30),
  nuptk: z.string().trim().regex(/^(\d{16})?$/, "NUPTK berisi 16 angka. Boleh dikosongkan."),
  tempat_lahir: teksOpsional(100),
  tanggal_lahir: z.string(),
  alamat: teksOpsional(500),
  pendidikan_terakhir: teksOpsional(100),
  bisa_kelola_keuangan: z.boolean(),
  tampil_di_landing: z.boolean(),
  foto: z.array(z.custom<File>((nilai) => nilai instanceof File)).max(1),
});

type NilaiGuru = z.infer<typeof skemaGuru>;
const FIELD = [
  "name", "email", "no_hp", "jenis_kelamin", "jabatan", "nip", "nuptk", "tempat_lahir", "tanggal_lahir", "alamat",
  "pendidikan_terakhir", "bisa_kelola_keuangan", "tampil_di_landing", "foto",
] as const;

function nilaiAwal(guru: Guru | null): DefaultValues<NilaiGuru> {
  return {
    name: guru?.user.name ?? "",
    email: guru?.user.email ?? "",
    no_hp: guru?.user.no_hp ?? "",
    jenis_kelamin: guru?.jenis_kelamin ?? undefined,
    jabatan: guru?.jabatan ?? "Guru Kelas",
    nip: guru?.nip ?? "",
    nuptk: guru?.nuptk ?? "",
    tempat_lahir: guru?.tempat_lahir ?? "",
    tanggal_lahir: guru?.tanggal_lahir ?? "",
    alamat: guru?.alamat ?? "",
    pendidikan_terakhir: guru?.pendidikan_terakhir ?? "",
    bisa_kelola_keuangan: guru?.bisa_kelola_keuangan ?? false,
    tampil_di_landing: guru?.tampil_di_landing ?? false,
    foto: [],
  };
}

// Isian kosong dikirim sebagai "" (backend mengubahnya jadi null); foto hanya dikirim kalau diganti.
function keBody({ foto, ...nilai }: NilaiGuru, bolehUbahKeuangan: boolean): BodyGuru {
  const { bisa_kelola_keuangan, ...lainnya } = nilai;
  return { ...lainnya, ...(bolehUbahKeuangan ? { bisa_kelola_keuangan } : {}), foto: foto[0] ?? null };
}

type FormGuruProps = {
  guru: Guru | null;
  kirim: (body: BodyGuru) => Promise<unknown>;
  labelSimpan: string;
};

/** Tambah atau ubah guru. Profil guru milik Kepala Sekolah tidak bisa mengubah izin keuangan (A2.1). */
export function FormGuru({ guru, kirim, labelSimpan }: FormGuruProps) {
  const milikKepalaSekolah = guru?.user.role === "super_admin";
  const form = useForm<NilaiGuru>({ resolver: zodResolver(skemaGuru), defaultValues: nilaiAwal(guru) });
  const { errors, isSubmitting } = form.formState;

  const simpan = form.handleSubmit(async (nilai) => {
    try {
      await kirim(keBody(nilai, !milikKepalaSekolah));
      form.reset({ ...nilai, foto: [] });
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void simpan(event)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="Nama lengkap" autoComplete="off" error={errors.name?.message} {...form.register("name")} />
          <KolomTeks label="Jabatan" error={errors.jabatan?.message} {...form.register("jabatan")} />
          <KolomTeks label="Email" type="email" autoComplete="off" deskripsi="Dipakai guru untuk masuk." error={errors.email?.message} {...form.register("email")} />
          <KolomTeks label="Nomor HP" type="tel" inputMode="numeric" placeholder="08xxxxxxxxxx" error={errors.no_hp?.message} {...form.register("no_hp")} />
        </div>
        <Controller
          control={form.control}
          name="jenis_kelamin"
          render={({ field }) => (
            <KolomRadio label="Jenis kelamin" opsi={OPSI_JENIS_KELAMIN} nilai={field.value} onUbah={field.onChange} error={errors.jenis_kelamin?.message} />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="NIP (opsional)" error={errors.nip?.message} {...form.register("nip")} />
          <KolomTeks label="NUPTK (opsional)" inputMode="numeric" maxLength={16} error={errors.nuptk?.message} {...form.register("nuptk")} />
          <KolomTeks label="Tempat lahir (opsional)" error={errors.tempat_lahir?.message} {...form.register("tempat_lahir")} />
          <KolomTeks label="Tanggal lahir (opsional)" type="date" max={hariIniJakarta()} error={errors.tanggal_lahir?.message} {...form.register("tanggal_lahir")} />
          <KolomTeks label="Pendidikan terakhir (opsional)" placeholder="S1 PG-PAUD" error={errors.pendidikan_terakhir?.message} {...form.register("pendidikan_terakhir")} />
        </div>
        <KolomArea label="Alamat (opsional)" rows={2} error={errors.alamat?.message} {...form.register("alamat")} />
        <Controller
          control={form.control}
          name="foto"
          render={({ field }) => (
            <div className="flex items-start gap-4">
              {guru && field.value.length === 0 ? <FotoProfil nama={guru.user.name} url={guru.foto_url} ukuran={80} className="mt-7 size-20 text-xl" /> : null}
              <div className="flex-1">
                <ZonaUnggah
                  label={guru?.foto_url ? "Ganti foto" : "Foto (opsional)"}
                  deskripsi="Tampil di halaman depan kalau guru ditampilkan di landing."
                  nilai={field.value}
                  onUbah={field.onChange}
                  error={errors.foto?.message}
                />
              </div>
            </div>
          )}
        />
        {(
          [
            {
              nama: "bisa_kelola_keuangan",
              label: "Petugas keuangan",
              keterangan: milikKepalaSekolah
                ? "Kepala Sekolah selalu bisa mengelola keuangan."
                : "Guru bisa memverifikasi pembayaran, mencatat pembayaran tunai, dan melihat laporan keuangan.",
              nonaktif: milikKepalaSekolah,
            },
            { nama: "tampil_di_landing", label: "Tampilkan di halaman depan", keterangan: "Nama, jabatan, dan foto tampil di bagian guru.", nonaktif: false },
          ] as const
        ).map((opsi) => (
          <Controller
            key={opsi.nama}
            control={form.control}
            name={opsi.nama}
            render={({ field }) => (
              <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
                <div>
                  <FieldLabel htmlFor={`guru-${opsi.nama}`}>{opsi.label}</FieldLabel>
                  <FieldDescription>{opsi.keterangan}</FieldDescription>
                </div>
                <Switch id={`guru-${opsi.nama}`} checked={field.value} onCheckedChange={field.onChange} disabled={opsi.nonaktif} />
              </Field>
            )}
          />
        ))}
        <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Menyimpan..." : labelSimpan}
        </Button>
      </FieldGroup>
    </form>
  );
}
