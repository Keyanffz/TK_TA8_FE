import { Paperclip } from "lucide-react";

import { cn } from "@/lib/utils";

/** Penanda di daftar pengumuman (feed, beranda, website) untuk pengumuman yang punya lampiran. */
export function PenandaLampiran({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Paperclip aria-hidden="true" className="size-3.5" />
      Lampiran
    </span>
  );
}
