"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bintang } from "@/components/shared/ornamen/bintang";
import { useSession } from "@/lib/auth/use-session";
import { hrefAktif, menuUntuk } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type DaftarMenuProps = {
  ciut?: boolean;
  /** Dipanggil setelah tautan dipilih, misalnya untuk menutup sheet. */
  onPilih?: () => void;
};

/** Menu per role dari lib/navigation.ts, di atas latar hijau. */
export function DaftarMenu({ ciut = false, onPilih }: DaftarMenuProps) {
  const pathname = usePathname();
  const sesi = useSession();
  const grup = menuUntuk(sesi);
  const aktif = hrefAktif(
    pathname,
    grup.flatMap((item) => item.item),
  );

  return (
    <nav aria-label="Menu dashboard" className="flex flex-col gap-5">
      {grup.map((kelompok) => (
        <div key={kelompok.judul}>
          <p className={cn("mb-1 px-3 font-heading text-xs font-bold tracking-wider uppercase", ciut && "sr-only")}>
            {kelompok.judul}
          </p>
          <ul className="flex flex-col gap-0.5">
            {kelompok.item.map((item) => {
              const Ikon = item.ikon;
              const terpilih = item.href === aktif;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onPilih}
                    aria-current={terpilih ? "page" : undefined}
                    title={ciut ? item.label : undefined}
                    className={cn(
                      "group relative flex min-h-11 items-center gap-3 rounded-md px-3 font-heading text-sm font-bold transition-colors duration-150",
                      terpilih ? "bg-highlight text-highlight-foreground" : "hover:bg-primary-foreground/15",
                      ciut && "justify-center px-0",
                    )}
                  >
                    <Ikon aria-hidden="true" className="size-5 shrink-0 transition-transform duration-200 group-hover:-rotate-6" />
                    <span className={cn(ciut && "sr-only")}>{item.label}</span>
                    {terpilih && !ciut ? <Bintang className="gerak-kelip ml-auto size-3.5 text-primary" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
