"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { FotoProfil } from "@/components/shared/foto-profil";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Pemilih anak aktif untuk wali (B3); pilihan disimpan di cookie tk_anak. */
export function AnakSwitcher() {
  const { anakAktif, daftarAnak, pilih } = useAnakAktif();
  if (!anakAktif) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex min-h-11 items-center gap-2 rounded-full bg-primary-foreground/15 py-1 pr-3 pl-1 font-heading text-sm font-bold transition-colors hover:bg-primary-foreground/25 lg:bg-primary-soft lg:text-primary-strong lg:hover:bg-primary-soft-strong">
        <FotoProfil nama={anakAktif.nama_panggilan} url={anakAktif.foto_url} ukuran={32} className="size-8 text-xs" />
        <span className="max-w-28 truncate">
          <span className="sr-only">Anak aktif: </span>
          {anakAktif.nama_panggilan}
        </span>
        <ChevronDown aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-muted-foreground">Tampilkan data anak</DropdownMenuLabel>
        {daftarAnak.map((anak) => (
          <DropdownMenuItem
            key={anak.id}
            onSelect={() => pilih(anak.id)}
          >
            <FotoProfil nama={anak.nama_panggilan} url={anak.foto_url} ukuran={32} className="size-8 text-xs" />
            <span className="flex-1">
              <span className="block font-bold">{anak.nama_panggilan}</span>
              <span className="block text-xs text-muted-foreground">{anak.kelas ?? "Belum ada kelas"}</span>
            </span>
            {anak.id === anakAktif.id ? <Check aria-label="Sedang ditampilkan" className="text-primary-strong" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/anak">
            <Plus aria-hidden="true" />
            Tautkan anak lain
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
