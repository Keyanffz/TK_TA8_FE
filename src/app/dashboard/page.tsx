import type { Metadata } from "next";

import { BerandaGuru } from "@/components/features/beranda/guru/beranda-guru";
import { BerandaKepalaSekolah } from "@/components/features/beranda/kepala-sekolah/beranda-kepala-sekolah";
import { BerandaWali } from "@/components/features/beranda/wali/beranda-wali";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaPage() {
  const user = await wajibSesi();

  if (user.role === "super_admin") return <BerandaKepalaSekolah nama={user.name} />;
  if (user.role === "guru") return <BerandaGuru namaGuru={user.name} />;
  return <BerandaWali namaWali={user.name} />;
}
