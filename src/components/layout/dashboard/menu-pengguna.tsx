"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { useKeluar } from "@/components/features/auth/use-keluar";
import { FotoProfil } from "@/components/shared/foto-profil";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LABEL_ROLE } from "@/lib/constants/label";
import { useSession } from "@/lib/auth/use-session";

export function MenuPengguna() {
  const { user, beranda } = useSession();
  const keluar = useKeluar();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu akun ${user.name}`}
        className="rounded-full ring-2 ring-primary-foreground/60 transition-transform duration-150 hover:scale-105 lg:ring-primary-soft-strong"
      >
        <FotoProfil nama={user.name} url={user.avatar_url} ukuran={40} className="size-10 text-sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-bold">{user.name}</p>
          <p className="text-muted-foreground">{LABEL_ROLE[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`${beranda}/profil`}>
            <UserRound aria-hidden="true" />
            Profil Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={keluar.isPending} onSelect={() => keluar.mutate()}>
          <LogOut aria-hidden="true" />
          {keluar.isPending ? "Keluar..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
