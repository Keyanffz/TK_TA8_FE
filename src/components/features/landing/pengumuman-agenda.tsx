import { ArrowRight, Pin } from "lucide-react";
import Link from "next/link";

import { BlokTanggal } from "@/components/shared/blok-tanggal";
import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import { LABEL_JENIS_AGENDA } from "@/lib/constants/label";
import { formatTanggal, rentangTanggal } from "@/lib/format";
import { ringkas, teksDariHtml } from "@/lib/html";
import type { Agenda, PengumumanPublik } from "@/types/domain";

const PANJANG_CUPLIKAN = 140;

type PengumumanAgendaProps = {
  pengumuman: PengumumanPublik[];
  agenda: Agenda[];
};

export function BagianPengumumanAgenda({ pengumuman, agenda }: PengumumanAgendaProps) {
  return (
    <section aria-label="Pengumuman dan agenda">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <JudulBagian
            id="judul-pengumuman"
            judul="Pengumuman"
            aksi={
              <Link href="/pengumuman" className="group inline-flex items-center gap-1 font-heading font-bold text-primary-strong hover:underline">
                Semua pengumuman
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            }
          />
          {pengumuman.length === 0 ? (
            <p className="text-muted-foreground">Belum ada pengumuman untuk umum.</p>
          ) : (
            <Muncul as="ul" efek="geser" className="space-y-4">
              {pengumuman.map((item) => (
                <li key={item.id} className="group rounded-lg border border-border bg-card p-5 transition-colors duration-200 hover:border-primary">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.is_pinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-highlight px-2 py-0.5 font-bold text-highlight-foreground">
                        <Pin aria-hidden="true" className="size-3.5 transition-[rotate] duration-300 group-hover:-rotate-45" />
                        Disematkan
                      </span>
                    ) : null}
                    {item.published_at ? <time dateTime={item.published_at}>{formatTanggal(item.published_at)}</time> : null}
                  </p>
                  <h3 className="mt-2 text-base font-bold">
                    <Link href={`/pengumuman/${item.slug}`} className="hover:text-primary-strong hover:underline">
                      {item.judul}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ringkas(teksDariHtml(item.isi), PANJANG_CUPLIKAN)}</p>
                </li>
              ))}
            </Muncul>
          )}
        </div>

        <div>
          <JudulBagian id="judul-agenda" judul="Agenda" />
          {agenda.length === 0 ? (
            <p className="text-muted-foreground">Belum ada agenda dalam waktu dekat.</p>
          ) : (
            <Muncul as="ul" efek="balik" className="space-y-5">
              {agenda.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <BlokTanggal tanggal={item.tanggal_mulai} />
                  <div>
                    <h3 className="text-base font-bold">{item.judul}</h3>
                    <p className="text-sm text-muted-foreground">
                      {LABEL_JENIS_AGENDA[item.jenis]} · {rentangTanggal(item.tanggal_mulai, item.tanggal_selesai)}
                    </p>
                    {item.deskripsi ? <p className="mt-1 text-sm">{item.deskripsi}</p> : null}
                  </div>
                </li>
              ))}
            </Muncul>
          )}
        </div>
      </div>
    </section>
  );
}
