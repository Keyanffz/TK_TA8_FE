import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TombolMasukProps = {
  sedangMemeriksa: boolean;
  sisaJeda: number;
  /** Cara masuk lain di halaman yang sama sedang diproses. */
  nonaktif?: boolean;
};

export function TombolMasuk({ sedangMemeriksa, sisaJeda, nonaktif = false }: TombolMasukProps) {
  let label = "Masuk";
  if (sisaJeda > 0) label = `Coba lagi dalam ${sisaJeda} detik`;
  else if (sedangMemeriksa) label = "Memeriksa...";

  return (
    <Button
      type="submit"
      size="lg"
      disabled={sedangMemeriksa || sisaJeda > 0 || nonaktif}
      // Tombol nonaktif bawaan memudar 50%, sedangkan hitungan mundur harus tetap terbaca.
      className={cn("tabular-nums", sisaJeda > 0 && "disabled:bg-primary-soft disabled:text-primary-strong disabled:opacity-100")}
    >
      {label}
    </Button>
  );
}
