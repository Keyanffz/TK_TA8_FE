import type { Metadata } from "next";

import { FormLupaPassword } from "@/components/features/auth/form-lupa-password";

export const metadata: Metadata = { title: "Lupa Password" };

export default function LupaPasswordPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Lupa Password</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Untuk akun guru dan Kepala Sekolah. Wali murid masuk dengan akun Google, jadi tidak memakai password.
      </p>
      <FormLupaPassword />
    </>
  );
}
