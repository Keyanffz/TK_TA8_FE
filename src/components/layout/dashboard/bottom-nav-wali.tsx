"use client";

import { LayoutGrid, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useKeluar } from "@/components/features/auth/use-keluar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/auth/use-session";
import { hrefAktif, MENU_BAWAH_WALI, menuUntuk } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const KELAS_TAB =
  "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 font-heading text-xs font-bold transition-colors duration-150";

/** Navigasi bawah wali di HP (B8): empat menu utama + "Lainnya". */
export function BottomNavWali() {
  const pathname = usePathname();
  const sesi = useSession();
  const keluar = useKeluar();
  const [lainnyaTerbuka, setLainnyaTerbuka] = useState(false);
  const semua = menuUntuk(sesi).flatMap((grup) => grup.item);
  const utama = MENU_BAWAH_WALI.flatMap((href) => semua.filter((item) => item.href === href));
  const lainnya = semua.filter((item) => !MENU_BAWAH_WALI.some((href) => href === item.href));
  const aktif = hrefAktif(pathname, semua);
  const lainnyaAktif = lainnya.some((item) => item.href === aktif);

  return (
    <nav
      data-nav-bawah-wali
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-md lg:hidden"
    >
      <ul className="flex">
        {utama.map((item) => {
          const Ikon = item.ikon;
          const terpilih = item.href === aktif;
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={terpilih ? "page" : undefined}
                className={cn(KELAS_TAB, terpilih ? "text-primary-strong" : "text-muted-foreground")}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200",
                    terpilih && "bg-highlight text-highlight-foreground",
                  )}
                >
                  <Ikon aria-hidden="true" className={cn("size-5", terpilih && "gerak-masuk")} />
                </span>
                {item.labelPendek ?? item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <Sheet open={lainnyaTerbuka} onOpenChange={setLainnyaTerbuka}>
            <SheetTrigger className={cn(KELAS_TAB, lainnyaAktif ? "text-primary-strong" : "text-muted-foreground")}>
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full",
                  lainnyaAktif && "bg-highlight text-highlight-foreground",
                )}
              >
                <LayoutGrid aria-hidden="true" className="size-5" />
              </span>
              Lainnya
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <SheetHeader>
                <SheetTitle className="font-heading text-lg font-extrabold">Menu lainnya</SheetTitle>
                <SheetDescription className="sr-only">Menu dashboard wali murid</SheetDescription>
              </SheetHeader>
              <ul className="grid grid-cols-3 gap-2 px-4">
                {lainnya.map((item) => {
                  const Ikon = item.ikon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setLainnyaTerbuka(false)}
                        aria-current={item.href === aktif ? "page" : undefined}
                        className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg bg-primary-soft px-2 text-center font-heading text-sm font-bold text-primary-strong transition-transform duration-150 active:scale-95"
                      >
                        <Ikon aria-hidden="true" className="size-6" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => keluar.mutate()}
                    disabled={keluar.isPending}
                    className="flex min-h-20 w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-muted px-2 font-heading text-sm font-bold transition-transform duration-150 active:scale-95"
                  >
                    <LogOut aria-hidden="true" className="size-6" />
                    Keluar
                  </button>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
