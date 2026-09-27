"use client";

import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { DialogAgenda } from "@/components/features/agenda/form-agenda";
import { KalenderAgenda } from "@/components/features/agenda/kalender-agenda";
import { BlokTanggal } from "@/components/shared/blok-tanggal";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Muncul } from "@/components/shared/muncul";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgendaBulan, useHapusAgenda } from "@/lib/api/agenda";
import { LABEL_JENIS_AGENDA } from "@/lib/constants/label";
import { NADA_JENIS_AGENDA } from "@/lib/constants/status";
import { formatBulan, formatTanggal, rentangTanggal } from "@/lib/format";
import { bulanJakarta, geserBulan } from "@/lib/tanggal";
import { cn } from "@/lib/utils";
import type { Agenda } from "@/types/domain";

const POLA_BULAN = /^\d{4}-(0[1-9]|1[0-2])$/;

function ItemAgenda({ agenda, kelola }: { agenda: Agenda; kelola: boolean }) {
  const hapus = useHapusAgenda();
  return (
    <li className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <BlokTanggal tanggal={agenda.tanggal_mulai} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <StatusBadge nada={NADA_JENIS_AGENDA[agenda.jenis]}>{LABEL_JENIS_AGENDA[agenda.jenis]}</StatusBadge>
          {kelola && !agenda.is_publik ? <StatusBadge nada="netral">Internal</StatusBadge> : null}
        </p>
        <h3 className="mt-1 font-heading text-lg leading-snug font-bold">{agenda.judul}</h3>
        <p className="text-sm text-muted-foreground">{rentangTanggal(agenda.tanggal_mulai, agenda.tanggal_selesai)}</p>
        {agenda.deskripsi ? <p className="mt-2 text-sm whitespace-pre-line">{agenda.deskripsi}</p> : null}
        {kelola ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <DialogAgenda
              agenda={agenda}
              pemicu={
                <Button size="sm" variant="outline">
                  <Pencil aria-hidden="true" />
                  Ubah
                </Button>
              }
            />
            <DialogKonfirmasi
              pemicu={
                <Button size="sm" variant="ghost">
                  <Trash2 aria-hidden="true" />
                  Hapus
                </Button>
              }
              judul={`Hapus agenda "${agenda.judul}"?`}
              deskripsi="Agenda hilang dari kalender semua pengguna dan dari website."
              labelAksi="Hapus Agenda"
              berbahaya
              onKonfirmasi={async () => {
                toast.success((await hapus.mutateAsync(agenda.id)).message);
              }}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** Kalender bulanan + daftar agenda (B4). Kepala Sekolah bisa menambah, mengubah, dan menghapus. */
export function HalamanAgenda({ kelola }: { kelola: boolean }) {
  const [bulanUrl, setBulan] = useQueryState("bulan", parseAsString);
  const [hari, setHari] = useQueryState("hari", parseAsString);
  const bulan = bulanUrl && POLA_BULAN.test(bulanUrl) ? bulanUrl : bulanJakarta();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAgendaBulan(bulan);
  const hariDipilih = hari?.startsWith(bulan) ? hari : null;
  const daftar = (data ?? []).filter((item) => !hariDipilih || (item.tanggal_mulai <= hariDipilih && item.tanggal_selesai >= hariDipilih));

  const pindah = (geser: number) => {
    void setBulan(geserBulan(bulan, geser));
    void setHari(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Bulan sebelumnya" onClick={() => pindah(-1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <h2 className="min-w-44 text-center text-lg font-extrabold" aria-live="polite">
            {formatBulan(bulan)}
          </h2>
          <Button variant="outline" size="icon" aria-label="Bulan berikutnya" onClick={() => pindah(1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
          {bulan !== bulanJakarta() ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void setBulan(null);
                void setHari(null);
              }}
            >
              Bulan ini
            </Button>
          ) : null}
        </div>
        {kelola ? (
          <DialogAgenda
            agenda={null}
            tanggalAwal={hariDipilih}
            pemicu={
              <Button>
                <Plus aria-hidden="true" />
                Tambah Agenda
              </Button>
            }
          />
        ) : null}
      </div>

      {isPending ? (
        <Skeleton aria-label="Memuat agenda" className="h-96 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : (
        <div className={cn("grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-start", isPlaceholderData && "opacity-60")}>
          <KalenderAgenda bulan={bulan} agenda={data} hariDipilih={hariDipilih} onPilihHari={(tanggal) => void setHari(tanggal)} />
          <section aria-labelledby="judul-daftar-agenda" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 id="judul-daftar-agenda" className="font-heading font-bold">
                {hariDipilih ? formatTanggal(hariDipilih) : `Agenda ${formatBulan(bulan)}`}
              </h2>
              {hariDipilih ? (
                <Button variant="ghost" size="sm" onClick={() => void setHari(null)}>
                  Tampilkan sebulan
                </Button>
              ) : null}
            </div>
            {daftar.length === 0 ? (
              <EmptyState ringkas judul={hariDipilih ? "Tidak ada agenda di tanggal ini." : "Belum ada agenda bulan ini."} />
            ) : (
              <Muncul as="ul" efek="balik" key={`${bulan}-${hariDipilih ?? ""}`} className="flex flex-col gap-3">
                {daftar.map((agenda) => (
                  <ItemAgenda key={agenda.id} agenda={agenda} kelola={kelola} />
                ))}
              </Muncul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
