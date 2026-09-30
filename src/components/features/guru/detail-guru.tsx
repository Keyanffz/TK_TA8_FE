"use client";

import { toast } from "sonner";

import { FormGuru } from "@/components/features/guru/form-guru";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { FotoProfil } from "@/components/shared/foto-profil";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailGuru, useResetGoogleGuru, useUbahGuru, useUbahStatusGuru } from "@/lib/api/guru";
import { LABEL_STATUS_AKUN } from "@/lib/constants/label";
import { NADA_STATUS_AKUN } from "@/lib/constants/status";
import { formatTanggal, formatTanggalWaktu } from "@/lib/format";
import type { Guru } from "@/types/domain";

function AksiStatus({ guru }: { guru: Guru }) {
  const ubahStatus = useUbahStatusGuru();
  const { status, name } = guru.user;
  if (guru.user.role === "super_admin") return null;
  const nonaktifkan = status === "aktif";
  return (
    <DialogKonfirmasi
      pemicu={<Button variant={nonaktifkan ? "outline" : "secondary"}>{nonaktifkan ? "Nonaktifkan Akun" : "Aktifkan Akun"}</Button>}
      judul={nonaktifkan ? `Nonaktifkan akun ${name}?` : `Aktifkan kembali akun ${name}?`}
      deskripsi={
        nonaktifkan
          ? "Guru langsung dikeluarkan dari semua perangkat dan tidak bisa masuk sampai diaktifkan lagi. Akun tidak dihapus, jadi data kelas, kegiatan, dan rapor tetap ada."
          : "Guru bisa masuk lagi dengan akun Google yang emailnya terdaftar di sini."
      }
      labelAksi={nonaktifkan ? "Nonaktifkan" : "Aktifkan"}
      berbahaya={nonaktifkan}
      onKonfirmasi={async () => {
        await ubahStatus.mutateAsync({ id: guru.id, status: nonaktifkan ? "nonaktif" : "aktif" });
        toast.success(nonaktifkan ? `Akun ${name} dinonaktifkan.` : `Akun ${name} aktif kembali.`);
      }}
    />
  );
}

/** Hanya untuk guru yang sudah pernah masuk dengan Google (`terhubung_google`). */
function ResetTautanGoogle({ guru }: { guru: Guru }) {
  const reset = useResetGoogleGuru();
  if (!guru.terhubung_google) return null;
  const { name, email } = guru.user;
  return (
    <DialogKonfirmasi
      pemicu={<Button variant="outline">Reset tautan Google</Button>}
      judul={`Reset tautan Google ${name}?`}
      deskripsi={`Akun Google yang sekarang terikat dilepas. Login Google berikutnya dengan ${email ?? "email ini"} akan mengikat akun Google yang dipakai saat itu. Pakai ini kalau guru membuat ulang akun Google dengan email yang sama. Guru juga dikeluarkan dari semua perangkat dan harus masuk lagi dengan Google.`}
      labelAksi="Reset Tautan"
      onKonfirmasi={async () => {
        await reset.mutateAsync(guru.id);
        toast.success(`Tautan Google ${name} direset.`);
      }}
    />
  );
}

export function DetailGuru({ id }: { id: number }) {
  const { data: guru, isPending, isError, error, refetch } = useDetailGuru(id);
  const ubah = useUbahGuru(id);

  if (isPending) return <Skeleton aria-label="Memuat data guru" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
      <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <FotoProfil nama={guru.user.name} url={guru.foto_url} ukuran={72} className="size-18 text-xl" />
          <div className="min-w-0">
            <p className="font-heading text-lg leading-tight font-extrabold">{guru.user.name}</p>
            <p className="text-sm text-muted-foreground">{guru.jabatan}</p>
          </div>
        </div>
        <StatusBadge nada={NADA_STATUS_AKUN[guru.user.status]} className="self-start">
          {LABEL_STATUS_AKUN[guru.user.status]}
        </StatusBadge>
        {guru.user.role === "super_admin" ? (
          <KotakPesan nada="proses">Profil guru milik Kepala Sekolah. Status akun dan izin keuangan tidak bisa diubah.</KotakPesan>
        ) : null}
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Terdaftar</dt>
            <dd className="font-bold">{guru.created_at ? formatTanggal(guru.created_at) : "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Akun Google</dt>
            <dd className="font-bold">{guru.terhubung_google ? "Terhubung" : "Belum pernah masuk dengan Google"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Terakhir masuk</dt>
            <dd className="font-bold">{guru.user.last_login_at ? formatTanggalWaktu(guru.user.last_login_at) : "Belum pernah"}</dd>
          </div>
        </dl>
        <AksiStatus guru={guru} />
        <ResetTautanGoogle guru={guru} />
      </aside>
      <section aria-labelledby="judul-data-guru" className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 id="judul-data-guru" className="mb-5 text-lg font-extrabold">
          Data guru
        </h2>
        <FormGuru
          key={guru.id}
          guru={guru}
          labelSimpan="Simpan Perubahan"
          kirim={async (body) => {
            await ubah.mutateAsync(body);
            toast.success("Data guru tersimpan.");
          }}
        />
      </section>
    </div>
  );
}
