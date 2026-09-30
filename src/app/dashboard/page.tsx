import type { Metadata } from "next";

import { BerandaWali } from "@/components/features/beranda/wali/beranda-wali";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaPage() {
  const user = await wajibSesi();
  return <BerandaWali namaWali={user.name} />;
}
