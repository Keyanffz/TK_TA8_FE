import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ShellDashboard } from "@/components/layout/dashboard/shell-dashboard";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { queryKeys } from "@/lib/api/query-keys";
import { wajibSesi } from "@/lib/auth/akses";
import { SIDEBAR_COOKIE } from "@/lib/auth/cookies";
import { BERANDA_WALI, urlAksesDitolak } from "@/lib/auth/path";
import { isRoleStaff } from "@/lib/auth/role";

/** Area guru dan Kepala Sekolah. Wali murid memakai /dashboard. */
export default async function MudarrisLayout({ children }: LayoutProps<"/mudarris">) {
  const [user, cookieStore, profil] = await Promise.all([wajibSesi(), cookies(), ambilProfilSekolah()]);

  // proxy.ts sudah menolak wali berdasarkan cookie tk_role; ini untuk cookie
  // yang tidak cocok dengan sesi sebenarnya.
  if (!isRoleStaff(user.role)) redirect(urlAksesDitolak(BERANDA_WALI));

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.me, user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ShellDashboard
        namaSekolah={profil.namaSekolah}
        logoUrl={profil.logoUrl}
        sidebarCiutAwal={cookieStore.get(SIDEBAR_COOKIE)?.value === "ciut"}
        anakAktifAwal={null}
      >
        {children}
      </ShellDashboard>
    </HydrationBoundary>
  );
}
