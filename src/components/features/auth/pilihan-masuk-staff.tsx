"use client";

import { ChevronDown } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { FormLoginStaff } from "@/components/features/auth/form-login-staff";
import { TombolMasukGoogle } from "@/components/features/auth/tombol-masuk-google";
import { cn } from "@/lib/utils";

const ID_FORM_PASSWORD = "form-password-kepala-sekolah";

/**
 * Google cara utama untuk guru dan Kepala Sekolah; form password hanya untuk
 * Kepala Sekolah dan disembunyikan sampai dibuka. Pilihan disimpan di URL
 * (`?cara=password`) supaya tetap terbuka setelah halaman dimuat ulang.
 */
export function PilihanMasukStaff() {
  const [cara, setCara] = useQueryState("cara", parseAsStringLiteral(["password"]));
  const pakaiPassword = cara === "password";

  return (
    <div className="flex flex-col gap-4">
      <TombolMasukGoogle />
      <p className="text-sm text-muted-foreground">Pakai akun Google dengan email yang didaftarkan Kepala Sekolah. Guru tidak memakai password.</p>
      <div className="border-t border-border pt-4">
        <button
          type="button"
          aria-expanded={pakaiPassword}
          aria-controls={ID_FORM_PASSWORD}
          onClick={() => void setCara(pakaiPassword ? null : "password")}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-strong hover:underline"
        >
          Masuk dengan password (Kepala Sekolah)
          <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-200", pakaiPassword && "rotate-180")} />
        </button>
        <div id={ID_FORM_PASSWORD} hidden={!pakaiPassword} className="gerak-masuk-naik mt-3">
          {pakaiPassword ? <FormLoginStaff /> : null}
        </div>
      </div>
    </div>
  );
}
