"use client";

import { Download } from "lucide-react";
import { parseAsInteger, parseAsNumberLiteral, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { DaftarAbsensiHarian } from "@/components/features/absensi/daftar-absensi-harian";
import { AksiKoreksiHarian } from "@/components/features/absensi/dialog-koreksi-absensi";
import { PilihBulan, useBulanDipilih } from "@/components/features/absensi/pilih-bulan";
import { RekapHarian } from "@/components/features/absensi/rekap-harian";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KELAS_KONTROL_SARINGAN } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { kelompokkanPerHari } from "@/lib/absensi";
import { ambilEksporRekapAbsensi, JUMLAH_BULAN_REKAP, useRekapAbsensi, useRiwayatAbsensi, type JumlahBulanRekap } from "@/lib/api/absensi";
import { pesanError } from "@/lib/api/errors";
import { simpanBlob } from "@/lib/api/unduh";
import { formatBulan } from "@/lib/format";
import { geserBulan } from "@/lib/tanggal";
import { cn } from "@/lib/utils";
import type { RekapAbsensi as BarisRekap } from "@/types/domain";

const KOLOM = [
  { kunci: "hadir", label: "Hadir" },
  { kunci: "terlambat", label: "Terlambat" },
  { kunci: "izin", label: "Izin" },
  { kunci: "sakit", label: "Sakit" },
  { kunci: "tidak_hadir", label: "Tidak hadir" },
  { kunci: "tidak_absen_pulang", label: "Tidak absen pulang" },
] as const;

function bulanAwal(bulan: string, jumlahBulan: JumlahBulanRekap): string {
  return geserBulan(bulan, 1 - jumlahBulan);
}

/** "Oktober 2026" atau "Agustus 2026 – Oktober 2026". */
function formatRentang(bulan: string, jumlahBulan: JumlahBulanRekap): string {
  return jumlahBulan === 1 ? formatBulan(bulan) : `${formatBulan(bulanAwal(bulan, jumlahBulan))} – ${formatBulan(bulan)}`;
}

function DetailPeserta({ peserta, bulan, jumlahBulan }: { peserta: BarisRekap["user"]; bulan: string; jumlahBulan: JumlahBulanRekap }) {
  const { data, isPending, isError, error, refetch } = useRiwayatAbsensi(bulan, peserta.id, { jumlahBulan });

  return (
    <section aria-labelledby="judul-detail-peserta" className="flex flex-col gap-3">
      <h2 id="judul-detail-peserta" className="text-lg font-extrabold">
        {peserta.nama}, {formatRentang(bulan, jumlahBulan)}
      </h2>
      {isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState ringkas judul="Belum ada absensi di rentang ini." />
      ) : (
        <DaftarAbsensiHarian
          hari={kelompokkanPerHari(data)}
          aksi={({ tanggal, masuk, pulang }) => (
            <AksiKoreksiHarian nama={peserta.nama} userId={peserta.id} tanggal={tanggal} masuk={masuk} pulang={pulang} bolehCatat />
          )}
        />
      )}
    </section>
  );
}

