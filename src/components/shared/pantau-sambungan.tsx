"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { sedangOffline } from "@/lib/api/errors";

const ID_TOAST_OFFLINE = "sambungan-terputus";

function pantauSambungan(onUbah: () => void): () => void {
  window.addEventListener("online", onUbah);
  window.addEventListener("offline", onUbah);
  return () => {
    window.removeEventListener("online", onUbah);
    window.removeEventListener("offline", onUbah);
  };
}

/**
 * Pemberitahuan selama perangkat tidak tersambung ke internet. React Query menunda pengambilan data saat
 * offline (tidak dianggap gagal), jadi tanpa pemberitahuan ini halaman hanya terlihat memuat terus.
 */
export function PantauSambungan() {
  const offline = useSyncExternalStore(pantauSambungan, sedangOffline, () => false);
  const pernahOffline = useRef(false);

  useEffect(() => {
    if (offline) {
      pernahOffline.current = true;
      toast.warning("Perangkat Anda tidak tersambung ke internet", {
        id: ID_TOAST_OFFLINE,
        description: "Periksa Wi-Fi atau data seluler. Data baru dimuat setelah sambungan kembali.",
        duration: Infinity,
      });
    } else if (pernahOffline.current) {
      toast.dismiss(ID_TOAST_OFFLINE);
      toast.success("Sambungan internet kembali");
    }
  }, [offline]);

  return null;
}
