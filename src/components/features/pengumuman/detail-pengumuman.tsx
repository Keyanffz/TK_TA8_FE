"use client";

import { Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KontenHtml } from "@/components/shared/konten-html";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailPengumuman, useHapusPengumuman } from "@/lib/api/pengumuman";
import { useSession } from "@/lib/auth/use-session";
import { formatTanggalWaktu } from "@/lib/format";
import { sasaranPengumuman } from "@/lib/pengumuman";

export function DetailPengumuman({ id }: { id: number }) {
  const router = useRouter();
  const { user, isSuperAdmin } = useSession();
  const { data: pengumuman, isPending, isError, error, refetch } = useDetailPengumuman(id);
  const hapus = useHapusPengumuman();

  if (isPending) return <Skeleton aria-label="Memuat pengumuman" className="h-80 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const bolehKelola = isSuperAdmin || user?.id === pengumuman.penulis.id;

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="flex flex-col gap-2">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {pengumuman.is_pinned ? (
            <span className="inline-flex items-center gap-1 font-bold text-highlight-foreground">
              <Star aria-hidden="true" className="size-4 fill-highlight text-highlight-strong" />
              Disematkan
            </span>
          ) : null}
          <span>{pengumuman.published_at ? formatTanggalWaktu(pengumuman.published_at) : "Draft, belum terbit"}</span>
          <span>· {pengumuman.penulis.nama}</span>
        </p>
        <h1 className="text-xl leading-tight font-extrabold">{pengumuman.judul}</h1>
        {bolehKelola ? (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Untuk:</span>
            <span className="font-bold">{sasaranPengumuman(pengumuman)}</span>
            {pengumuman.target === "murid" && pengumuman.murid?.length ? (
              <span className="text-muted-foreground">({pengumuman.murid.map((murid) => murid.nama_lengkap).join(", ")})</span>
            ) : null}
            {pengumuman.is_publik ? <StatusBadge nada="sukses">Tampil di website</StatusBadge> : null}
          </p>
        ) : null}
      </header>
      <KontenHtml html={pengumuman.isi} />
      {bolehKelola ? (
        <footer className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Link href={`/mudarris/pengumuman/${pengumuman.id}/ubah`} className={buttonVariants({ variant: "outline" })}>
            <Pencil aria-hidden="true" />
            Ubah Pengumuman
          </Link>
          <DialogKonfirmasi
            pemicu={
              <Button variant="ghost">
                <Trash2 aria-hidden="true" />
                Hapus
              </Button>
            }
            judul={`Hapus pengumuman "${pengumuman.judul}"?`}
            deskripsi="Pengumuman hilang dari feed semua penerima dan dari website kalau ditampilkan di sana."
            labelAksi="Hapus Pengumuman"
            berbahaya
            onKonfirmasi={async () => {
              const { message } = await hapus.mutateAsync(pengumuman.id);
              toast.success(message);
              router.replace("/mudarris/pengumuman");
            }}
          />
        </footer>
      ) : null}
    </article>
  );
}
