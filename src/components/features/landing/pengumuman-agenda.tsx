import { ArrowRight, Pin } from "lucide-react";
import Link from "next/link";

import { BlokTanggal } from "@/components/shared/blok-tanggal";
import { JudulBagian } from "@/components/shared/judul-bagian";
import { LABEL_JENIS_AGENDA } from "@/lib/constants/label";
import { formatTanggal } from "@/lib/format";
import { ringkas, teksDariHtml } from "@/lib/html";
import type { Agenda, PengumumanPublik } from "@/types/domain";

const PANJANG_CUPLIKAN = 140;

type PengumumanAgendaProps = {
  pengumuman: PengumumanPublik[];
  agenda: Agenda[];
};

function rentangTanggal(agenda: Agenda): string {
  if (agenda.tanggal_mulai === agenda.tanggal_selesai) return formatTanggal(agenda.tanggal_mulai);
  return `${formatTanggal(agenda.tanggal_mulai)} – ${formatTanggal(agenda.tanggal_selesai)}`;
}

export function BagianPengumumanAgenda({ pengumuman, agenda }: PengumumanAgendaProps) {
  return (
    <section aria-label="Pengumuman dan agenda">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <JudulBagian
            id="judul-pengumuman"
            judul="Pengumuman"
            aksi={
              <Link href="/pengumuman" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Semua pengumuman
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />
          {pengumuman.length === 0 ? (
            <p className="text-muted-foreground">Belum ada pengumuman untuk umum.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pengumuman.map((item) => (
                <li key={item.id} className="py-5 first:pt-0">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.is_pinned ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary-strong">
                        <Pin aria-hidden="true" className="size-3.5" />
                        Disematkan
                      </span>
                    ) : null}
                    {item.published_at ? <time dateTime={item.published_at}>{formatTanggal(item.published_at)}</time> : null}
                  </p>
                  <h3 className="mt-1 text-base font-semibold">
                    <Link href={`/pengumuman/${item.slug}`} className="hover:text-primary hover:underline">
                      {item.judul}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ringkas(teksDariHtml(item.isi), PANJANG_CUPLIKAN)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <JudulBagian id="judul-agenda" judul="Agenda" />
          {agenda.length === 0 ? (
            <p className="text-muted-foreground">Belum ada agenda dalam waktu dekat.</p>
          ) : (
            <ul className="space-y-5">
              {agenda.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <BlokTanggal tanggal={item.tanggal_mulai} />
                  <div>
                    <h3 className="text-base font-semibold">{item.judul}</h3>
                    <p className="text-sm text-muted-foreground">
                      {LABEL_JENIS_AGENDA[item.jenis]} · {rentangTanggal(item)}
                    </p>
                    {item.deskripsi ? <p className="mt-1 text-sm">{item.deskripsi}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
