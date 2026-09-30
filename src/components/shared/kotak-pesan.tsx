import type { ReactNode } from "react";

import { KELAS_NADA, type NadaStatus } from "@/lib/constants/status";
import { cn } from "@/lib/utils";

type KotakPesanProps = {
  nada: Extract<NadaStatus, "sukses" | "bahaya" | "menunggu" | "proses">;
  judul?: string;
  children: ReactNode;
  className?: string;
};

/** Pesan di dalam halaman/form, misalnya akun nonaktif atau konfirmasi terkirim. */
export function KotakPesan({ nada, judul, children, className }: KotakPesanProps) {
  return (
    <div
      role={nada === "bahaya" ? "alert" : "status"}
      className={cn("rounded-md px-4 py-3 text-sm", KELAS_NADA[nada], className)}
    >
      {judul ? <p className="font-semibold">{judul}</p> : null}
      <div className={judul ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
