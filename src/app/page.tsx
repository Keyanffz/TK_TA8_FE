import Link from "next/link";

import { apiServer } from "@/lib/api/server";

export default async function BerandaPublikPage() {
  const { data } = await apiServer({ revalidate: 300, tags: ["profil"] }).GET("/public/profil");
  const namaSekolah = data?.data["profil.nama_sekolah"];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">{typeof namaSekolah === "string" ? namaSekolah : "Beranda"}</h1>
      <Link href="/dashboard" className="text-primary underline underline-offset-4">
        Buka dashboard
      </Link>
    </main>
  );
}
