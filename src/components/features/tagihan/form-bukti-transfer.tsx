"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomTeks } from "@/components/shared/kolom-teks";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useBayarTagihan } from "@/lib/api/tagihan";
import { useSession } from "@/lib/auth/use-session";
import { hariIniJakarta } from "@/lib/tanggal";

const skemaBukti = z.object({
  bukti: z.array(z.custom<File>((nilai) => nilai instanceof File)).length(1, "Unggah foto atau tangkapan layar bukti transfer."),
  tanggal_bayar: z
    .string()
    .min(1, "Tanggal transfer wajib diisi.")
    .refine((nilai) => nilai <= hariIniJakarta(), "Tanggal transfer tidak boleh setelah hari ini."),
  bank_pengirim: z.string().trim().min(1, "Bank pengirim wajib diisi.").max(50, "Maksimal 50 karakter."),
  nama_pengirim: z.string().trim().min(1, "Nama pemilik rekening wajib diisi.").max(100, "Maksimal 100 karakter."),
});

type NilaiBukti = z.infer<typeof skemaBukti>;
const FIELD = ["bukti", "tanggal_bayar", "bank_pengirim", "nama_pengirim"] as const;

/** Wali mengunggah bukti transfer (A2.5); tagihan lalu menunggu verifikasi petugas keuangan. */
export function FormBuktiTransfer({ tagihanId }: { tagihanId: number }) {
  const { user } = useSession();
  const bayar = useBayarTagihan(tagihanId);
  const form = useForm<NilaiBukti>({
    resolver: zodResolver(skemaBukti),
    defaultValues: { bukti: [], tanggal_bayar: hariIniJakarta(), bank_pengirim: "", nama_pengirim: user?.name ?? "" },
  });
  const { errors } = form.formState;

  const kirim = form.handleSubmit(({ bukti, ...nilai }) =>
    bayar.mutate(
      { ...nilai, metode: "transfer", bukti: bukti[0] },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Bukti transfer terkirim. Sekolah akan memeriksanya.");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: (error) => {
          if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
        },
      },
    ),
  );

  return (
    <form noValidate onSubmit={(event) => void kirim(event)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="bukti"
          render={({ field }) => (
            <ZonaUnggah
              label="Foto bukti transfer"
              deskripsi="Foto struk ATM atau tangkapan layar m-banking. Pastikan nominal dan tanggal terbaca."
              nilai={field.value}
              onUbah={field.onChange}
              error={errors.bukti?.message}
            />
          )}
        />
        <KolomTeks label="Tanggal transfer" type="date" max={hariIniJakarta()} error={errors.tanggal_bayar?.message} {...form.register("tanggal_bayar")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <KolomTeks label="Bank pengirim" placeholder="Contoh: BRI" autoComplete="off" error={errors.bank_pengirim?.message} {...form.register("bank_pengirim")} />
          <KolomTeks label="Nama pemilik rekening" autoComplete="off" error={errors.nama_pengirim?.message} {...form.register("nama_pengirim")} />
        </div>
        <Button type="submit" size="lg" disabled={bayar.isPending}>
          {bayar.isPending ? "Mengunggah..." : "Unggah Bukti Transfer"}
        </Button>
      </FieldGroup>
    </form>
  );
}
