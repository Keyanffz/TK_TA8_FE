"use client";

import { Download, Printer } from "lucide-react";
import { useState } from "react";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { ambilKartuAkun } from "@/lib/api/murid";
import { bukaBlobDiTabBaru, simpanBlob } from "@/lib/api/unduh";

/**
 * Kartu akun wali (PDF A6) berisi NIS sebagai username tanpa password. Backend
 * menolaknya kalau tidak ada akun wali aktif dengan username NIS itu; pesannya ditampilkan apa adanya.
 */
export function KartuAkunMurid({ muridId, nis }: { muridId: number; nis: string }) {
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState<"unduh" | "cetak" | null>(null);

  const jalankan = async (aksi: "unduh" | "cetak") => {
    setGalat(null);
    setMemproses(aksi);
    try {
      if (aksi === "unduh") simpanBlob(await ambilKartuAkun(muridId), `kartu-akun-${nis}.pdf`);
      else await bukaBlobDiTabBaru(() => ambilKartuAkun(muridId));
    } catch (error) {
      setGalat(pesanError(error));
    } finally {
      setMemproses(null);
    }
  };

  return (
    <section aria-labelledby="judul-kartu-akun" className="rounded-xl bg-highlight-soft p-5">
      <h2 id="judul-kartu-akun" className="font-heading text-lg font-extrabold">
        Kartu akun wali
      </h2>
      <p className="mt-1 text-sm">
        Berisi NIS <span className="font-bold tabular-nums">{nis}</span> sebagai username dan keterangan password awal (tanggal lahir
        anak). Berikan ke wali saat daftar ulang.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" disabled={memproses !== null} onClick={() => void jalankan("unduh")}>
          <Download aria-hidden="true" />
          {memproses === "unduh" ? "Menyiapkan..." : "Unduh Kartu Akun"}
        </Button>
        <Button variant="outline" disabled={memproses !== null} onClick={() => void jalankan("cetak")}>
          <Printer aria-hidden="true" />
          {memproses === "cetak" ? "Menyiapkan..." : "Cetak"}
        </Button>
      </div>
      {galat ? (
        <KotakPesan nada="bahaya" className="mt-4">
          {galat}
        </KotakPesan>
      ) : null}
    </section>
  );
}
