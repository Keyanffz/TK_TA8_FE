import type { Metadata } from "next";

import { HalamanProfil } from "@/components/features/profil/halaman-profil";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilMudarrisPage() {
  return <HalamanProfil user={await wajibSesi()} />;
}
