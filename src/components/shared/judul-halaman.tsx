import type { ReactNode } from "react";

type JudulHalamanProps = { judul: string; deskripsi?: ReactNode };

/** Kepala halaman publik selain landing. */
export function JudulHalaman({ judul, deskripsi }: JudulHalamanProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <h1 className="text-xl font-semibold md:text-2xl">{judul}</h1>
        {deskripsi ? <div className="mt-3 max-w-prose text-muted-foreground">{deskripsi}</div> : null}
      </div>
    </div>
  );
}
