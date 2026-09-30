import { ArrowRight, BookOpenText, UserPlus, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { AngkaNaik } from "@/components/shared/angka-naik";
import { Bintang } from "@/components/shared/ornamen/bintang";
import type { DashboardKepalaSekolah } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

type Tertunda = DashboardKepalaSekolah["tertunda"];

const TINDAKAN: readonly { kunci: keyof Tertunda; label: string; href: string; ikon: LucideIcon }[] = [
  { kunci: "pembayaran_menunggu", label: "Pembayaran menunggu verifikasi", href: "/mudarris/pembayaran", ikon: Wallet },
  { kunci: "rapor_diajukan", label: "Rapor menunggu review", href: "/mudarris/rapor", ikon: BookOpenText },
  { kunci: "pendaftaran_baru", label: "Pendaftar PPDB baru", href: "/mudarris/ppdb", ikon: UserPlus },
];

/** Panel "Perlu Tindakan" (B5), hal paling penting di beranda Kepala Sekolah. */
export function PerluTindakan({ tertunda }: { tertunda: Tertunda }) {
  const semuaBeres = TINDAKAN.every(({ kunci }) => tertunda[kunci] === 0);

  if (semuaBeres) {
    return (
      <p className="gerak-masuk flex items-center gap-3 rounded-xl bg-card p-4 font-bold text-foreground shadow-sm">
        <Bintang className="putar-saat-hover size-8 text-highlight" />
        Tidak ada yang menunggu tindakan Anda.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-3 font-heading text-lg font-extrabold">Perlu Tindakan</h2>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {TINDAKAN.map(({ kunci, label, href, ikon: Ikon }, indeks) => {
          const jumlah = tertunda[kunci];
          const ada = jumlah > 0;
          return (
            <li key={kunci} className="gerak-masuk" style={{ "--i": indeks + 2 } as CSSProperties}>
              <Link
                href={href}
                className={cn(
                  "angkat group flex h-full flex-col rounded-xl p-4 shadow-sm",
                  ada ? "bg-highlight text-highlight-foreground" : "bg-card text-muted-foreground",
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <AngkaNaik nilai={jumlah} className={cn("font-heading text-2xl leading-none font-extrabold", ada && "text-foreground")} />
                  <Ikon aria-hidden="true" className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
                </span>
                <span className="mt-2 flex flex-1 items-end gap-1 text-sm font-bold">
                  {label}
                  <ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
