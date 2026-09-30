import type { Metadata } from "next";
import Link from "next/link";

import { FormResetPassword } from "@/components/features/auth/form-reset-password";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { RUTE_AKUN_STAFF } from "@/lib/auth/rute-login";

export const metadata: Metadata = { title: "Buat Password Baru" };

function nilaiTunggal(nilai: string | string[] | undefined): string | null {
  const teks = Array.isArray(nilai) ? nilai[0] : nilai;
  return teks ? teks : null;
}

export default async function ResetPasswordPage({ searchParams }: PageProps<"/mudarris/reset-password">) {
  const parameter = await searchParams;
  const token = nilaiTunggal(parameter.token);
  const email = nilaiTunggal(parameter.email);

  return (
    <>
      <h1 className="mb-8 text-xl font-semibold">Buat Password Baru</h1>
      {token && email ? (
        <FormResetPassword token={token} email={email} />
      ) : (
        <KotakPesan nada="bahaya">
          Tautan reset password tidak lengkap. Buka lagi tautan dari email, atau{" "}
          <Link href={RUTE_AKUN_STAFF.lupaPassword} className="font-semibold underline underline-offset-4">
            minta tautan baru
          </Link>
          .
        </KotakPesan>
      )}
    </>
  );
}
