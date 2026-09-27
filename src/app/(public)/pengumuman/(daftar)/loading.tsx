import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatPengumuman() {
  return (
    <div aria-busy="true" aria-label="Memuat pengumuman">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-4 h-5 w-80 max-w-full" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        {[0, 1, 2].map((baris) => (
          <div key={baris}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-6 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
