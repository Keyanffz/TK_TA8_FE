import type { Metadata } from "next";

import { BerandaGuru } from "@/components/features/beranda/guru/beranda-guru";
import { BerandaKepalaSekolah } from "@/components/features/beranda/kepala-sekolah/beranda-kepala-sekolah";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaMudarrisPage() {
  const user = await wajibSesi();
  return user.role === "super_admin" ? <BerandaKepalaSekolah nama={user.name} /> : <BerandaGuru namaGuru={user.name} />;
}
