import type { Metadata } from "next";

import { FormDaftarGuru } from "@/components/features/auth/form-daftar-guru";

export const metadata: Metadata = { title: "Daftar sebagai Guru" };

export default function DaftarGuruPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Daftar sebagai Guru</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Setelah mendaftar, akun perlu disetujui Kepala Sekolah sebelum bisa dipakai masuk.
      </p>
      <FormDaftarGuru />
    </>
  );
}
