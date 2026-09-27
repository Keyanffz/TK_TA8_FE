"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { DaftarMenu } from "@/components/layout/dashboard/daftar-menu";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** Menu Kepala Sekolah dan guru di HP: sidebar hijau yang sama, sebagai sheet. */
export function MenuHp({ namaSekolah }: { namaSekolah: string }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger
        aria-label="Buka menu"
        className="flex size-11 items-center justify-center rounded-full hover:bg-primary-foreground/15 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-6" />
      </SheetTrigger>
      <SheetContent side="left" className="isolate overflow-y-auto border-0 bg-primary text-primary-foreground">
        <PolaGeometri className="-z-10 text-primary-foreground/[0.06]" />
        <SheetHeader>
          <SheetTitle className="font-heading text-lg font-extrabold text-primary-foreground">{namaSekolah}</SheetTitle>
          <SheetDescription className="sr-only">Menu dashboard</SheetDescription>
        </SheetHeader>
        <div className="px-3 pb-6">
          <DaftarMenu onPilih={() => setTerbuka(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
