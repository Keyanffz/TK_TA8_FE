"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useGuruAktif } from "@/lib/api/guru";
import { useSimpanKelas } from "@/lib/api/kelas";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { useSession } from "@/lib/auth/use-session";
import { LABEL_TINGKAT } from "@/lib/constants/label";
import type { Kelas } from "@/types/domain";

// Batas backend (SimpanKelasRequest::KAPASITAS_MAKSIMAL).
const KAPASITAS_MAKS = 50;
// Nilai bawaan kolom kelas.kapasitas (A4).
const KAPASITAS_BAWAAN = 20;
const OPSI_TINGKAT = (["A", "B"] as const).map((nilai) => ({ nilai, label: LABEL_TINGKAT[nilai] }));

const idOpsional = z.string().transform((nilai) => (nilai === "" ? null : Number(nilai)));

const skemaKelas = z
  .object({
    tahun_ajaran_id: z.string().min(1, "Pilih tahun ajaran.").transform(Number),
    nama: z.string().trim().min(1, "Nama kelas wajib diisi.").max(50, "Maksimal 50 karakter."),
    tingkat: z.enum(["A", "B"], { error: "Pilih kelompok." }),
    wali_kelas_id: idOpsional,
    guru_pendamping_id: idOpsional,
    kapasitas: z.coerce.number<string>().int("Kapasitas berupa bilangan bulat.").min(1, "Minimal 1.").max(KAPASITAS_MAKS, `Maksimal ${KAPASITAS_MAKS}.`),
  })
  .refine((nilai) => nilai.guru_pendamping_id === null || nilai.guru_pendamping_id !== nilai.wali_kelas_id, {
    path: ["guru_pendamping_id"],
    message: "Guru pendamping harus berbeda dari wali kelas.",
  });

type MasukanKelas = z.input<typeof skemaKelas>;
type NilaiKelas = z.output<typeof skemaKelas>;
const FIELD = ["tahun_ajaran_id", "nama", "tingkat", "wali_kelas_id", "guru_pendamping_id", "kapasitas"] as const;

function nilaiAwal(kelas: Kelas | null, tahunAjaranId: number | null): DefaultValues<MasukanKelas> {
  return {
    tahun_ajaran_id: String(kelas?.tahun_ajaran.id ?? tahunAjaranId ?? ""),
    nama: kelas?.nama ?? "",
    tingkat: kelas?.tingkat,
    wali_kelas_id: kelas?.wali_kelas ? String(kelas.wali_kelas.id) : "",
    guru_pendamping_id: kelas?.guru_pendamping ? String(kelas.guru_pendamping.id) : "",
    kapasitas: String(kelas?.kapasitas ?? KAPASITAS_BAWAAN),
  };
}

type FormKelasProps = { kelas: Kelas | null; tahunAjaranId: number | null; pemicu: ReactNode };

/** Tambah atau ubah kelas (SA), di dalam dialog. */
export function FormKelas({ kelas, tahunAjaranId, pemicu }: FormKelasProps) {
  const [terbuka, setTerbuka] = useState(false);
  const { user } = useSession();
  const tahunAjaran = useDaftarTahunAjaran();
  const guru = useGuruAktif(terbuka);
  const simpan = useSimpanKelas();
  const form = useForm<MasukanKelas, unknown, NilaiKelas>({ resolver: zodResolver(skemaKelas), defaultValues: nilaiAwal(kelas, tahunAjaranId) });
  const { errors } = form.formState;

  // Profil guru Kepala Sekolah tidak ada di GET /guru, tetapi boleh menjadi wali kelas (A2.1).
  const pilihanGuru = [
    ...(user?.guru ? [{ id: user.guru.id, nama: `${user.name} (Kepala Sekolah)` }] : []),
    ...(guru.data ?? []).map((item) => ({ id: item.id, nama: item.user.name })),
  ];

  const kirim = form.handleSubmit((body) =>
    simpan.mutate(
      { id: kelas?.id ?? null, body },
      {
        onSuccess: () => {
          toast.success(kelas ? `Kelas ${body.nama} diperbarui.` : `Kelas ${body.nama} ditambahkan.`);
          setTerbuka(false);
        },
        onError: (error) => {
          if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
        },
      },
    ),
  );

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(nilaiAwal(kelas, tahunAjaranId));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{kelas ? `Ubah ${kelas.nama}` : "Tambah Kelas"}</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomPilih label="Tahun ajaran" error={errors.tahun_ajaran_id?.message} {...form.register("tahun_ajaran_id")}>
              <option value="">Pilih tahun ajaran</option>
              {(tahunAjaran.data ?? []).map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama}
                  {ta.is_aktif ? " (aktif)" : ""}
                </option>
              ))}
            </KolomPilih>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <KolomTeks label="Nama kelas" placeholder="TK A1" error={errors.nama?.message} {...form.register("nama")} />
              <KolomTeks label="Kapasitas" type="number" inputMode="numeric" min={1} max={KAPASITAS_MAKS} error={errors.kapasitas?.message} {...form.register("kapasitas")} />
            </div>
            <Controller
              control={form.control}
              name="tingkat"
              render={({ field }) => <KolomRadio label="Kelompok" opsi={OPSI_TINGKAT} nilai={field.value} onUbah={field.onChange} error={errors.tingkat?.message} />}
            />
            {(["wali_kelas_id", "guru_pendamping_id"] as const).map((nama) => (
              <KolomPilih key={nama} label={nama === "wali_kelas_id" ? "Wali kelas" : "Guru pendamping"} error={errors[nama]?.message} {...form.register(nama)}>
                <option value="">Belum ditentukan</option>
                {pilihanGuru.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </KolomPilih>
            ))}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : "Simpan Kelas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
