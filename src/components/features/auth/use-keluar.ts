"use client";

import { useMutation } from "@tanstack/react-query";

import { errorDariResponse } from "@/lib/api/errors";
import { ruteLogin } from "@/lib/auth/rute-login";
import { useSession } from "@/lib/auth/use-session";

async function keluar(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw await errorDariResponse(response);
  }
}

export function useKeluar() {
  const { role } = useSession();
  return useMutation({
    mutationFn: keluar,
    // Cookie sesi sudah dihapus route handler, termasuk saat backend gagal
    // dihubungi (penyebabnya dicatat di log server). Navigasi penuh membuang
    // cache React Query dan router sekaligus. queryClient.clear() tidak dipakai:
    // query yang masih terpasang langsung mengambil ulang data, gagal 401, lalu
    // handler 401 di Providers mengarahkan ke login wali karena role sudah hilang.
    onSettled: () => window.location.replace(ruteLogin(role)),
  });
}
