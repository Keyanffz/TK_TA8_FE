import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TombolMasuk({ sedangMemeriksa, sisaJeda }: { sedangMemeriksa: boolean; sisaJeda: number }) {
  let label = "Masuk";
  if (sisaJeda > 0) label = `Coba lagi dalam ${sisaJeda} detik`;
  else if (sedangMemeriksa) label = "Memeriksa...";

  return (
    <Button
      type="submit"
      size="lg"
      disabled={sedangMemeriksa || sisaJeda > 0}
      // Tombol nonaktif bawaan memudar 50%, sedangkan hitungan mundur harus tetap terbaca.
      className={cn("tabular-nums", sisaJeda > 0 && "disabled:bg-primary-soft disabled:text-primary-strong disabled:opacity-100")}
    >
      {label}
    </Button>
  );
}
