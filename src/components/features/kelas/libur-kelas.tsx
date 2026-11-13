"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { useHapusLiburKelas, useTambahLiburKelas, type LiburKelas } from "@/lib/api/absensi-murid";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { rentangTanggal } from "@/lib/format";

const skemaLibur = z
  .object({
    tanggal_mulai: z.string().min(1, "Isi tanggal mulai libur."),
    tanggal_selesai: z.string(),
    keterangan: z.string().trim().min(1, "Tulis keterangan libur, misalnya Libur semester ganjil.").max(100, "Keterangan paling banyak 100 karakter."),
  })
  .refine((nilai) => nilai.tanggal_selesai === "" || nilai.tanggal_selesai >= nilai.tanggal_mulai, {
    path: ["tanggal_selesai"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

type NilaiLibur = z.infer<typeof skemaLibur>;
const FIELD = ["tanggal_mulai", "tanggal_selesai", "keterangan"] as const;

function FormLibur({ kelasId }: { kelasId: number }) {
  const tambah = useTambahLiburKelas(kelasId);
  const form = useForm<NilaiLibur>({ resolver: zodResolver(skemaLibur), defaultValues: { tanggal_mulai: "", tanggal_selesai: "", keterangan: "" } });
  const { errors } = form.formState;

  const kirim = form.handleSubmit((nilai) =>
    tambah.mutate(
      { ...nilai, tanggal_selesai: nilai.tanggal_selesai === "" ? null : nilai.tanggal_selesai },
      {
        onSuccess: (hasil) => {
          form.reset();
          toast.success(hasil.message);
        },
        onError: (error) => {
          if (!terapkanErrorValidasi(error, form.setError, FIELD)) form.setError("root.server", { message: pesanError(error) });
        },
      },
    ),
  );

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[auto_auto_1fr]">
        <KolomTeks label="Tanggal mulai" type="date" error={errors.tanggal_mulai?.message} {...form.register("tanggal_mulai")} />
        <KolomTeks label="Tanggal selesai" type="date" deskripsi="Kosongkan untuk libur satu hari." error={errors.tanggal_selesai?.message} {...form.register("tanggal_selesai")} />
        <KolomTeks label="Keterangan" maxLength={100} placeholder="Libur semester ganjil" error={errors.keterangan?.message} {...form.register("keterangan")} />
      </div>
      {errors.root?.server?.message ? <KotakPesan nada="bahaya">{errors.root.server.message}</KotakPesan> : null}
      <Button type="submit" variant="outline" className="self-start" disabled={tambah.isPending}>
        {tambah.isPending ? "Menyimpan..." : "Tambah Libur"}
      </Button>
    </form>
  );
}

/** Tanggal libur kelas: satu tanggal atau rentang. Wali kelas dan Kepala Sekolah bisa menambah dan menghapus. */
export function LiburKelasBagian({ kelasId, libur, bisaDiatur }: { kelasId: number; libur: LiburKelas[]; bisaDiatur: boolean }) {
  const hapus = useHapusLiburKelas(kelasId);

  return (
    <div className="flex flex-col gap-4">
      {bisaDiatur ? <FormLibur kelasId={kelasId} /> : null}
      {libur.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada tanggal libur kelas ini.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {libur.map((satu) => {
            const rentang = rentangTanggal(satu.tanggal_mulai, satu.tanggal_selesai);
            return (
              <li key={satu.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{rentang}</p>
                  <p className="text-sm text-muted-foreground">{satu.keterangan}</p>
                </div>
                {bisaDiatur ? (
                  <DialogKonfirmasi
                    pemicu={
                      <Button variant="ghost" size="sm">
                        Hapus
                      </Button>
                    }
                    judul={`Hapus libur ${rentang}?`}
                    deskripsi="Absensi murid bisa dicatat lagi pada tanggal itu, dan absensi yang sudah tercatat di tanggal itu kembali dihitung di rekap."
                    labelAksi="Hapus Libur"
                    berbahaya
                    onKonfirmasi={async () => {
                      const hasil = await hapus.mutateAsync(satu.id);
                      toast.success(hasil.message);
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
