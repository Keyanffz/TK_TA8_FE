import { cn } from "@/lib/utils";

function inisial(nama: string): string {
  const kata = nama
    .replace(/,.*$/, "")
    .split(/\s+/)
    .filter(Boolean);
  return kata
    .slice(0, 2)
    .map((bagian) => bagian[0]?.toUpperCase() ?? "")
    .join("");
}

/** Pengganti foto orang yang belum diunggah: inisial nama di blok hijau muda. */
export function AvatarInisial({ nama, className }: { nama: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center bg-primary-soft font-heading font-semibold text-primary-strong",
        className,
      )}
    >
      {inisial(nama)}
    </div>
  );
}
