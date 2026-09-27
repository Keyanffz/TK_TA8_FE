"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomArea, KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { MAKS_FOTO_PER_UNGGAHAN, type BodyKegiatan } from "@/lib/api/kegiatan";
import { useKelasAktif } from "@/lib/api/kelas";
import { hariIniJakarta } from "@/lib/tanggal";
import type { KegiatanKelas } from "@/types/domain";

const skemaKegiatan = z.object({
  kelas_id: z.string(),
  tanggal: z
    .string()
    .min(1, "Tanggal kegiatan wajib diisi.")
    .refine((nilai) => nilai <= hariIniJakarta(), "Tanggal kegiatan tidak boleh setelah hari ini."),
  tema: z.string().trim().max(100, "Tema maksimal 100 karakter."),
  judul: z.string().trim().min(1, "Judul kegiatan wajib diisi.").max(255, "Judul terlalu panjang."),
  deskripsi: z.string().trim().max(5000, "Cerita kegiatan maksimal 5000 karakter."),
  foto: z.array(z.custom<File>((nilai) => nilai instanceof File)).max(MAKS_FOTO_PER_UNGGAHAN, `Paling banyak ${MAKS_FOTO_PER_UNGGAHAN} foto sekali unggah.`),
});

type NilaiKegiatan = z.infer<typeof skemaKegiatan>;
const FIELD = ["kelas_id", "tanggal", "tema", "judul", "deskripsi"] as const;

type FormKegiatanProps = {
  /** Kosong untuk kegiatan baru. Saat mengubah, kelas dan foto tidak ikut (foto dikelola terpisah). */
  kegiatan: KegiatanKelas | null;
  kelasAwal?: number | null;
  labelSimpan: string;
  kirim: (body: BodyKegiatan) => Promise<unknown>;
  onBatal?: () => void;
};

export function FormKegiatan({ kegiatan, kelasAwal = null, labelSimpan, kirim, onBatal }: FormKegiatanProps) {
  const kelas = useKelasAktif();
  const baru = kegiatan === null;
  const pilihanKelas = kelas.data ?? [];
  const form = useForm<NilaiKegiatan>({
    resolver: zodResolver(
      baru ? skemaKegiatan.refine((nilai) => nilai.kelas_id !== "", { path: ["kelas_id"], message: "Pilih kelas." }) : skemaKegiatan,
    ),
    defaultValues: {
      kelas_id: kegiatan ? String(kegiatan.kelas.id) : kelasAwal ? String(kelasAwal) : "",
      tanggal: kegiatan?.tanggal ?? hariIniJakarta(),
      tema: kegiatan?.tema ?? "",
      judul: kegiatan?.judul ?? "",
      deskripsi: kegiatan?.deskripsi ?? "",
      foto: [],
    },
  });
  const { errors, isSubmitting } = form.formState;

  const simpan = form.handleSubmit(async ({ kelas_id, foto, ...nilai }) => {
    try {
      await kirim({ ...nilai, kelas_id: Number(kelas_id), ...(baru ? { foto } : {}) });
    } catch (error) {
      const pesanFoto = error instanceof ApiError ? Object.entries(error.errors ?? {}).find(([kunci]) => kunci.startsWith("foto"))?.[1][0] : undefined;
      if (pesanFoto) form.setError("foto", { type: "server", message: pesanFoto });
      if (!terapkanErrorValidasi(error, form.setError, FIELD) && !pesanFoto) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void simpan(event)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          {baru ? (
            <KolomPilih label="Kelas" error={errors.kelas_id?.message} disabled={kelas.isPending} {...form.register("kelas_id")}>
              <option value="">{kelas.isPending ? "Memuat kelas..." : "Pilih kelas"}</option>
              {pilihanKelas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </KolomPilih>
          ) : null}
          <KolomTeks label="Tanggal kegiatan" type="date" max={hariIniJakarta()} error={errors.tanggal?.message} {...form.register("tanggal")} />
        </div>
        <KolomTeks label="Judul" placeholder="Menanam kacang hijau di gelas plastik" error={errors.judul?.message} {...form.register("judul")} />
        <KolomTeks
          label="Tema (opsional)"
          placeholder="Tanaman di sekitarku"
          deskripsi="Tema pembelajaran minggu ini, kalau ada."
          error={errors.tema?.message}
          {...form.register("tema")}
        />
        <KolomArea
          label="Cerita kegiatan (opsional)"
          rows={5}
          deskripsi="Ceritakan apa yang dilakukan anak-anak. Wali murid membaca ini bersama fotonya."
          error={errors.deskripsi?.message}
          {...form.register("deskripsi")}
        />
        {baru ? (
          <Controller
            control={form.control}
            name="foto"
            render={({ field }) => (
              <ZonaUnggah
                label="Foto kegiatan (opsional)"
                deskripsi={`Paling banyak ${MAKS_FOTO_PER_UNGGAHAN} foto sekali unggah; foto lain bisa ditambahkan setelah disimpan. Foto hanya bisa dilihat wali murid kelas ini.`}
                maks={MAKS_FOTO_PER_UNGGAHAN}
                nilai={field.value}
                onUbah={field.onChange}
                error={errors.foto?.message}
              />
            )}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : labelSimpan}
          </Button>
          {onBatal ? (
            <Button type="button" variant="outline" onClick={onBatal} disabled={isSubmitting}>
              Batal
            </Button>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
