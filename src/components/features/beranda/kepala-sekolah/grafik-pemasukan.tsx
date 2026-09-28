"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";

import { formatRupiah } from "@/lib/format";

type TitikPemasukan = { bulan: string; total: number };

const bulanPendek = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" });
const bulanPanjang = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
const jutaan = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

function keTanggal(bulan: string): Date {
  return new Date(`${bulan}-01T00:00:00Z`);
}

/** Label sumbu Y ringkas: "Rp 15 jt". */
function rupiahRingkas(nilai: number): string {
  if (nilai === 0) return "Rp 0";
  if (nilai >= 1_000_000) return `Rp ${jutaan.format(nilai / 1_000_000)} jt`;
  return `Rp ${jutaan.format(nilai / 1_000)} rb`;
}

function IsiTooltip({ active, payload }: TooltipContentProps) {
  const titik = payload?.[0]?.payload as TitikPemasukan | undefined;
  if (!active || !titik) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{bulanPanjang.format(keTanggal(titik.bulan))}</p>
      <p className="font-bold tabular-nums">{formatRupiah(titik.total)}</p>
    </div>
  );
}

/**
 * Pemasukan 12 bulan (satu seri, jadi tanpa legenda; judul panel yang
 * menamainya). Tabel yang sama tersedia untuk pembaca layar.
 */
export function GrafikPemasukan({ data }: { data: TitikPemasukan[] }) {
  return (
    <figure>
      {/* Datanya dibacakan dari tabel; accessibilityLayer mematikan tabIndex dan role="application" bawaan Recharts. */}
      <div className="h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer={false} data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={4}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="bulan"
              tickFormatter={(bulan: string) => bulanPendek.format(keTanggal(bulan))}
              tickLine={false}
              axisLine={{ stroke: "var(--input)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={rupiahRingkas}
              tickLine={false}
              axisLine={false}
              width={76}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip content={IsiTooltip} cursor={{ fill: "var(--primary-soft)" }} />
            <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Pemasukan per bulan</caption>
        <thead>
          <tr>
            <th scope="col">Bulan</th>
            <th scope="col">Pemasukan</th>
          </tr>
        </thead>
        <tbody>
          {data.map((titik) => (
            <tr key={titik.bulan}>
              <td>{bulanPanjang.format(keTanggal(titik.bulan))}</td>
              <td>{formatRupiah(titik.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
