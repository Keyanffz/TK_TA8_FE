"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomPassword } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { tujuanSetelahMasuk } from "@/lib/auth/masuk";
import { skemaPasswordBaru } from "@/lib/auth/skema";

const skemaGantiPassword = z
  .object({
    current_password: z.string().min(1, "Password lama wajib diisi."),
    password: skemaPasswordBaru,
    password_confirmation: z.string().min(1, "Ulangi password baru."),
  })
  .refine((nilai) => nilai.password === nilai.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password baru tidak sama.",
  })
  .refine((nilai) => nilai.password !== nilai.current_password, {
    path: ["password"],
    message: "Password baru harus berbeda dari password lama.",
  });

type NilaiGantiPassword = z.infer<typeof skemaGantiPassword>;
const FIELD = ["current_password", "password", "password_confirmation"] as const;
const KOSONG: NilaiGantiPassword = { current_password: "", password: "", password_confirmation: "" };

/**
 * `wajib`: wali yang masih memakai password awal. Setelah berhasil, sesi
 * diambil ulang lalu wali diteruskan ke onboarding atau beranda.
 */
export function FormGantiPassword({ wajib = false }: { wajib?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<NilaiGantiPassword>({ resolver: zodResolver(skemaGantiPassword), defaultValues: KOSONG });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (body: NilaiGantiPassword) => ambilData(api.PUT("/auth/password", { body })),
    onSuccess: async (hasil) => {
      form.reset(KOSONG);
      toast.success(hasil.message);
      if (!wajib) return;
      const user = (await ambilData(api.GET("/auth/me"))).data;
      queryClient.setQueryData(queryKeys.me, user);
      router.replace(tujuanSetelahMasuk(user, null));
      router.refresh();
    },
    onError: (error) => {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        <KolomPassword
          label={wajib ? "Password awal" : "Password lama"}
          autoComplete="current-password"
          inputMode={wajib ? "numeric" : undefined}
          deskripsi={wajib ? "Tanggal lahir anak, 8 angka (DDMMYYYY). Contoh: 05112021." : undefined}
          error={errors.current_password?.message}
          {...form.register("current_password")}
        />
        <KolomPassword
          label="Password baru"
          autoComplete="new-password"
          deskripsi={
            wajib
              ? "Minimal 8 karakter, berisi huruf dan angka. Tidak boleh sama dengan tanggal lahir anak."
              : "Minimal 8 karakter, berisi huruf dan angka. Perangkat lain akan dikeluarkan."
          }
          error={errors.password?.message}
          {...form.register("password")}
        />
        <KolomPassword
          label="Ulangi password baru"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...form.register("password_confirmation")}
        />
        <Button
          type="submit"
          size="lg"
          variant={wajib ? "default" : "outline"}
          disabled={mutation.isPending}
          className={wajib ? undefined : "self-start"}
        >
          {mutation.isPending ? "Menyimpan..." : wajib ? "Simpan Password Baru" : "Ganti Password"}
        </Button>
      </FieldGroup>
    </form>
  );
}
