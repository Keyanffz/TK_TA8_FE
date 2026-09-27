import type { Metadata } from "next";

import { TombolKeluar } from "@/components/features/auth/tombol-keluar";
import { LABEL_ROLE } from "@/lib/constants/label";
import { ambilSesi } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaPage() {
  const user = await ambilSesi();
  if (!user) return null;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12">
      <h1 className="text-xl font-semibold">Halo, {user.name}</h1>
      <p className="text-muted-foreground">Anda masuk sebagai {LABEL_ROLE[user.role]}.</p>
      <div>
        <TombolKeluar />
      </div>
    </main>
  );
}
