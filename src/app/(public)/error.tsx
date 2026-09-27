"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPublik({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-xl font-semibold">Halaman belum bisa ditampilkan</h1>
      <p className="mt-3 text-muted-foreground">
        Data dari server sekolah sedang tidak bisa diambil. Coba muat ulang beberapa saat lagi.
      </p>
      <Button className="mt-6" onClick={reset}>
        Muat Ulang
      </Button>
    </div>
  );
}
