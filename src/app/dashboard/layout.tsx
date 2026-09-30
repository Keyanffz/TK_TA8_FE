import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ShellDashboard } from "@/components/layout/dashboard/shell-dashboard";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { queryKeys } from "@/lib/api/query-keys";
import { pathSekarang, wajibSesi } from "@/lib/auth/akses";
import { pilihAnakAktif } from "@/lib/auth/anak-aktif";
import { ANAK_COOKIE, SIDEBAR_COOKIE } from "@/lib/auth/cookies";
import { BERANDA_STAFF, RUTE_GANTI_PASSWORD, RUTE_ONBOARDING } from "@/lib/auth/path";
import { isRoleStaff } from "@/lib/auth/role";

/** Area wali murid. Guru dan Kepala Sekolah memakai /mudarris. */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const [user, path, cookieStore, profil] = await Promise.all([
    wajibSesi(),
    pathSekarang(),
    cookies(),
    ambilProfilSekolah(),
  ]);
  // proxy.ts sudah memetakan /dashboard/* ke /mudarris/* berdasarkan cookie tk_role;
  // ini untuk cookie yang tidak cocok dengan sesi sebenarnya.
  if (isRoleStaff(user.role)) redirect(BERANDA_STAFF);

  const rute = path.split("?")[0];
  const halamanGantiPassword = rute === RUTE_GANTI_PASSWORD;
  const halamanOnboarding = rute === RUTE_ONBOARDING;

  // Urutan wajib wali (A6): ganti password awal, lalu lengkapi profil (B3).
  if (user.wajib_ganti_password && !halamanGantiPassword) redirect(RUTE_GANTI_PASSWORD);
  if (!user.wajib_ganti_password && user.wali_murid && !user.wali_murid.profil_lengkap && !halamanOnboarding) {
    redirect(RUTE_ONBOARDING);
  }

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.me, user);
  const anakAktif = pilihAnakAktif(user.wali_murid?.anak ?? [], cookieStore.get(ANAK_COOKIE)?.value);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {halamanGantiPassword || halamanOnboarding ? (
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
