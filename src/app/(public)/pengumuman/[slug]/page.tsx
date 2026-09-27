import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KontenHtml } from "@/components/shared/konten-html";
import { ambilDetailPengumuman } from "@/lib/api/publik";
import { formatTanggal } from "@/lib/format";
import { ringkas, teksDariHtml } from "@/lib/html";

export async function generateMetadata({ params }: PageProps<"/pengumuman/[slug]">): Promise<Metadata> {
  const pengumuman = await ambilDetailPengumuman((await params).slug);
  if (!pengumuman) return {};
  return { title: pengumuman.judul, description: ringkas(teksDariHtml(pengumuman.isi), 160) };
}

export default async function DetailPengumumanPage({ params }: PageProps<"/pengumuman/[slug]">) {
  const pengumuman = await ambilDetailPengumuman((await params).slug);
  if (!pengumuman) notFound();

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/pengumuman" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ChevronLeft aria-hidden="true" className="size-4" />
        Semua pengumuman
      </Link>
      <h1 className="mt-6 max-w-3xl text-xl font-semibold md:text-2xl">{pengumuman.judul}</h1>
      {pengumuman.published_at ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Diterbitkan <time dateTime={pengumuman.published_at}>{formatTanggal(pengumuman.published_at)}</time>
        </p>
      ) : null}
      <KontenHtml html={pengumuman.isi} className="mt-8" />
    </article>
  );
}
