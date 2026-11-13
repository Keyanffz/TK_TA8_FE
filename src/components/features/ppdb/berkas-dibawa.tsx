import { cn } from "@/lib/utils";

const BERKAS_PPDB = ["Akta kelahiran anak", "Kartu Keluarga", "Pas foto anak"] as const;

/** Berkas PPDB tidak diunggah; pendaftar membawanya ke sekolah (A2.3). */
export function BerkasDibawa({ className }: { className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="font-heading font-bold">Berkas yang dibawa ke sekolah</h3>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {BERKAS_PPDB.map((berkas) => (
          <li key={berkas}>{berkas}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-muted-foreground">Berkas tidak diunggah lewat formulir. Sekolah memeriksanya saat berkas dibawa.</p>
    </section>
  );
}
