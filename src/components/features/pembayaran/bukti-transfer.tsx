"use client";

import { ZoomIn } from "lucide-react";
import Image from "next/image";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Pratinjau bukti transfer (signed URL); klik untuk memperbesar. */
export function BuktiTransfer({ url, label, className }: { url: string; label: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Perbesar ${label}`}
          className={cn("group relative block overflow-hidden rounded-lg border border-border bg-muted", className)}
        >
          <Image src={url} alt={label} fill unoptimized className="object-contain" />
          <span className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm transition-transform duration-200 group-hover:scale-110">
            <ZoomIn aria-hidden="true" className="size-4" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] sm:max-w-3xl">
        <DialogTitle>{label}</DialogTitle>
        <div className="relative h-[75dvh] w-full">
          <Image src={url} alt={label} fill unoptimized className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
