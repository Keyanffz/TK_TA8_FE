"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const JEDA_KETIK_MS = 350;

type KolomCariProps = { nilai: string; onUbah: (nilai: string) => void; label: string; placeholder: string; className?: string };

/** Kotak cari untuk filter daftar; permintaan dikirim setelah pengguna berhenti mengetik sebentar. */
export function KolomCari({ nilai, onUbah, label, placeholder, className }: KolomCariProps) {
  const [ketikan, setKetikan] = useState(nilai);

  useEffect(() => {
    if (ketikan === nilai) return;
    const jeda = setTimeout(() => onUbah(ketikan.trim()), JEDA_KETIK_MS);
    return () => clearTimeout(jeda);
  }, [ketikan, nilai, onUbah]);

  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={ketikan}
        onChange={(event) => setKetikan(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
