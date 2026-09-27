"use client";

import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ReactNode } from "react";

import { KartuKegiatan } from "@/components/features/kegiatan/kartu-kegiatan";
import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomCari } from "@/components/shared/kolom-cari";
import { Muncul } from "@/components/shared/muncul";
import { Paginasi } from "@/components/shared/paginasi";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarKegiatan } from "@/lib/api/kegiatan";
import { useKelasAktif } from "@/lib/api/kelas";
import { useAnakWali } from "@/lib/api/wali";
import { cn } from "@/lib/utils";

type DaftarProps = { kelasId: number | null; search: string; halaman: number; onUbahHalaman: (halaman: number) => void; kosong: ReactNode; tampilkanKelas: boolean };

function Daftar({ kelasId, search, halaman, onUbahHalaman, kosong, tampilkanKelas }: DaftarProps) {
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarKegiatan({ halaman, kelasId, search });

  if (isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Memuat kegiatan">
        {[0, 1, 2].map((kunci) => (
          <Skeleton key={kunci} className="h-80 rounded-lg" />
        ))}
      </div>
    );
  }
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.data.length === 0) return kosong;

  return (
    <>
      <Muncul as="ul" efek="jatuh" className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", isPlaceholderData && "opacity-60")}>
        {data.data.map((kegiatan, indeks) => (
          <li key={kegiatan.id}>
            <KartuKegiatan kegiatan={kegiatan} indeks={indeks} tampilkanKelas={tampilkanKelas} />
          </li>
        ))}
      </Muncul>
      <Paginasi meta={data.meta} onUbah={onUbahHalaman} label="Halaman kegiatan" />
    </>
  );
}

/** Feed kegiatan kelas anak aktif untuk wali (B4: hanya lihat). */
export function FeedKegiatanWali() {
  const { anakAktif } = useAnakAktif();
  const anak = useAnakWali(anakAktif !== null);
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));

  if (!anakAktif) return <EmptyState judul="Belum ada anak yang tertaut." deskripsi="Tambahkan anak dari menu Anak Saya." />;
  if (anak.isPending) return <Skeleton aria-label="Memuat kegiatan" className="h-80 rounded-lg" />;
  if (anak.isError) return <GalatMuat error={anak.error} onCobaLagi={() => void anak.refetch()} />;

  const kelas = anak.data.find((item) => item.id === anakAktif.id)?.kelas ?? null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {kelas ? (
          <>
            Kegiatan di kelas <span className="font-bold text-foreground">{kelas.nama}</span> bersama {anakAktif.nama_panggilan}.
          </>
        ) : (
          `${anakAktif.nama_panggilan} belum punya kelas di tahun ajaran ini. Kegiatan dari kelas sebelumnya tetap tampil di bawah.`
        )}
      </p>
      <Daftar
        key={anakAktif.id}
        kelasId={kelas?.id ?? null}
        search=""
        halaman={halaman}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        tampilkanKelas={kelas === null}
        kosong={<EmptyState judul="Belum ada kegiatan kelas." deskripsi="Foto dan cerita kegiatan dari guru kelas akan muncul di sini." />}
      />
    </div>
  );
}

/** Feed kegiatan untuk Kepala Sekolah (semua kelas) dan guru (kelas yang diampu), dengan saringan kelas. */
export function FeedKegiatanSekolah() {
  const kelas = useKelasAktif();
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const pilihanKelas = kelas.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {pilihanKelas.length > 1 ? (
          <select
            aria-label="Saring kelas"
            value={kelasId ?? ""}
            onChange={(event) => {
              void setKelasId(event.target.value ? Number(event.target.value) : null);
              void setHalaman(null);
            }}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="">Semua kelas</option>
            {pilihanKelas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>
        ) : null}
        <KolomCari
          nilai={cari}
          onUbah={(nilai) => {
            void setCari(nilai || null);
            void setHalaman(null);
          }}
          label="Cari kegiatan"
          placeholder="Cari judul atau tema"
          className="w-full sm:w-72"
        />
      </div>
      <Daftar
        kelasId={kelasId}
        search={cari}
        halaman={halaman}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        tampilkanKelas={kelasId === null && pilihanKelas.length !== 1}
        kosong={
          <EmptyState
            judul={cari ? `Tidak ada kegiatan yang cocok dengan "${cari}".` : "Belum ada kegiatan kelas."}
            deskripsi="Catat kegiatan beserta fotonya supaya wali murid bisa melihat apa yang dilakukan anak di sekolah."
            aksi={
              <Link href="/dashboard/kegiatan/baru" className={buttonVariants()}>
                Catat Kegiatan
              </Link>
            }
          />
        }
      />
    </div>
  );
}
