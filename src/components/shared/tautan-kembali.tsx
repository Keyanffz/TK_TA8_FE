import Link from "next/link";
import type { ReactNode } from "react";

/** Tautan kembali ke daftar, di atas halaman detail dan halaman ubah. */
export function TautanKembali({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
      {children}
    </Link>
  );
}
