"use client";

import Link from "next/link";
import { useState } from "react";

import { FormPendaftaran } from "@/components/features/ppdb/form-pendaftaran";
import { keBodyPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";
import { Bintang } from "@/components/shared/ornamen/bintang";
import { TombolSalin } from "@/components/shared/tombol-salin";
import { buttonVariants } from "@/components/ui/button";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { LABEL_TINGKAT } from "@/lib/constants/label";
import { formatTanggal } from "@/lib/format";
import type { PendaftaranPublik } from "@/types/domain";

type Hasil = { pendaftaran: PendaftaranPublik; tanggalLahir: string };

function BuktiPendaftaran({ pendaftaran, tanggalLahir }: Hasil) {
  const urlStatus = `/ppdb/status?kode=${encodeURIComponent(pendaftaran.kode)}`;

  return (
    <section aria-labelledby="judul-bukti" className="gerak-masuk rounded-xl border-2 border-primary bg-card p-6 shadow-md">
      <p className="flex items-center gap-2 font-heading font-bold text-primary-strong">
        <Bintang className="gerak-kelip size-5 text-highlight-strong" />
        Pendaftaran terkirim
      </p>
      <h2 id="judul-bukti" className="mt-2 text-lg font-extrabold">
        Simpan kode pendaftaran {pendaftaran.nama_panggilan}
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-highlight-soft px-4 py-3">
        <p className="font-heading text-xl font-extrabold tracking-wider tabular-nums">{pendaftaran.kode}</p>
        <TombolSalin teks={pendaftaran.kode} label="Salin Kode" />
      </div>
      <p className="mt-4 text-sm">
        Untuk memantau status, buka halaman Cek Status lalu masukkan kode ini dan tanggal lahir anak ({tanggalLahir}). Foto
        atau tangkap layar halaman ini supaya kodenya tidak hilang.
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Tahun Ajaran</dt>
          <dd className="font-bold">{pendaftaran.tahun_ajaran.nama}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Mendaftar ke</dt>
          <dd className="font-bold">{LABEL_TINGKAT[pendaftaran.tingkat_tujuan]}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">
        Sekolah akan memeriksa dokumen dan menghubungi Anda lewat nomor HP yang diisi.
      </p>
      <Link href={urlStatus} className={buttonVariants({ size: "lg", className: "mt-6" })}>
        Cek Status Pendaftaran
      </Link>
    </section>
  );
}

/** Pendaftaran PPDB tanpa login (A2.3). Setelah terkirim, form diganti bukti berisi kode pendaftaran. */
export function DaftarPpdbPublik() {
  const [hasil, setHasil] = useState<Hasil | null>(null);

  if (hasil) return <BuktiPendaftaran {...hasil} />;

  return (
    <FormPendaftaran
      kirim={async (nilai) => {
        const { data } = await ambilData(
          api.POST("/public/pendaftaran", { body: keBodyPendaftaran(nilai), bodySerializer: keFormData }),
        );
        return { pendaftaran: data, tanggalLahir: formatTanggal(nilai.tanggal_lahir) };
      }}
      onBerhasil={(baru) => {
        setHasil(baru);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
