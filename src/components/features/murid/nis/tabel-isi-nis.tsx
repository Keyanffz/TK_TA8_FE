"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";

import { IdentitasMurid } from "@/components/features/murid/daftar-murid";
import { EmptyState } from "@/components/shared/empty-state";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { pesanError } from "@/lib/api/errors";
import { useDaftarMurid, usePratinjauNisTabel, useSimpanNisTabel, type IsianNis } from "@/lib/api/murid";
import { formatTanggal } from "@/lib/format";
import type { BarisNis, Murid, PratinjauNis } from "@/types/domain";

/** Maksimal per permintaan backend; satu halaman berisi semua murid yang bisa disimpan sekaligus. */
const MURID_PER_HALAMAN = 100;

type IsianNisProps = { murid: Murid; nilai: string; alasan: string[] | undefined; onUbah: (nilai: string) => void };

function IsianNisMurid({ murid, nilai, alasan, onUbah }: IsianNisProps) {
  const idAlasan = `alasan-nis-${murid.id}`;
  return (
    <div className="flex min-w-40 flex-col gap-1">
      <Input
        value={nilai}
        onChange={(event) => onUbah(event.target.value)}
        aria-label={`NIS ${murid.nama_lengkap}`}
        aria-invalid={alasan ? true : undefined}
        aria-describedby={alasan ? idAlasan : undefined}
        autoComplete="off"
        className="tabular-nums"
      />
      {alasan ? (
        <ul id={idAlasan} className="flex flex-col gap-0.5 text-sm text-status-bahaya">
          {alasan.map((isi) => (
            <li key={isi}>{isi}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Murid aktif yang menunggu NIS, dengan isian NIS per baris. Simpan Semua memeriksa dulu lewat pratinjau, meminta
 * konfirmasi jumlah akun wali yang dibuat, lalu menyimpan baris valid. Baris yang ditolak tetap berisi NIS yang
 * diketik beserta alasannya.
 */
export function TabelIsiNis() {
  const [halaman, setHalaman] = useState(1);
  const [isian, setIsian] = useState<Record<number, string>>({});
  const [alasan, setAlasan] = useState<Record<number, string[]>>({});
  const [konfirmasi, setKonfirmasi] = useState<PratinjauNis["ringkasan"] | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const daftar = useDaftarMurid({ search: "", halaman, kelasId: null, status: "aktif", tingkat: null, menungguNis: true, perHalaman: MURID_PER_HALAMAN });
  const pratinjau = usePratinjauNisTabel();
  const simpan = useSimpanNisTabel();
  const items: IsianNis[] = Object.entries(isian).flatMap(([id, nis]) => (nis.trim() ? [{ murid_id: Number(id), nis }] : []));

  const ubah = (muridId: number, nilai: string) => {
    setIsian({ ...isian, [muridId]: nilai });
    if (alasan[muridId]) setAlasan(Object.fromEntries(Object.entries(alasan).filter(([id]) => Number(id) !== muridId)));
  };

  const tandai = (baris: BarisNis[]) =>
    setAlasan(Object.fromEntries(baris.flatMap((item) => (!item.valid && item.murid_id !== null ? [[item.murid_id, item.alasan]] : []))));

  const periksa = () => {
    setGalat(null);
    pratinjau.mutate(items, {
      onSuccess: (data) => {
        tandai(data.baris);
        if (data.ringkasan.valid === 0) setGalat("Belum ada NIS yang bisa disimpan. Perbaiki baris yang ditandai.");
        else setKonfirmasi(data.ringkasan);
      },
      onError: (error) => setGalat(pesanError(error)),
    });
  };

  const simpanSemua = () => {
    simpan.mutate(items, {
      onSuccess: ({ data, message }) => {
        toast.success(message);
        tandai(data.gagal);
        const gagal = new Set(data.gagal.map((item) => item.murid_id));
        setIsian(Object.fromEntries(Object.entries(isian).filter(([id]) => gagal.has(Number(id)))));
        setKonfirmasi(null);
      },
      onError: (error) => {
        setKonfirmasi(null);
        setGalat(pesanError(error));
      },
    });
  };

  const kolom: ColumnDef<Murid>[] = [
    { id: "murid", header: "Murid", cell: ({ row }) => <IdentitasMurid murid={row.original} /> },
    { id: "kelas", header: "Kelas", cell: ({ row }) => row.original.kelas?.nama ?? <span className="text-muted-foreground">Belum ada</span> },
    { id: "lahir", header: "Tanggal lahir", cell: ({ row }) => formatTanggal(row.original.tanggal_lahir) },
    {
      id: "nis",
      header: "NIS",
      cell: ({ row }) => (
        <IsianNisMurid murid={row.original} nilai={isian[row.original.id] ?? ""} alasan={alasan[row.original.id]} onUbah={(nilai) => ubah(row.original.id, nilai)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length > 0 ? `${items.length} NIS diketik.` : "Ketik NIS di baris murid, lalu simpan sekaligus."} NIS boleh berisi huruf, angka, titik,
          strip, atau garis miring, maksimal 20 karakter.
        </p>
        <Button onClick={periksa} disabled={items.length === 0 || pratinjau.isPending || simpan.isPending}>
          {pratinjau.isPending ? "Memeriksa..." : "Simpan Semua"}
        </Button>
      </div>
      {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
      <TabelData
        label="Murid menunggu NIS"
        kolom={kolom}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(murid) => murid.id}
        onUbahHalaman={setHalaman}
        kelasKolom={{ nis: "w-64" }}
        kosong={<EmptyState judul="Semua murid sudah punya NIS." deskripsi="Murid baru dari tambah murid, import, atau PPDB yang diterima akan muncul di sini." />}
        kartu={(murid) => (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <IdentitasMurid murid={murid} />
              <p className="mt-1 text-xs text-muted-foreground">
                {murid.kelas?.nama ?? "Belum ada kelas"} · Lahir {formatTanggal(murid.tanggal_lahir)}
              </p>
            </div>
            <IsianNisMurid murid={murid} nilai={isian[murid.id] ?? ""} alasan={alasan[murid.id]} onUbah={(nilai) => ubah(murid.id, nilai)} />
          </div>
        )}
      />
      <Dialog
        open={konfirmasi !== null}
        onOpenChange={(buka) => {
          if (!buka) setKonfirmasi(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simpan {konfirmasi?.valid} NIS?</DialogTitle>
            <DialogDescription>
              {konfirmasi?.akun_wali} akun wali akan dibuat dengan username NIS dan password awal tanggal lahir anak.
              {konfirmasi && konfirmasi.invalid > 0 ? ` ${konfirmasi.invalid} baris bermasalah tidak ikut disimpan dan tetap ditandai di tabel.` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKonfirmasi(null)}>
              Batal
            </Button>
            <Button onClick={simpanSemua} disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : "Simpan NIS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
