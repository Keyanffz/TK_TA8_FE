import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatGaleri() {
  return (
    <div aria-busy="true" aria-label="Memuat galeri">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-4 h-5 w-80 max-w-full" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 md:py-14 lg:grid-cols-3">
        {[0, 1, 2].map((kartu) => (
          <div key={kartu}>
            <Skeleton className="aspect-[4/3]" />
            <Skeleton className="mt-3 h-5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
