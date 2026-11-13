import Link from "next/link";

import { AngkaNaik } from "@/components/shared/angka-naik";
import type { DashboardKepalaSekolah } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

const ISI = [
  { kunci: "murid_aktif", label: "Murid aktif", href: "/mudarris/murid" },
  { kunci: "guru_aktif", label: "Guru aktif", href: "/mudarris/guru" },
  { kunci: "kelas", label: "Kelas", href: "/mudarris/kelas" },
  { kunci: "wali_murid", label: "Wali murid", href: "/mudarris/wali-murid" },
] as const;

// Garis pemisah antarsel: kotak 2 × 2 di HP, satu baris empat sel di layar lebar.
const GARIS = ["", "border-l", "border-t lg:border-t-0 lg:border-l", "border-l border-t lg:border-t-0"];

/**
 * Angka sekolah dalam satu kartu, tiap angka menaut ke daftarnya. Satu kartu, bukan empat kartu berikon yang sama,
 * supaya panel Perlu Tindakan di atasnya tetap yang paling menonjol.
 */
export function RingkasanSekolah({ statistik }: { statistik: DashboardKepalaSekolah["statistik"] }) {
  return (
    <ul aria-label="Ringkasan sekolah" className="gerak-masuk grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-4">
      {ISI.map(({ kunci, label, href }, urutan) => (
        <li key={kunci} className={cn("border-border", GARIS[urutan])}>
          <Link href={href} className="block min-h-11 px-4 py-3 transition-colors duration-150 hover:bg-muted focus-visible:bg-muted">
            <span className="block text-sm text-muted-foreground">{label}</span>
            <AngkaNaik nilai={statistik[kunci]} className="font-heading text-2xl leading-tight font-extrabold" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
