"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";

import { formatRupiah } from "@/lib/format";
import type { LaporanKeuangan } from "@/types/domain";

type Bulan = LaporanKeuangan["per_bulan"][number];

const SERI = [
  { kunci: "terbayar", label: "Terbayar", warna: "var(--grafik-terbayar)" },
  { kunci: "belum_terbayar", label: "Belum terbayar", warna: "var(--grafik-belum)" },
] as const;

const bulanPendek = new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "UTC" });
export const bulanPanjang = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
const angkaRingkas = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function keTanggalBulan(bulan: string): Date {
  return new Date(`${bulan}-01T00:00:00Z`);
}

function rupiahRingkas(nilai: number): string {
  if (nilai === 0) return "Rp 0";
  if (nilai >= 1_000_000) return `Rp ${angkaRingkas.format(nilai / 1_000_000)} jt`;
  return `Rp ${angkaRingkas.format(nilai / 1_000)} rb`;
}

function IsiTooltip({ active, payload, data }: TooltipContentProps & { data: readonly Bulan[] }) {
  const bulan = typeof payload?.[0]?.payload?.bulan === "string" ? payload[0].payload.bulan : null;
  const titik = data.find((item) => item.bulan === bulan);
  if (!active || !titik) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-bold">{bulanPanjang.format(keTanggalBulan(titik.bulan))}</p>
      {SERI.map((seri) => (
        <p key={seri.kunci} className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: seri.warna }} />
          <span className="text-muted-foreground">{seri.label}</span>
          <span className="ml-auto font-bold tabular-nums">{formatRupiah(titik[seri.kunci])}</span>
        </p>
      ))}
      <p className="mt-1 text-muted-foreground">{titik.persen_lunas}% lunas</p>
    </div>
  );
}

/**
 * Tagihan per bulan: batang bertumpuk terbayar + belum terbayar (jumlahnya =
 * total tagihan). Tabel per bulan di bawahnya menjadi versi yang bisa dibaca tanpa warna.
 */
export function GrafikTagihanBulanan({ data }: { data: readonly Bulan[] }) {
  return (
    <figure>
      <ul aria-label="Legenda" className="mb-3 flex flex-wrap gap-4 text-sm">
        {SERI.map((seri) => (
          <li key={seri.kunci} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ background: seri.warna }} />
            {seri.label}
          </li>
        ))}
      </ul>
      {/* Datanya ada di tabel per bulan; accessibilityLayer mematikan tabIndex dan role="application" bawaan Recharts. */}
      <div className="h-72" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer={false} data={[...data]} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="bulan"
              tickFormatter={(bulan: string) => bulanPendek.format(keTanggalBulan(bulan))}
              tickLine={false}
              axisLine={{ stroke: "var(--input)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tickFormatter={rupiahRingkas} tickLine={false} axisLine={false} width={76} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip content={(props) => <IsiTooltip {...props} data={data} />} cursor={{ fill: "var(--primary-soft)" }} />
            {SERI.map((seri, indeks) => (
              <Bar
                key={seri.kunci}
                dataKey={seri.kunci}
                stackId="tagihan"
                fill={seri.warna}
                stroke="var(--card)"
                strokeWidth={2}
                radius={indeks === SERI.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={40}
                animationDuration={700}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
