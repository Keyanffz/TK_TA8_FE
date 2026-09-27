"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/** Menampilkan pesan dari redirect wajibAkses() (?akses=ditolak), lalu membersihkan URL. */
export function PesanAksesDitolak() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ditolak = params.get("akses") === "ditolak";

  useEffect(() => {
    if (!ditolak) return;
    toast.error("Anda tidak punya akses ke halaman itu.");
    router.replace(pathname);
  }, [ditolak, pathname, router]);

  return null;
}
