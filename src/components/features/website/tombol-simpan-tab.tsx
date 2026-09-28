import { Button } from "@/components/ui/button";

/** Baris simpan di bawah tiap tab CMS/pengaturan, dengan penanda perubahan yang belum disimpan. */
export function TombolSimpanTab({ kotor, menyimpan, label }: { kotor: boolean; menyimpan: boolean; label: string }) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-md">
      <p className={kotor ? "text-sm font-bold text-status-menunggu" : "text-sm text-muted-foreground"}>
        {kotor ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}
      </p>
      <Button type="submit" disabled={!kotor || menyimpan}>
        {menyimpan ? "Menyimpan..." : label}
      </Button>
    </div>
  );
}
