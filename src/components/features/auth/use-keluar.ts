"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { errorDariResponse, pesanError } from "@/lib/api/errors";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

async function keluar(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw await errorDariResponse(response);
  }
}

export function useKeluar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: keluar,
    onSettled: () => {
      // Cookie sesi sudah dihapus route handler, termasuk saat backend gagal dihubungi.
      queryClient.clear();
      router.replace(RUTE_LOGIN.pilihan);
      router.refresh();
    },
    onError: (error) => toast.error(pesanError(error)),
  });
}
