import { fieldKurang } from "@/components/features/formulir-murid/label-field";
import { KotakPesan } from "@/components/shared/kotak-pesan";

type DataKurangProps = {
  /** `data_kurang` dari backend: field wajib formulir yang masih kosong. */
  field: readonly string[];
  judul?: string;
  /** Tiap isian menjadi tombol ke langkah tempat isiannya. */
  keLangkah?: (langkah: number) => void;
};

/** Daftar isian wajib yang belum diisi. Aturan wajibnya dari backend (`data_kurang`), FE hanya menampilkan. */
export function DataKurang({ field, judul = "Data belum lengkap", keLangkah }: DataKurangProps) {
  if (field.length === 0) return null;
  const daftar = [...new Map(field.map((nama) => [fieldKurang(nama).label, fieldKurang(nama)])).values()];

  return (
    <KotakPesan nada="menunggu" judul={judul}>
      <p>Isian wajib yang masih kosong:</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {daftar.map(({ label, langkah }) => (
          <li key={label}>
            {keLangkah ? (
              <button
                type="button"
                onClick={() => keLangkah(langkah)}
                className="min-h-9 rounded-full bg-card px-3 text-sm font-bold text-foreground underline-offset-2 hover:underline"
              >
                {label}
              </button>
            ) : (
              <span className="inline-flex min-h-8 items-center rounded-full bg-card px-3 text-sm font-bold text-foreground">{label}</span>
            )}
          </li>
        ))}
      </ul>
    </KotakPesan>
  );
}
