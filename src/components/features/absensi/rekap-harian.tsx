"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { KartuAbsensiHarian } from "@/components/features/absensi/daftar-absensi-harian";
import { AksiKoreksiHarian } from "@/components/features/absensi/dialog-koreksi-absensi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbsensiHarian } from "@/lib/api/absensi";
import { formatHariTanggal, formatTanggal } from "@/lib/format";
import { geserHari, hariIniJakarta } from "@/lib/tanggal";
import { cn } from "@/lib/utils";
import type { AbsensiPerTanggal } from "@/types/domain";

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

/** Tanggal dari `?tanggal=YYYY-MM-DD`, bawaan hari ini; tanggal yang belum datang tidak bisa dipilih. */
function useTanggalDipilih(): { tanggal: string; hariIni: string; setTanggal: (tanggal: string) => void } {
  const [tanggalUrl, setTanggalUrl] = useQueryState("tanggal", parseAsString);
  const hariIni = hariIniJakarta();
  const tanggal = tanggalUrl && POLA_TANGGAL.test(tanggalUrl) && tanggalUrl <= hariIni ? tanggalUrl : hariIni;
  return { tanggal, hariIni, setTanggal: (tujuan) => void setTanggalUrl(tujuan === hariIni ? null : tujuan) };
}

function PilihTanggal({ tanggal, hariIni, onUbah }: { tanggal: string; hariIni: string; onUbah: (tanggal: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" aria-label="Hari sebelumnya" onClick={() => onUbah(geserHari(tanggal, -1))}>
        <ChevronLeft aria-hidden="true" />
      </Button>
      <Input
        type="date"
        aria-label="Tanggal"
        className="w-auto"
        value={tanggal}
        max={hariIni}
        onChange={(event) => {
          if (POLA_TANGGAL.test(event.target.value)) onUbah(event.target.value);
        }}
      />
      <Button variant="outline" size="icon" aria-label="Hari berikutnya" disabled={tanggal >= hariIni} onClick={() => onUbah(geserHari(tanggal, 1))}>
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}

function keteranganTanpaAbsen(data: AbsensiPerTanggal): string | null {
  if (data.tanggal_libur) return "Tanggal ini libur sekolah, jadi tidak ada absensi.";
  if (!data.hari_kerja) return "Tanggal ini bukan hari kerja, jadi tidak ada absensi.";
  if (data.tanggal_mulai !== null && data.tanggal < data.tanggal_mulai) return `Absensi baru berlaku mulai ${formatTanggal(data.tanggal_mulai)}.`;
  return null;
}

function Ringkasan({ peserta }: { peserta: AbsensiPerTanggal["peserta"] }) {
  const jumlah = [
    { label: "Hadir", nilai: peserta.filter(({ masuk }) => masuk?.status === "hadir").length },
    { label: "Terlambat", nilai: peserta.filter(({ masuk }) => masuk?.status === "terlambat").length },
    { label: "Izin", nilai: peserta.filter(({ masuk }) => masuk?.status === "izin").length },
    { label: "Sakit", nilai: peserta.filter(({ masuk }) => masuk?.status === "sakit").length },
    { label: "Tidak hadir", nilai: peserta.filter(({ masuk }) => masuk?.status === "tidak_hadir").length },
    { label: "Belum absen", nilai: peserta.filter(({ masuk }) => masuk === null).length },
    {
      label: "Belum absen pulang",
      nilai: peserta.filter(({ masuk, pulang }) => (masuk?.status === "hadir" || masuk?.status === "terlambat") && pulang === null).length,
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {jumlah.map(({ label, nilai }) => (
        <div key={label} className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="font-heading text-lg font-extrabold tabular-nums">{nilai}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Absensi semua guru dan Kepala Sekolah di satu tanggal, untuk dicek dan dikoreksi Kepala Sekolah. */
export function RekapHarian() {
  const { tanggal, hariIni, setTanggal } = useTanggalDipilih();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAbsensiHarian(tanggal);

  const keterangan = data ? keteranganTanpaAbsen(data) : null;
  // Di luar hari absensi hanya peserta yang ternyata punya baris absensi yang ditampilkan.
  const peserta = data ? (keterangan ? data.peserta.filter(({ masuk, pulang }) => masuk || pulang) : data.peserta) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PilihTanggal tanggal={tanggal} hariIni={hariIni} onUbah={setTanggal} />
        <p aria-live="polite" className="font-heading font-bold">
          {formatHariTanggal(tanggal)}
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : (
        <div className={cn("flex flex-col gap-4", isPlaceholderData && "opacity-60")}>
          {keterangan ? <KotakPesan nada="proses">{keterangan}</KotakPesan> : <Ringkasan peserta={data.peserta} />}
          {data.peserta.length === 0 ? (
            <EmptyState judul="Belum ada guru aktif." deskripsi="Daftar ini terisi setelah guru ditambahkan di menu Guru." />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {peserta.map(({ user, masuk, pulang }) => (
                <KartuAbsensiHarian
                  key={user.id}
                  judul={user.nama}
                  keterangan={user.jabatan}
                  masuk={masuk}
                  pulang={pulang}
                  labelTanpaMasuk={keterangan ? undefined : "Belum absen"}
                  aksi={<AksiKoreksiHarian nama={user.nama} userId={user.id} tanggal={data.tanggal} masuk={masuk} pulang={pulang} bolehCatat={!keterangan} />}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
