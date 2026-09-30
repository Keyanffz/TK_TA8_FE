import type { Metadata } from "next";

import { FormLupaPassword } from "@/components/features/auth/form-lupa-password";

export const metadata: Metadata = { title: "Lupa Password" };

export default function LupaPasswordPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Lupa Password</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Khusus akun Kepala Sekolah. Guru tidak memakai password dan masuk dengan Google. Wali murid yang lupa password meminta
        Kepala Sekolah mengembalikannya ke password awal.
      </p>
      <FormLupaPassword />
    </>
  );
}
