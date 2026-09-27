"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { skemaNama, skemaNomorHp } from "@/lib/auth/skema";
import { useSession } from "@/lib/auth/use-session";
import { kompresGambar, TIPE_GAMBAR_DITERIMA, tipeGambarDiterima } from "@/lib/gambar";
import type { User } from "@/types/domain";

const skemaProfil = z.object({
  name: skemaNama,
  no_hp: z.union([z.literal(""), skemaNomorHp]),
});

type NilaiProfil = z.infer<typeof skemaProfil>;
const FIELD = ["name", "no_hp"] as const;

export function FormProfil({ user: userAwal }: { user: User }) {
  const user = useSession().user ?? userAwal;
  const queryClient = useQueryClient();
  const idFoto = useId();
  const [foto, setFoto] = useState<{ file: File; url: string } | null>(null);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);
  const form = useForm<NilaiProfil>({
    resolver: zodResolver(skemaProfil),
    defaultValues: { name: user.name, no_hp: user.no_hp ?? "" },
  });
  const { errors } = form.formState;

  // URL pratinjau dilepas saat foto diganti atau komponen ditutup.
  useEffect(() => {
    if (!foto) return;
    return () => URL.revokeObjectURL(foto.url);
  }, [foto]);

  const mutation = useMutation({
    mutationFn: (nilai: NilaiProfil) =>
      ambilData(
        api.PUT("/auth/profil", {
          body: nilai,
          bodySerializer: (isi) => {
            const data = new FormData();
            data.append("name", isi.name);
            data.append("no_hp", isi.no_hp ?? "");
            if (foto) data.append("avatar", foto.file);
            return data;
          },
        }),
      ),
    onSuccess: (hasil) => {
      queryClient.setQueryData(queryKeys.me, hasil.data);
      setFoto(null);
      form.reset({ name: hasil.data.name, no_hp: hasil.data.no_hp ?? "" });
      toast.success("Profil tersimpan.");
    },
    onError: (error) => {
      if (terapkanErrorValidasi(error, form.setError, FIELD)) return;
      toast.error(pesanError(error));
    },
  });

  const pilihFoto = async (file: File | undefined) => {
    setGalatFoto(null);
    if (!file) return;
    if (!tipeGambarDiterima(file)) {
      setGalatFoto("Pilih foto berformat JPG, PNG, atau WebP.");
      return;
    }
    try {
      const hasil = await kompresGambar(file);
      setFoto({ file: hasil, url: URL.createObjectURL(hasil) });
    } catch (penyebab) {
      console.error("Kompresi foto gagal:", penyebab);
      setGalatFoto("Foto tidak bisa diproses. Coba foto lain.");
    }
  };

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        <div className="flex items-center gap-4">
          <div className="group relative">
            <FotoProfil nama={user.name} url={foto?.url ?? user.avatar_url} ukuran={80} className="size-20 text-xl" />
            <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
              <Camera aria-hidden="true" className="size-4" />
            </span>
          </div>
          <div>
            <label
              htmlFor={idFoto}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-input bg-card px-4 font-heading text-sm font-bold hover:bg-muted"
            >
              {user.avatar_url || foto ? "Ganti Foto" : "Unggah Foto"}
            </label>
            <input
              id={idFoto}
              type="file"
              accept={TIPE_GAMBAR_DITERIMA.join(",")}
              className="sr-only"
              onChange={(event) => void pilihFoto(event.target.files?.[0])}
            />
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, atau WebP. Foto besar dikecilkan otomatis.</p>
            {galatFoto ? <p className="mt-1 text-sm text-destructive">{galatFoto}</p> : null}
          </div>
        </div>
        <KolomTeks label="Nama" autoComplete="name" error={errors.name?.message} {...form.register("name")} />
        {user.username ? (
          <KolomTeks
            label="Username (NIS anak)"
            value={user.username}
            readOnly
            disabled
            deskripsi="Dipakai untuk masuk dan tidak bisa diubah."
          />
        ) : (
          <KolomTeks
            label="Email"
            value={user.email ?? ""}
            readOnly
            disabled
            deskripsi="Email dipakai untuk masuk dan tidak bisa diubah di sini."
          />
        )}
        <KolomTeks
          label="Nomor HP"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="08xxxxxxxxxx"
          error={errors.no_hp?.message}
          {...form.register("no_hp")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending} className="self-start">
          {mutation.isPending ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </FieldGroup>
    </form>
  );
}
