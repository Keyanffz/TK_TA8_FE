import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { RUTE_LOGIN, urlLogin } from "@/lib/auth/rute-login";

export function KembaliKePilihan({ next }: { next: string | null }) {
  return (
    <Link
      href={urlLogin(RUTE_LOGIN.pilihan, next)}
      className="group mb-6 inline-flex items-center gap-1 font-heading text-sm font-bold text-primary-strong hover:underline"
    >
      <ArrowLeft aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
      Pilih jenis akun lain
    </Link>
  );
}
