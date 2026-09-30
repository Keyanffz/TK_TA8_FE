"use client";

import Link from "next/link";
import { Suspense, useState, type ReactNode } from "react";

import { AnakAktifProvider } from "@/components/layout/dashboard/anak-aktif";
import { AnakSwitcher } from "@/components/layout/dashboard/anak-switcher";
import { BottomNavWali } from "@/components/layout/dashboard/bottom-nav-wali";
import { MenuHp } from "@/components/layout/dashboard/menu-hp";
import { MenuPengguna } from "@/components/layout/dashboard/menu-pengguna";
import { NotifikasiBell } from "@/components/layout/dashboard/notifikasi-bell";
import { PesanAksesDitolak } from "@/components/layout/dashboard/pesan-akses-ditolak";
import { Sidebar } from "@/components/layout/dashboard/sidebar";
import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { SIDEBAR_COOKIE, tulisCookiePreferensi } from "@/lib/auth/cookies";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

type ShellDashboardProps = {
  namaSekolah: string;
  logoUrl: string | null;
  sidebarCiutAwal: boolean;
  anakAktifAwal: number | null;
  children: ReactNode;
};

/**
 * Kerangka dashboard (B8): sidebar hijau di desktop untuk semua role, sheet
 * menu di HP untuk Kepala Sekolah dan guru, bottom nav di HP untuk wali.
 */
export function ShellDashboard({ namaSekolah, logoUrl, sidebarCiutAwal, anakAktifAwal, children }: ShellDashboardProps) {
  const { isWali, beranda } = useSession();
  const [ciut, setCiut] = useState(sidebarCiutAwal);

  const ubahCiut = () => {
    tulisCookiePreferensi(SIDEBAR_COOKIE, ciut ? "lebar" : "ciut");
    setCiut(!ciut);
  };

  return (
    <AnakAktifProvider awal={anakAktifAwal}>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
      >
        Lewati ke konten
      </a>
      <div className="flex min-h-dvh">
        <Sidebar namaSekolah={namaSekolah} logoUrl={logoUrl} ciut={ciut} onUbahCiut={ubahCiut} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header data-topbar-dashboard className="sticky top-0 z-30 bg-primary text-primary-foreground lg:border-b lg:border-border lg:bg-card lg:text-foreground">
            <div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-8">
              {isWali ? null : <MenuHp namaSekolah={namaSekolah} />}
              <Link href={beranda} className="flex min-w-0 items-center gap-2 lg:hidden">
                {isWali ? (
                  <span className="rounded-full bg-card p-0.5">
                    <LogoSekolah logoUrl={logoUrl} namaSekolah={namaSekolah} ukuran={36} className="size-9" />
                  </span>
                ) : null}
                <span className={cn("truncate font-heading font-extrabold", isWali && "sr-only sm:not-sr-only")}>
                  {namaSekolah}
                </span>
              </Link>
              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                {isWali ? <AnakSwitcher /> : null}
                <NotifikasiBell />
                <MenuPengguna />
              </div>
            </div>
          </header>
          <main id="konten" className={cn("flex-1", isWali ? "pb-24 lg:pb-10" : "pb-10")}>
            {children}
          </main>
        </div>
      </div>
      {isWali ? <BottomNavWali /> : null}
      <Suspense>
        <PesanAksesDitolak />
      </Suspense>
    </AnakAktifProvider>
  );
}
