"use client";

import Link from "next/link";
import { useState } from "react";

import { FormGuru } from "@/components/features/guru/form-guru";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { TombolSalin } from "@/components/shared/tombol-salin";
import { buttonVariants } from "@/components/ui/button";
import { useTambahGuru } from "@/lib/api/guru";
import type { Guru } from "@/types/domain";

/** Akun guru dibuat langsung aktif; password awal hanya tampil sekali di sini (A7 `POST /guru`). */
export function TambahGuru() {
  const tambah = useTambahGuru();
  const [baru, setBaru] = useState<Guru | null>(null);

  if (baru) {
    return (
      <KotakPesan nada="sukses" judul={`Akun ${baru.user.name} sudah dibuat`}>
        <p>Sampaikan email dan password awal berikut ke guru. Password ini hanya tampil sekali dan tidak dikirim lewat email.</p>
        <dl className="mt-4 grid gap-3 text-foreground sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="font-bold break-all">{baru.user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Password awal</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-card px-3 py-1 font-heading text-lg font-extrabold tracking-wider">{baru.password_awal}</span>
              {baru.password_awal ? <TombolSalin teks={baru.password_awal} label="Salin" /> : null}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/dashboard/guru/${baru.id}`} className={buttonVariants({ size: "sm" })}>
            Buka Data Guru
          </Link>
          <Link href="/dashboard/guru" className={buttonVariants({ size: "sm", variant: "outline" })}>
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
