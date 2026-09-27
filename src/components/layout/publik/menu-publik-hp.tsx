"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { TAUTAN_PUBLIK } from "@/components/layout/publik/tautan-publik";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MenuPublikHp({ namaSekolah }: { namaSekolah: string }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{namaSekolah}</SheetTitle>
          <SheetDescription className="sr-only">Menu navigasi halaman publik</SheetDescription>
        </SheetHeader>
        <nav aria-label="Menu utama" className="flex flex-col px-2">
          {TAUTAN_PUBLIK.map((tautan) => (
            <Link
              key={tautan.href}
              href={tautan.href}
              onClick={() => setTerbuka(false)}
              className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted"
            >
              {tautan.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
