"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import { ApiError } from "@/lib/api/errors";
import { RUTE_GANTI_PASSWORD } from "@/lib/auth/path";
import { RUTE_LOGIN, urlLogin } from "@/lib/auth/rute-login";

// Data yang memuat signed URL file private (berlaku 30 menit) harus diambil
// ulang jauh sebelum URL-nya kedaluwarsa.
const STALE_TIME_MS = 60_000;
const MAKS_PERCOBAAN_ULANG = 2;

function bolehDicobaUlang(jumlahGagal: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return jumlahGagal < MAKS_PERCOBAAN_ULANG;
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(() => {
    // 401 berarti token di cookie sudah ditolak backend (proxy juga sudah
    // menghapus cookie-nya). Cache dikosongkan supaya data akun ini tidak
    // tertinggal, lalu pengguna diarahkan ke halaman login.
    // PASSWORD_WAJIB_DIGANTI: layout dashboard sudah mengarahkan wali ke halaman
    // ganti password, tetapi layout tidak dirender ulang saat navigasi di browser,
    // jadi penolakan backend ini ditangani juga di sini.
    const tanganiError = (error: unknown) => {
      if (!(error instanceof ApiError)) return;
      if (error.status === 401) {
        client.clear();
        const asal = `${window.location.pathname}${window.location.search}`;
        router.replace(urlLogin(RUTE_LOGIN.pilihan, asal));
      } else if (error.code === "PASSWORD_WAJIB_DIGANTI") {
        router.replace(RUTE_GANTI_PASSWORD);
        router.refresh();
      }
    };
    const client = new QueryClient({
      queryCache: new QueryCache({ onError: tanganiError }),
      mutationCache: new MutationCache({ onError: tanganiError }),
      defaultOptions: {
        queries: { staleTime: STALE_TIME_MS, retry: bolehDicobaUlang },
        mutations: { retry: false },
      },
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
