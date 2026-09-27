"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomArea, KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import type { BodyMurid } from "@/lib/api/murid";
import { AGAMA, LABEL_STATUS_MURID, OPSI_JENIS_KELAMIN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";
import type { Murid } from "@/types/domain";

const STATUS_MURID = ["aktif", "lulus", "pindah", "keluar"] as const;

const skemaMurid = z
  .object({
    nama_lengkap: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(255, "Nama terlalu panjang."),
    nama_panggilan: z.string().trim().min(1, "Nama panggilan wajib diisi.").max(50, "Maksimal 50 karakter."),
    jenis_kelamin: z.enum(["L", "P"], { error: "Pilih jenis kelamin." }),
    tempat_lahir: z.string().trim().min(1, "Tempat lahir wajib diisi.").max(100, "Maksimal 100 karakter."),
    tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi."),
    agama: z.string().min(1, "Pilih agama."),
    alamat: z.string().trim().min(1, "Alamat wajib diisi.").max(500, "Maksimal 500 karakter."),
    nik: z.string().trim().regex(/^(\d{16})?$/, "NIK berisi 16 angka. Boleh dikosongkan."),
    nisn: z.string().trim().regex(/^(\d{10})?$/, "NISN berisi 10 angka. Boleh dikosongkan."),
    anak_ke: z.string().regex(/^(\d{1,2})?$/, "Isi dengan angka."),
    catatan_khusus: z.string().trim().max(1000, "Maksimal 1000 karakter."),
    tanggal_masuk: z.string().min(1, "Tanggal masuk wajib diisi."),
    status: z.enum(STATUS_MURID),
    tanggal_keluar: z.string(),
    foto: z.array(z.custom<File>((nilai) => nilai instanceof File)).max(1),
  })
  .refine((nilai) => nilai.status === "aktif" || nilai.tanggal_keluar !== "", {
    path: ["tanggal_keluar"],
    message: "Isi tanggal keluar untuk murid yang lulus, pindah, atau keluar.",
  });

type NilaiMurid = z.infer<typeof skemaMurid>;
const FIELD = [
  "nama_lengkap", "nama_panggilan", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "agama", "alamat", "nik", "nisn",
  "anak_ke", "catatan_khusus", "tanggal_masuk", "status", "tanggal_keluar", "foto",
] as const;

function nilaiAwal(murid: Murid | null): DefaultValues<NilaiMurid> {
  return {
    nama_lengkap: murid?.nama_lengkap ?? "",
    nama_panggilan: murid?.nama_panggilan ?? "",
    jenis_kelamin: murid?.jenis_kelamin,
    tempat_lahir: murid?.tempat_lahir ?? "",
    tanggal_lahir: murid?.tanggal_lahir ?? "",
    agama: murid?.agama ?? "",
    alamat: murid?.alamat ?? "",
    nik: murid?.nik ?? "",
    nisn: murid?.nisn ?? "",
    anak_ke: murid?.anak_ke ? String(murid.anak_ke) : "",
    catatan_khusus: murid?.catatan_khusus ?? "",
    tanggal_masuk: murid?.tanggal_masuk ?? hariIniJakarta(),
    status: murid?.status ?? "aktif",
    tanggal_keluar: murid?.tanggal_keluar ?? "",
    foto: [],
  };
}

// Isian kosong dikirim "" (backend mengubahnya jadi null). Status dan tanggal keluar hanya saat mengubah.
function keBody({ foto, status, tanggal_keluar, anak_ke, ...nilai }: NilaiMurid, ubah: boolean): BodyMurid {
  return {
    ...nilai,
    anak_ke: anak_ke === "" ? null : Number(anak_ke),
    foto: foto[0] ?? null,
    ...(ubah ? { status, ...(status === "aktif" ? {} : { tanggal_keluar }) } : {}),
  };
}

type FormMuridProps = { murid: Murid | null; kirim: (body: BodyMurid) => Promise<unknown>; labelSimpan: string };

export function FormMurid({ murid, kirim, labelSimpan }: FormMuridProps) {
  const form = useForm<NilaiMurid>({ resolver: zodResolver(skemaMurid), defaultValues: nilaiAwal(murid) });
  const { errors, isSubmitting } = form.formState;
  const status = useWatch({ control: form.control, name: "status" });

  const simpan = form.handleSubmit(async (nilai) => {
    try {
      await kirim(keBody(nilai, murid !== null));
      form.reset({ ...nilai, foto: [] });
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void simpan(event)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="Nama lengkap" autoComplete="off" error={errors.nama_lengkap?.message} {...form.register("nama_lengkap")} />
          <KolomTeks label="Nama panggilan" autoComplete="off" error={errors.nama_panggilan?.message} {...form.register("nama_panggilan")} />
        </div>
        <Controller
          control={form.control}
          name="jenis_kelamin"
          render={({ field }) => (
            <KolomRadio label="Jenis kelamin" opsi={OPSI_JENIS_KELAMIN} nilai={field.value} onUbah={field.onChange} error={errors.jenis_kelamin?.message} />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="Tempat lahir" error={errors.tempat_lahir?.message} {...form.register("tempat_lahir")} />
          <KolomTeks
            label="Tanggal lahir"
            type="date"
            max={hariIniJakarta()}
            deskripsi={murid ? undefined : "Menjadi password awal akun wali (DDMMYYYY)."}
            error={errors.tanggal_lahir?.message}
            {...form.register("tanggal_lahir")}
          />
          <KolomPilih label="Agama" error={errors.agama?.message} {...form.register("agama")}>
            <option value="">Pilih agama</option>
            {AGAMA.map((agama) => (
              <option key={agama} value={agama}>
                {agama}
              </option>
            ))}
          </KolomPilih>
          <KolomTeks label="Anak ke- (opsional)" inputMode="numeric" maxLength={2} error={errors.anak_ke?.message} {...form.register("anak_ke")} />
          <KolomTeks label="NIK (opsional)" inputMode="numeric" maxLength={16} error={errors.nik?.message} {...form.register("nik")} />
          <KolomTeks label="NISN (opsional)" inputMode="numeric" maxLength={10} error={errors.nisn?.message} {...form.register("nisn")} />
        </div>
        <KolomArea label="Alamat" rows={2} error={errors.alamat?.message} {...form.register("alamat")} />
        <KolomArea
          label="Catatan khusus (opsional)"
          rows={2}
          deskripsi="Misalnya alergi makanan atau kebutuhan khusus. Hanya terlihat guru, Kepala Sekolah, dan wali anak ini."
          error={errors.catatan_khusus?.message}
          {...form.register("catatan_khusus")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="Tanggal masuk" type="date" error={errors.tanggal_masuk?.message} {...form.register("tanggal_masuk")} />
          {murid ? (
            <KolomPilih label="Status" error={errors.status?.message} {...form.register("status")}>
              {STATUS_MURID.map((nilai) => (
                <option key={nilai} value={nilai}>
                  {LABEL_STATUS_MURID[nilai]}
                </option>
              ))}
            </KolomPilih>
          ) : null}
          {murid && status !== "aktif" ? (
            <KolomTeks label="Tanggal keluar" type="date" error={errors.tanggal_keluar?.message} {...form.register("tanggal_keluar")} />
          ) : null}
        </div>
        <Controller
          control={form.control}
          name="foto"
          render={({ field }) => (
            <div className="flex items-start gap-4">
              {murid && field.value.length === 0 ? <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={80} className="mt-7 size-20 text-xl" /> : null}
              <div className="flex-1">
                <ZonaUnggah label={murid?.foto_url ? "Ganti foto" : "Foto (opsional)"} nilai={field.value} onUbah={field.onChange} error={errors.foto?.message} />
              </div>
            </div>
          )}
        />
        <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Menyimpan..." : labelSimpan}
        </Button>
      </FieldGroup>
    </form>
  );
}
