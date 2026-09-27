"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useUbahWaliMurid } from "@/lib/api/wali-murid";
import { nikAtauNull, skemaAlamat, skemaNama, skemaNikOpsional, skemaNomorHp, skemaPekerjaan } from "@/lib/auth/skema";
import type { WaliMuridDetail } from "@/types/domain";

// Backend tidak mengizinkan nomor HP, alamat, dan pekerjaan dikosongkan, tetapi
// akun otomatis yang belum onboarding memang masih kosong; kolom itu boleh tetap kosong.
function skemaUntuk(wali: WaliMuridDetail) {
  const bolehKosong = <T extends z.ZodType<string>>(skema: T, adaIsi: boolean) => (adaIsi ? skema : z.union([z.literal(""), skema]));
  return z.object({
    nama: skemaNama,
    no_hp: bolehKosong(skemaNomorHp, Boolean(wali.user.no_hp)),
    alamat: bolehKosong(skemaAlamat, Boolean(wali.alamat)),
    pekerjaan: bolehKosong(skemaPekerjaan, Boolean(wali.pekerjaan)),
    nik: skemaNikOpsional,
  });
}

type NilaiUbahWali = z.infer<ReturnType<typeof skemaUntuk>>;
const FIELD = ["nama", "no_hp", "alamat", "pekerjaan", "nik"] as const;

function nilaiDari(wali: WaliMuridDetail): NilaiUbahWali {
  return {
    nama: wali.user.name,
    no_hp: wali.user.no_hp ?? "",
    alamat: wali.alamat ?? "",
    pekerjaan: wali.pekerjaan ?? "",
    nik: wali.nik ?? "",
  };
}

/** Koreksi data wali oleh Kepala Sekolah. Hanya field yang berubah yang dikirim; username tidak bisa diubah. */
export function FormUbahWali({ wali }: { wali: WaliMuridDetail }) {
  const ubah = useUbahWaliMurid(wali.id);
  const form = useForm<NilaiUbahWali>({ resolver: zodResolver(skemaUntuk(wali)), defaultValues: nilaiDari(wali) });
  const { errors, isDirty, dirtyFields } = form.formState;

  const simpan = form.handleSubmit((nilai) => {
    const berubah = FIELD.filter((field) => dirtyFields[field]);
    const body = Object.fromEntries(berubah.map((field) => [field, field === "nik" ? nikAtauNull(nilai.nik) : nilai[field]]));
    ubah.mutate(body, {
      onSuccess: (hasil) => {
        form.reset(nilaiDari({ ...wali, ...hasil.data }));
        toast.success("Data wali tersimpan.");
      },
      onError: (error) => {
        if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
      },
    });
  });

  return (
    <form noValidate onSubmit={(event) => void simpan(event)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="Nama" error={errors.nama?.message} {...form.register("nama")} />
          <KolomTeks label="Nomor HP" type="tel" inputMode="numeric" error={errors.no_hp?.message} {...form.register("no_hp")} />
          <KolomTeks label="Pekerjaan" error={errors.pekerjaan?.message} {...form.register("pekerjaan")} />
          <KolomTeks label="NIK (opsional)" inputMode="numeric" maxLength={16} error={errors.nik?.message} {...form.register("nik")} />
        </div>
        <KolomArea label="Alamat" rows={2} error={errors.alamat?.message} {...form.register("alamat")} />
        <Button type="submit" disabled={!isDirty || ubah.isPending} className="self-start">
          {ubah.isPending ? "Menyimpan..." : "Simpan Data Wali"}
        </Button>
      </FieldGroup>
    </form>
  );
}
