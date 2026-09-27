"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { pilihAnakAktif, type AnakRingkas } from "@/lib/auth/anak-aktif";
import { ANAK_COOKIE, tulisCookiePreferensi } from "@/lib/auth/cookies";
import { useSession } from "@/lib/auth/use-session";

type NilaiAnakAktif = { idTerpilih: number | null; pilih: (id: number) => void };

const KonteksAnakAktif = createContext<NilaiAnakAktif | null>(null);

export function AnakAktifProvider({ awal, children }: { awal: number | null; children: ReactNode }) {
  const [idTerpilih, setIdTerpilih] = useState(awal);

  const pilih = (id: number) => {
    tulisCookiePreferensi(ANAK_COOKIE, String(id));
    setIdTerpilih(id);
  };

  return <KonteksAnakAktif.Provider value={{ idTerpilih, pilih }}>{children}</KonteksAnakAktif.Provider>;
}

/** Anak yang sedang ditampilkan untuk wali (B3), beserta daftar anak tertaut dari sesi. */
export function useAnakAktif(): { anakAktif: AnakRingkas | null; daftarAnak: AnakRingkas[]; pilih: (id: number) => void } {
  const konteks = useContext(KonteksAnakAktif);
  const { user } = useSession();
  if (!konteks) throw new Error("useAnakAktif harus dipakai di dalam AnakAktifProvider.");
  const daftarAnak = user?.wali_murid?.anak ?? [];
  return {
    anakAktif: pilihAnakAktif(daftarAnak, konteks.idTerpilih === null ? undefined : String(konteks.idTerpilih)),
    daftarAnak,
    pilih: konteks.pilih,
  };
}
