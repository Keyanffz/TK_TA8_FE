"use client";

import Link from "next/link";
import { toast } from "sonner";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { useLepasWali, useUbahTautanWali } from "@/lib/api/murid";
import { HUBUNGAN, LABEL_HUBUNGAN } from "@/lib/constants/label";
import type { MuridDetail } from "@/types/domain";

type Wali = MuridDetail["wali"][number];

function AksiWali({ murid, wali }: { murid: MuridDetail; wali: Wali }) {
  const ubah = useUbahTautanWali(murid.id);
  const lepas = useLepasWali(murid.id);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`Hubungan ${wali.nama}`}
        value={wali.hubungan}
        disabled={ubah.isPending}
        onChange={(event) => {
          const hubungan = HUBUNGAN.find((nilai) => nilai === event.target.value);
          if (!hubungan) return;
          ubah.mutate(
            { waliId: wali.id, body: { hubungan } },
            {
              onSuccess: () => toast.success(`${wali.nama} sekarang tercatat sebagai ${LABEL_HUBUNGAN[hubungan].toLowerCase()}.`),
              onError: (error) => toast.error(pesanError(error)),
            },
          );
        }}
        className="h-10 rounded-md border border-input bg-card px-2 text-sm"
      >
        {HUBUNGAN.map((nilai) => (
          <option key={nilai} value={nilai}>
            {LABEL_HUBUNGAN[nilai]}
          </option>
        ))}
      </select>
      {wali.is_kontak_utama ? null : (
        <DialogKonfirmasi
          pemicu={
            <Button variant="outline" size="sm">
              Jadikan Kontak Utama
            </Button>
          }
          judul={`Jadikan ${wali.nama} kontak utama?`}
          deskripsi={`Setiap murid punya tepat satu kontak utama. Kontak utama ${murid.nama_panggilan} pindah ke ${wali.nama}; reset password wali memakai tanggal lahir anak dari kontak utamanya.`}
          labelAksi="Jadikan Kontak Utama"
          onKonfirmasi={async () => {
            await ubah.mutateAsync({ waliId: wali.id, body: { is_kontak_utama: true } });
            toast.success(`${wali.nama} menjadi kontak utama.`);
          }}
        />
      )}
      <DialogKonfirmasi
        pemicu={
          <Button variant="ghost" size="sm">
            Lepas Tautan
          </Button>
        }
        judul={`Lepas tautan ${wali.nama}?`}
        deskripsi={`${wali.nama} tidak bisa lagi melihat data ${murid.nama_panggilan}. Akun walinya tidak dihapus.`}
        labelAksi="Lepas Tautan"
        berbahaya
        onKonfirmasi={async () => {
          await lepas.mutateAsync(wali.id);
          toast.success(`Tautan ${wali.nama} dilepas.`);
        }}
      />
    </div>
  );
}

/** Wali yang tertaut ke murid. Kepala Sekolah bisa mengubah hubungan, kontak utama, dan melepas tautan. */
export function WaliTertaut({ murid, bisaKelola }: { murid: MuridDetail; bisaKelola: boolean }) {
  if (murid.wali.length === 0) {
    return <EmptyState ringkas judul="Belum ada wali yang tertaut." deskripsi="Wali bisa menambahkan anak ini dari akunnya dengan NIS dan tanggal lahir." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {murid.wali.map((wali) => (
        <li key={wali.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {bisaKelola ? (
                <Link href={`/dashboard/wali-murid/${wali.id}`} className="font-bold hover:underline">
                  {wali.nama}
                </Link>
              ) : (
                <p className="font-bold">{wali.nama}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {LABEL_HUBUNGAN[wali.hubungan]}
                {wali.username ? (
                  <>
                    {" "}· username <span className="tabular-nums">{wali.username}</span>
                  </>
                ) : null}
              </p>
            </div>
            {wali.is_kontak_utama ? <StatusBadge nada="sukses">Kontak utama</StatusBadge> : null}
          </div>
          <p className="mt-2 text-sm">
            {wali.no_hp ? (
              <a href={`tel:${wali.no_hp}`} className="font-bold text-primary-strong tabular-nums hover:underline">
                {wali.no_hp}
              </a>
            ) : (
              <span className="text-muted-foreground">Nomor HP belum diisi</span>
            )}
          </p>
          {bisaKelola ? (
            <div className="mt-3">
              <AksiWali murid={murid} wali={wali} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
