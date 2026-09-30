"use client";

import Link from "next/link";
import { toast } from "sonner";

import { FormUbahWali } from "@/components/features/wali-murid/form-ubah-wali";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { FotoProfil } from "@/components/shared/foto-profil";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailWaliMurid, useResetPasswordWali, useUbahStatusWali } from "@/lib/api/wali-murid";
import { LABEL_HUBUNGAN, LABEL_STATUS_AKUN } from "@/lib/constants/label";
import { NADA_STATUS_AKUN } from "@/lib/constants/status";
import { formatTanggalWaktu } from "@/lib/format";
import type { WaliMuridDetail } from "@/types/domain";

function AksiAkun({ wali }: { wali: WaliMuridDetail }) {
  const ubahStatus = useUbahStatusWali(wali.id);
  const reset = useResetPasswordWali(wali.id);
  const aktif = wali.user.status === "aktif";
  const kontakUtama = wali.anak.filter((anak) => anak.is_kontak_utama);

  return (
    <div className="flex flex-wrap gap-2">
      <DialogKonfirmasi
        pemicu={<Button variant="outline">Reset Password</Button>}
        judul={`Kembalikan password ${wali.user.name} ke password awal?`}
        deskripsi={
          kontakUtama.length > 0
            ? `Password menjadi tanggal lahir ${kontakUtama[0].nama_panggilan} (DDMMYYYY) dan wali wajib menggantinya saat masuk. Semua perangkat yang sedang masuk dikeluarkan.`
            : "Wali ini bukan kontak utama anak mana pun, jadi backend akan menolak. Jadikan wali ini kontak utama di halaman murid dulu."
        }
        labelAksi="Reset Password"
        onKonfirmasi={async () => {
          await reset.mutateAsync();
          toast.success(`Password ${wali.user.name} dikembalikan ke password awal.`);
        }}
      />
      <DialogKonfirmasi
        pemicu={<Button variant={aktif ? "ghost" : "secondary"}>{aktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}</Button>}
        judul={aktif ? `Nonaktifkan akun ${wali.user.name}?` : `Aktifkan akun ${wali.user.name}?`}
        deskripsi={aktif ? "Wali dikeluarkan dari semua perangkat dan tidak bisa masuk sampai diaktifkan lagi." : "Wali bisa masuk lagi dengan password terakhirnya."}
        labelAksi={aktif ? "Nonaktifkan" : "Aktifkan"}
        berbahaya={aktif}
        onKonfirmasi={async () => {
          await ubahStatus.mutateAsync(aktif ? "nonaktif" : "aktif");
          toast.success(aktif ? "Akun wali dinonaktifkan." : "Akun wali aktif kembali.");
        }}
      />
    </div>
  );
}

export function DetailWaliMurid({ id }: { id: number }) {
  const { data: wali, isPending, isError, error, refetch } = useDetailWaliMurid(id);

  if (isPending) return <Skeleton aria-label="Memuat data wali" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <FotoProfil nama={wali.user.name} url={wali.user.avatar_url} ukuran={64} className="size-16 text-lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-xl leading-tight font-extrabold">{wali.user.name}</h1>
              <p className="text-sm text-muted-foreground">
                Username <span className="font-bold tabular-nums">{wali.user.username ?? "-"}</span> · terakhir masuk{" "}
                {wali.user.last_login_at ? formatTanggalWaktu(wali.user.last_login_at) : "belum pernah"}
              </p>
            </div>
            <StatusBadge nada={NADA_STATUS_AKUN[wali.user.status]}>{LABEL_STATUS_AKUN[wali.user.status]}</StatusBadge>
          </div>
          {wali.user.wajib_ganti_password ? (
            <KotakPesan nada="menunggu">Wali masih memakai password awal (tanggal lahir anak) dan akan diminta menggantinya saat masuk.</KotakPesan>
          ) : null}
          <AksiAkun wali={wali} />
        </section>
        <section aria-labelledby="judul-ubah-wali" className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 id="judul-ubah-wali" className="mb-5 text-lg font-extrabold">
            Data wali
          </h2>
          <FormUbahWali key={wali.id} wali={wali} />
        </section>
      </div>
      <section aria-labelledby="judul-anak-wali">
        <h2 id="judul-anak-wali" className="mb-3 text-lg font-extrabold">
          Anak tertaut
        </h2>
        {wali.anak.length === 0 ? (
          <EmptyState ringkas judul="Belum ada anak yang tertaut." />
        ) : (
          <ul className="flex flex-col gap-3">
            {wali.anak.map((anak) => (
              <li key={anak.id}>
                <Link href={`/mudarris/murid/${anak.id}`} className="angkat flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <FotoProfil nama={anak.nama_lengkap} url={anak.foto_url} ukuran={44} className="size-11 text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{anak.nama_lengkap}</span>
                    <span className="block text-xs text-muted-foreground">
                      <span className="tabular-nums">{anak.nis}</span> · {anak.kelas?.nama ?? "Belum ada kelas"} · {LABEL_HUBUNGAN[anak.hubungan]}
                    </span>
                  </span>
                  {anak.is_kontak_utama ? <StatusBadge nada="sukses">Kontak utama</StatusBadge> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
