"use client";

import { HalamanGalat } from "@/components/shared/halaman-galat";
import { useSession } from "@/lib/auth/use-session";

// Dipakai juga oleh /mudarris (re-export), jadi beranda diambil dari sesi.
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { beranda } = useSession();
  return <HalamanGalat error={error} retry={retry} beranda={beranda} />;
}
