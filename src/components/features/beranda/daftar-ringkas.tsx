import { Pin } from "lucide-react";
import Link from "next/link";

import { BlokTanggal } from "@/components/shared/blok-tanggal";
import { EmptyState } from "@/components/shared/empty-state";
import { LABEL_JENIS_AGENDA } from "@/lib/constants/label";
import { formatTanggal, rentangTanggal } from "@/lib/format";
import { ringkas, teksDariHtml } from "@/lib/html";
import type { Agenda, Pengumuman } from "@/types/domain";

const PANJANG_CUPLIKAN = 110;

/** `beranda`: /dashboard (wali) atau /mudarris (guru, Kepala Sekolah). */
export function PengumumanRingkas({ pengumuman, beranda }: { pengumuman: Pengumuman[]; beranda: string }) {
  if (pengumuman.length === 0) {
    return <EmptyState ringkas judul="Belum ada pengumuman." deskripsi="Pengumuman dari sekolah muncul di sini." />;
  }
  return (
    <ul className="divide-y divide-border">
      {pengumuman.map((item) => (
        <li key={item.id}>
          <Link href={`${beranda}/pengumuman/${item.id}`} className="group block rounded-md py-3 hover:bg-primary-soft/50">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.is_pinned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-highlight px-2 py-0.5 font-bold text-highlight-foreground">
                  <Pin aria-hidden="true" className="size-3 transition-[rotate] duration-300 group-hover:-rotate-45" />
                  Disematkan
                </span>
              ) : null}
              {item.published_at ? <time dateTime={item.published_at}>{formatTanggal(item.published_at)}</time> : null}
            </p>
            <p className="mt-1 font-bold group-hover:text-primary-strong group-hover:underline">{item.judul}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{ringkas(teksDariHtml(item.isi), PANJANG_CUPLIKAN)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AgendaRingkas({ agenda }: { agenda: Agenda[] }) {
  if (agenda.length === 0) {
    return <EmptyState ringkas judul="Belum ada agenda dalam waktu dekat." />;
  }
  return (
    <ul className="space-y-4">
      {agenda.map((item) => (
        <li key={item.id} className="flex gap-3">
          <BlokTanggal tanggal={item.tanggal_mulai} />
          <div className="min-w-0">
            <p className="font-bold">{item.judul}</p>
            <p className="text-sm text-muted-foreground">
              {LABEL_JENIS_AGENDA[item.jenis]} · {rentangTanggal(item.tanggal_mulai, item.tanggal_selesai)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
