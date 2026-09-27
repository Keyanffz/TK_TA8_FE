import { cn } from "@/lib/utils";

/**
 * Tepi bawah blok berwarna berbentuk lengkung berderet seperti tepi perisai
 * logo. Warna isian mengikuti currentColor (warna blok berikutnya).
 */
export function TepiBergelombang({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block h-6 w-full md:h-10", className)}
    >
      <path
        fill="currentColor"
        d="M0 40 V22 Q 50 -4 100 22 T 200 22 T 300 22 T 400 22 T 500 22 T 600 22 T 700 22 T 800 22 T 900 22 T 1000 22 T 1100 22 T 1200 22 V40 Z"
      />
    </svg>
  );
}
