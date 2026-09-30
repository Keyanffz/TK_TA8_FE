"use client";

import Link from "next/link";
import { useState } from "react";

import { FormGuru } from "@/components/features/guru/form-guru";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { TombolSalin } from "@/components/shared/tombol-salin";
import { buttonVariants } from "@/components/ui/button";
import { useTambahGuru } from "@/lib/api/guru";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";
import type { Guru } from "@/types/domain";

/** Akun guru dibuat langsung aktif tanpa password; guru masuk dengan Google (A7 `POST /guru`). */
export function TambahGuru() {
  const tambah = useTambahGuru();
  const [baru, setBaru] = useState<Guru | null>(null);

  if (baru) {
    const halamanMasuk = `${window.location.origin}${RUTE_LOGIN.staff}`;
    return (
      <KotakPesan nada="sukses" judul={`Akun ${baru.user.name} sudah dibuat`}>
        <p>Sampaikan ke guru: buka halaman masuk guru, pilih Masuk dengan Google, lalu pakai akun Google dengan email berikut.</p>
        <dl className="mt-4 grid gap-3 text-foreground sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Email Google</dt>
            <dd className="font-bold break-all">{baru.user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Halaman masuk guru</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="font-bold break-all">{halamanMasuk}</span>
              <TombolSalin teks={halamanMasuk} label="Salin" />
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/mudarris/guru/${baru.id}`} className={buttonVariants({ size: "sm" })}>
            Buka Data Guru
          </Link>
          <Link href="/mudarris/guru" className={buttonVariants({ size: "sm", variant: "outline" })}>
            Kembali ke Daftar Guru
          </Link>
        </div>
      </KotakPesan>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <FormGuru
        guru={null}
        labelSimpan="Buat Akun Guru"
        kirim={async (body) => {
          const hasil = await tambah.mutateAsync(body);
          setBaru(hasil.data);
        }}
      />
    </div>
  );
}
