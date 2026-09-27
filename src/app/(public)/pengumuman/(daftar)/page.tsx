import { Pin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { JudulHalaman } from "@/components/shared/judul-halaman";
import { PaginasiTautan } from "@/components/shared/paginasi-tautan";
import { ambilDaftarPengumuman } from "@/lib/api/publik";
import { formatTanggal } from "@/lib/format";
import { nomorHalaman } from "@/lib/halaman";
import { ringkas, teksDariHtml } from "@/lib/html";

export const metadata: Metadata = { title: "Pengumuman" };

const PER_HALAMAN = 10;
const PANJANG_CUPLIKAN = 220;

export default async function PengumumanPage({ searchParams }: PageProps<"/pengumuman">) {
  const halaman = nomorHalaman((await searchParams).page);
  const { data, meta } = await ambilDaftarPengumuman(halaman, PER_HALAMAN);

  return (
    <>
      <JudulHalaman judul="Pengumuman" deskripsi="Pengumuman sekolah untuk orang tua dan masyarakat umum." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="max-w-3xl">
          {data.length === 0 ? (
            <EmptyState judul="Belum ada pengumuman untuk umum." />
          ) : (
            <ul className="divide-y divide-border">
              {data.map((item) => (
                <li key={item.id} className="py-6 first:pt-0">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.is_pinned ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary-strong">
                        <Pin aria-hidden="true" className="size-3.5" />
                        Disematkan
                      </span>
                    ) : null}
                    {item.published_at ? <time dateTime={item.published_at}>{formatTanggal(item.published_at)}</time> : null}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    <Link href={`/pengumuman/${item.slug}`} className="hover:text-primary hover:underline">
                      {item.judul}
                    </Link>
                  </h2>
                  <p className="mt-2 text-muted-foreground">{ringkas(teksDariHtml(item.isi), PANJANG_CUPLIKAN)}</p>
                </li>
              ))}
            </ul>
          )}
          <PaginasiTautan meta={meta} basePath="/pengumuman" />
        </div>
      </div>
    </>
  );
}