function KartuPeserta({ baris, dipilih, onPilih }: { baris: BarisRekap; dipilih: boolean; onPilih: () => void }) {
  return (
    <li className={cn("rounded-xl border bg-card p-4 shadow-sm", dipilih ? "border-primary" : "border-border")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-bold">{baris.user.nama}</h3>
          {baris.user.jabatan ? <p className="text-sm text-muted-foreground">{baris.user.jabatan}</p> : null}
        </div>
        <Button size="sm" variant={dipilih ? "secondary" : "outline"} aria-pressed={dipilih} onClick={onPilih}>
          {dipilih ? "Tutup Detail" : "Lihat per Hari"}
        </Button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {KOLOM.map(({ kunci, label }) => (
          <div key={kunci}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-heading text-lg font-extrabold tabular-nums">{baris[kunci]}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

/** Rekap 1 sampai 3 bulan per peserta, dengan detail per hari, koreksi, dan ekspor CSV. */
function RekapBulanan() {
  const { bulan, bulanIni, setBulan } = useBulanDipilih();
  const [jumlahBulan, setJumlahBulan] = useQueryState("rentang", parseAsNumberLiteral(JUMLAH_BULAN_REKAP).withDefault(1));
  const [pesertaId, setPesertaId] = useQueryState("peserta", parseAsInteger);
  const [mengunduh, setMengunduh] = useState(false);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useRekapAbsensi(bulan, jumlahBulan);
  const dipilih = data?.find((baris) => baris.user.id === pesertaId) ?? null;

  const unduh = async () => {
    setMengunduh(true);
    try {
      const namaBerkas = jumlahBulan === 1 ? `rekap-absensi-${bulan}.csv` : `rekap-absensi-${bulanAwal(bulan, jumlahBulan)}-sampai-${bulan}.csv`;
      simpanBlob(await ambilEksporRekapAbsensi(bulan, jumlahBulan), namaBerkas);
    } catch (galat) {
      toast.error(pesanError(galat));
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PilihBulan bulan={bulan} bulanIni={bulanIni} onUbah={setBulan} />
          <select
            aria-label="Rentang rekap"
            className={KELAS_KONTROL_SARINGAN}
            value={jumlahBulan}
            onChange={(event) => void setJumlahBulan(JUMLAH_BULAN_REKAP.find((jumlah) => jumlah === Number(event.target.value)) ?? 1)}
          >
            {JUMLAH_BULAN_REKAP.map((jumlah) => (
              <option key={jumlah} value={jumlah}>
                {jumlah} bulan
              </option>
            ))}
          </select>
          {/* Pemilih bulan hanya menunjukkan bulan akhir, jadi rentang lengkapnya ditulis supaya jumlah di kartu tidak dikira satu bulan. */}
          {jumlahBulan > 1 ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {formatRentang(bulan, jumlahBulan)}
            </p>
          ) : null}
        </div>
        <Button variant="outline" disabled={mengunduh || !data || data.length === 0} onClick={() => void unduh()}>
          <Download aria-hidden="true" />
          {mengunduh ? "Menyiapkan..." : "Unduh CSV"}
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState judul="Belum ada guru aktif." deskripsi="Rekap terisi setelah guru ditambahkan di menu Guru." />
      ) : (
        <div className={cn("grid gap-6 lg:grid-cols-2 lg:items-start", isPlaceholderData && "opacity-60")}>
          <ul className="flex flex-col gap-3">
            {data.map((baris) => (
              <KartuPeserta
                key={baris.user.id}
                baris={baris}
                dipilih={baris.user.id === pesertaId}
                onPilih={() => void setPesertaId(baris.user.id === pesertaId ? null : baris.user.id)}
              />
            ))}
          </ul>
          {dipilih ? (
            <DetailPeserta peserta={dipilih.user} bulan={bulan} jumlahBulan={jumlahBulan} />
          ) : (
            <p className="rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground">
              Tekan Lihat per Hari pada salah satu nama untuk melihat jam dan foto, mengoreksi status, atau mencatat absen yang terlupa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const TAB = ["harian", "bulanan"] as const;

/** Rekap absensi untuk Kepala Sekolah: Harian untuk mengecek satu tanggal, Bulanan untuk jumlah per peserta. */
export function RekapAbsensi() {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("harian"));

  return (
    <Tabs value={tab} onValueChange={(nilai) => void setTab(nilai === "bulanan" ? "bulanan" : null)} className="gap-5">
      <TabsList aria-label="Jenis rekap">
        <TabsTrigger value="harian" className="px-4">
          Harian
        </TabsTrigger>
        <TabsTrigger value="bulanan" className="px-4">
          Bulanan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="harian">
        <RekapHarian />
      </TabsContent>
      <TabsContent value="bulanan">
        <RekapBulanan />
      </TabsContent>
    </Tabs>
  );
}
