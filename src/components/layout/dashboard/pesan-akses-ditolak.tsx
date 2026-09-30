"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { aksesDitolak } from "@/lib/auth/path";

/** Menampilkan pesan dari redirect wajibAkses() dan proxy.ts, lalu membersihkan URL. */
export function PesanAksesDitolak() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ditolak = aksesDitolak(params);

  useEffect(() => {
    if (!ditolak) return;
    toast.error("Anda tidak punya akses ke halaman itu.");
    router.replace(pathname);
  }, [ditolak, pathname, router]);

  return null;
}
