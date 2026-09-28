"use client";

import { Button } from "@/components/ui/button";

// Menangkap error dari layout (public), (auth), dan dashboard, yang tidak ditangkap error.tsx di segmen yang sama.
export default function ErrorAplikasi({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-16">
      <h1 className="text-xl font-semibold">Halaman belum bisa ditampilkan</h1>
      <p className="mt-3 text-muted-foreground">
        Data dari server sekolah sedang tidak bisa diambil. Coba muat ulang beberapa saat lagi.
      </p>
      <Button className="mt-6 self-start" onClick={retry}>
        Muat Ulang
      </Button>
    </main>
  );
}
