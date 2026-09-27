"use client";

import { FileSpreadsheet } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { bulanPanjang, GrafikTagihanBulanan, keTanggalBulan } from "@/components/features/laporan/grafik-tagihan-bulanan";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pesanError } from "@/lib/api/errors";
import { useDaftarKelas } from "@/lib/api/kelas";
import { ambilEksporLaporan, useLaporanKeuangan } from "@/lib/api/laporan";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { simpanBlob } from "@/lib/api/unduh";
import { formatRupiah } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";
import { cn } from "@/lib/utils";

function BatangPersen({ persen }: { persen: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, persen)}%` }} />
      </div>
      <span className="tabular-nums">{persen}%</span>
    </div>
  );
}

function Angka({ label, nilai, keterangan, tegas = false }: { label: string; nilai: string; keterangan?: string; tegas?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", tegas ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
      <p className={cn("text-sm", tegas ? "text-primary-foreground/90" : "text-muted-foreground")}>{label}</p>
      <p className="font-heading text-xl font-extrabold tabular-nums">{nilai}</p>
      {keterangan ? <p className={cn("mt-1 text-xs", tegas ? "text-primary-foreground/90" : "text-muted-foreground")}>{keterangan}</p> : null}
    </div>
  );
}

export function LaporanKeuangan() {
  const tahunAjaran = useDaftarTahunAjaran();
  const aktif = tahunAjaran.data?.find((ta) => ta.is_aktif);
  const [dariDipilih, setDari] = useQueryState("dari", parseAsString);
  const [sampaiDipilih, setSampai] = useQueryState("sampai", parseAsString);
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [mengunduh, setMengunduh] = useState(false);
  // Bawaan: awal tahun ajaran aktif sampai hari ini.
  const dari = dariDipilih ?? aktif?.tanggal_mulai ?? "";
  const sampai = sampaiDipilih ?? hariIniJakarta();
  const kelas = useDaftarKelas(null);
  const laporan = useLaporanKeuangan({ dari, sampai, kelasId });
  const rentangSalah = dari !== "" && sampai !== "" && dari > sampai;

  const unduh = async () => {
    setMengunduh(true);
    try {
      simpanBlob(await ambilEksporLaporan({ dari, sampai, kelasId }), `laporan-keuangan-${dari}-sd-${sampai}.xlsx`);
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <KolomTeks label="Dari" type="date" value={dari} onChange={(e) => void setDari(e.target.value || null)} />
        <KolomTeks label="Sampai" type="date" value={sampai} onChange={(e) => void setSampai(e.target.value || null)} error={rentangSalah ? "Tanggal akhir sebelum tanggal awal." : undefined} />
        <KolomPilih label="Kelas" value={kelasId ?? ""} onChange={(e) => void setKelasId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Semua kelas</option>
          {(kelas.data ?? [])
            .filter((item) => item.tahun_ajaran.is_aktif)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
        </KolomPilih>
        <Button variant="outline" size="lg" className="lg:mt-7" disabled={mengunduh || !laporan.data} onClick={() => void unduh()}>
          <FileSpreadsheet aria-hidden="true" />
          {mengunduh ? "Menyiapkan..." : "Unduh Excel"}
        </Button>
      </div>

      {laporan.isPending ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : laporan.isError ? (
        <GalatMuat error={laporan.error} onCobaLagi={() => void laporan.refetch()} />
      ) : (
        <div className={cn("flex flex-col gap-6", laporan.isPlaceholderData && "opacity-60")}>
          <section aria-label="Ringkasan" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Angka tegas label="Pemasukan" nilai={formatRupiah(laporan.data.ringkasan.pemasukan)} keterangan="Pembayaran diterima dalam rentang tanggal ini." />
            <Angka label="Total tagihan" nilai={formatRupiah(laporan.data.ringkasan.total_tagihan)} keterangan={`${laporan.data.ringkasan.jumlah_tagihan} tagihan jatuh tempo di rentang ini.`} />
            <Angka label="Terbayar" nilai={formatRupiah(laporan.data.ringkasan.terbayar)} keterangan={`${laporan.data.ringkasan.persen_lunas}% lunas`} />
            <Angka label="Belum terbayar" nilai={formatRupiah(laporan.data.ringkasan.belum_terbayar)} />
          </section>

          {laporan.data.per_bulan.length === 0 ? (
            <EmptyState judul="Tidak ada tagihan di rentang tanggal ini." deskripsi="Coba perlebar rentang tanggal atau pilih kelas lain." />
          ) : (
            <>
              <section aria-labelledby="judul-per-bulan" className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 id="judul-per-bulan" className="mb-4 text-lg font-extrabold">
                  Tagihan per bulan
                </h2>
                <GrafikTagihanBulanan data={laporan.data.per_bulan} />
                <Table className="mt-4" aria-label="Tagihan per bulan">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Bulan</TableHead>
                      <TableHead className="text-right">Total tagihan</TableHead>
                      <TableHead className="text-right">Terbayar</TableHead>
                      <TableHead className="text-right">Belum</TableHead>
                      <TableHead>Lunas</TableHead>
                      <TableHead className="text-right">Pemasukan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporan.data.per_bulan.map((baris) => (
                      <TableRow key={baris.bulan}>
                        <TableCell className="font-bold">{bulanPanjang.format(keTanggalBulan(baris.bulan))}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(baris.total_tagihan)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(baris.terbayar)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(baris.belum_terbayar)}</TableCell>
                        <TableCell>
                          <BatangPersen persen={baris.persen_lunas} />
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">{formatRupiah(baris.pemasukan)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
              <section aria-labelledby="judul-per-jenis" className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 id="judul-per-jenis" className="mb-4 text-lg font-extrabold">
                  Per jenis tagihan
                </h2>
                <Table aria-label="Per jenis tagihan">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Tagihan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Terbayar</TableHead>
                      <TableHead className="text-right">Belum</TableHead>
                      <TableHead>Lunas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporan.data.per_jenis.map((baris) => (
                      <TableRow key={baris.jenis_tagihan.id}>
                        <TableCell className="font-bold">{baris.jenis_tagihan.nama}</TableCell>
                        <TableCell className="text-right tabular-nums">{baris.jumlah_tagihan}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(baris.total_tagihan)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(baris.terbayar)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(baris.belum_terbayar)}</TableCell>
                        <TableCell>
                          <BatangPersen persen={baris.persen_lunas} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
