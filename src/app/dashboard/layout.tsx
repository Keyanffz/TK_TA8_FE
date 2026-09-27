import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ShellDashboard } from "@/components/layout/dashboard/shell-dashboard";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { queryKeys } from "@/lib/api/query-keys";
import { pathSekarang, wajibSesi } from "@/lib/auth/akses";
import { pilihAnakAktif } from "@/lib/auth/anak-aktif";
import { ANAK_COOKIE, SIDEBAR_COOKIE } from "@/lib/auth/cookies";
import { RUTE_ONBOARDING } from "@/lib/auth/path";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const [user, path, cookieStore, profil] = await Promise.all([
    wajibSesi(),
    pathSekarang(),
    cookies(),
    ambilProfilSekolah(),
  ]);
  const halamanOnboarding = path.split("?")[0] === RUTE_ONBOARDING;

  // Wali yang belum melengkapi profil selalu ke onboarding dulu (B3).
  if (user.wali_murid && !user.wali_murid.profil_lengkap && !halamanOnboarding) {
    redirect(RUTE_ONBOARDING);
  }

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.me, user);
  const anakAktif = pilihAnakAktif(user.wali_murid?.anak ?? [], cookieStore.get(ANAK_COOKIE)?.value);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {halamanOnboarding ? (
        children
      ) : (
        <ShellDashboard
          namaSekolah={profil.namaSekolah}
          logoUrl={profil.logoUrl}
          sidebarCiutAwal={cookieStore.get(SIDEBAR_COOKIE)?.value === "ciut"}
          anakAktifAwal={anakAktif?.id ?? null}
        >
          {children}
        </ShellDashboard>
      )}
    </HydrationBoundary>
  );
}
