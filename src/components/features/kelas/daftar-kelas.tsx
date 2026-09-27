"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { toast } from "sonner";

import { FormKelas } from "@/components/features/kelas/form-kelas";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Muncul } from "@/components/shared/muncul";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarKelas, useHapusKelas } from "@/lib/api/kelas";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { LABEL_TINGKAT } from "@/lib/constants/label";
import { cn } from "@/lib/utils";
import type { Kelas } from "@/types/domain";

function KartuKelas({ kelas, bisaKelola }: { kelas: Kelas; bisaKelola: boolean }) {
  const hapus = useHapusKelas();
  const persen = Math.min(100, Math.round((kelas.jumlah_murid / kelas.kapasitas) * 100));

  return (
    <div className="angkat flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/dashboard/kelas/${kelas.id}`} className="font-heading text-lg font-extrabold hover:underline">
            {kelas.nama}
          </Link>
          <p className="text-sm text-muted-foreground">{LABEL_TINGKAT[kelas.tingkat]}</p>
        </div>
        {bisaKelola ? (
          <div className="flex gap-1">
            <FormKelas
              kelas={kelas}
              tahunAjaranId={kelas.tahun_ajaran.id}
              pemicu={
                <Button variant="ghost" size="icon" aria-label={`Ubah ${kelas.nama}`}>
                  <Pencil aria-hidden="true" />
                </Button>
              }
            />
            <DialogKonfirmasi
              pemicu={
                <Button variant="ghost" size="icon" aria-label={`Hapus ${kelas.nama}`}>
                  <Trash2 aria-hidden="true" />
                </Button>
              }
              judul={`Hapus ${kelas.nama}?`}
              deskripsi="Kelas yang masih punya murid, kegiatan, atau rapor tidak bisa dihapus."
              labelAksi="Hapus Kelas"
              berbahaya
              onKonfirmasi={async () => {
                await hapus.mutateAsync(kelas.id);
                toast.success(`${kelas.nama} dihapus.`);
              }}
            />
          </div>
        ) : null}
      </div>
      <dl className="grid gap-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Wali kelas:</dt>
          <dd className="font-bold">{kelas.wali_kelas?.nama ?? "Belum ditentukan"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Pendamping:</dt>
          <dd className="font-bold">{kelas.guru_pendamping?.nama ?? "-"}</dd>
        </div>
      </dl>
      <div className="mt-auto">
        <div className="flex justify-between text-sm">
          <span>Murid</span>
          <span className="font-bold tabular-nums">
            {kelas.jumlah_murid} / {kelas.kapasitas}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-primary-soft">
          <div className={cn("h-full rounded-full", persen >= 100 ? "bg-highlight-strong" : "bg-primary")} style={{ width: `${persen}%` }} />
        </div>
      </div>
    </div>
  );
}

export function DaftarKelas({ bisaKelola }: { bisaKelola: boolean }) {
  const tahunAjaran = useDaftarTahunAjaran();
  const [taDipilih, setTaDipilih] = useQueryState("ta", parseAsInteger);
  const taAktif = tahunAjaran.data?.find((ta) => ta.is_aktif)?.id ?? null;
  const taId = taDipilih ?? taAktif;
  const kelas = useDaftarKelas(taId);

  return (
    <div className="flex flex-col gap-4">
      {bisaKelola ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tahun ajaran</span>
            <select
              value={taId ?? ""}
              onChange={(event) => void setTaDipilih(event.target.value ? Number(event.target.value) : null)}
              className="h-10 rounded-md border border-input bg-card px-3 font-bold"
            >
              {(tahunAjaran.data ?? []).map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama}
                  {ta.is_aktif ? " (aktif)" : ""}
                </option>
              ))}
            </select>
          </label>
          <FormKelas kelas={null} tahunAjaranId={taId} pemicu={<Button>Tambah Kelas</Button>} />
        </div>
      ) : null}
      {kelas.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((indeks) => (
            <Skeleton key={indeks} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : kelas.isError ? (
        <GalatMuat error={kelas.error} onCobaLagi={() => void kelas.refetch()} />
      ) : kelas.data.length === 0 ? (
        <EmptyState
          judul={bisaKelola ? "Belum ada kelas di tahun ajaran ini." : "Anda belum mengampu kelas di tahun ajaran aktif."}
          deskripsi={bisaKelola ? "Tambahkan kelas, lalu tempatkan murid dari halaman detail kelas." : "Kepala Sekolah yang menentukan wali kelas dan guru pendamping."}
        />
      ) : (
        <Muncul as="ul" efek="pop" className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", kelas.isPlaceholderData && "opacity-60")}>
          {kelas.data.map((item) => (
            <li key={item.id}>
              <KartuKelas kelas={item} bisaKelola={bisaKelola} />
            </li>
          ))}
        </Muncul>
      )}
    </div>
  );
}
