"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { KenaikanPerKelas } from "@/components/features/tahun-ajaran/kenaikan-per-kelas";
import { penempatanLengkap, saranPenempatan, type Penempatan } from "@/components/features/tahun-ajaran/penempatan-kenaikan";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomPilih } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarKelas, useDetailBanyakKelas, useKenaikanKelas } from "@/lib/api/kelas";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import type { KelasDetail } from "@/types/domain";

type Hasil = { naik: number; tinggal: number; lulus: number };

/**
 * Kenaikan kelas massal (`POST /kelas/kenaikan`): murid aktif di kelas tahun
 * ajaran aktif diberi status naik/tinggal/lulus dan kelas tujuan di tahun ajaran tujuan.
 * Asal tidak bisa dipilih karena backend selalu memakai tahun ajaran aktif.
 */
export function WizardKenaikan() {
  const tahunAjaran = useDaftarTahunAjaran();
  const aktif = tahunAjaran.data?.find((ta) => ta.is_aktif) ?? null;
  const [tujuanId, setTujuanId] = useState<number | null>(null);
  const [ubahan, setUbahan] = useState<ReadonlyMap<number, Penempatan>>(new Map());
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const kenaikan = useKenaikanKelas();

  const asal = aktif?.id ?? null;
  const kelasAsal = useDaftarKelas(asal);
  const kelasTujuan = useDaftarKelas(tujuanId);
  const detail = useDetailBanyakKelas(asal !== null ? (kelasAsal.data ?? []).map((kelas) => kelas.id) : []);
  const detailKelas = detail.map((query) => query.data).filter((kelas): kelas is KelasDetail => kelas !== undefined);
  const daftarTujuan = tujuanId !== null ? (kelasTujuan.data ?? []) : [];

  const penempatan = new Map<number, Penempatan>();
  for (const kelas of detailKelas) {
    for (const murid of kelas.murid.filter((item) => item.status_kelas === "aktif")) {
      penempatan.set(murid.id, ubahan.get(murid.id) ?? saranPenempatan(kelas, daftarTujuan));
    }
  }
  const belumLengkap = [...penempatan.values()].filter((item) => !penempatanLengkap(item)).length;

  if (hasil) {
    return (
      <KotakPesan nada="sukses" judul="Kenaikan kelas tersimpan">
        <p>
          {hasil.naik} murid naik kelas, {hasil.tinggal} tinggal kelas, {hasil.lulus} lulus.
        </p>
        <Link href="/mudarris/kelas" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
          Lihat Kelas
        </Link>
      </KotakPesan>
    );
  }
  if (tahunAjaran.isPending) return <Skeleton className="h-40 rounded-xl" />;
  if (tahunAjaran.isError) return <GalatMuat error={tahunAjaran.error} onCobaLagi={() => void tahunAjaran.refetch()} />;

  if (!aktif) {
    return (
      <KotakPesan nada="menunggu" judul="Belum ada tahun ajaran aktif">
        Kenaikan kelas selalu dimulai dari tahun ajaran aktif. Aktifkan tahun ajaran yang sedang berjalan di menu Tahun Ajaran.
      </KotakPesan>
    );
  }

  const pilihanTujuan = tahunAjaran.data.filter((ta) => ta.id !== aktif.id);
  const namaTujuan = pilihanTujuan.find((ta) => ta.id === tujuanId)?.nama;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">Dari tahun ajaran</p>
          <p className="flex h-11 items-center rounded-md bg-muted px-3 font-bold">{aktif.nama} (aktif)</p>
        </div>
        <KolomPilih
          label="Ke tahun ajaran"
          deskripsi="Kelas tujuan harus sudah dibuat di tahun ajaran ini."
          value={tujuanId ?? ""}
          onChange={(event) => {
            setTujuanId(event.target.value ? Number(event.target.value) : null);
            setUbahan(new Map());
          }}
        >
          <option value="">Pilih tahun ajaran tujuan</option>
          {pilihanTujuan.map((ta) => (
            <option key={ta.id} value={ta.id}>
              {ta.nama}
            </option>
          ))}
        </KolomPilih>
      </div>

      {tujuanId === null ? (
        <p className="text-sm text-muted-foreground">Pilih tahun ajaran tujuan untuk mulai mengatur kenaikan kelas.</p>
      ) : kelasAsal.isPending || kelasTujuan.isPending || detail.some((query) => query.isPending) ? (
        <Skeleton className="h-60 rounded-xl" />
      ) : kelasAsal.isError || kelasTujuan.isError ? (
        <GalatMuat error={kelasAsal.error ?? kelasTujuan.error} onCobaLagi={() => void kelasAsal.refetch()} />
      ) : daftarTujuan.length === 0 ? (
        <EmptyState
          judul={`Belum ada kelas di Tahun Ajaran ${namaTujuan ?? ""}.`}
          deskripsi="Buat kelas tujuan dulu di menu Kelas, lalu kembali ke halaman ini."
          aksi={<Link href="/mudarris/kelas" className={buttonVariants({ variant: "outline" })}>Buka Menu Kelas</Link>}
        />
      ) : (
        <>
          {detailKelas.map((kelas) => (
            <KenaikanPerKelas
              key={kelas.id}
              kelas={kelas}
              kelasTujuan={daftarTujuan}
              penempatan={penempatan}
              onUbah={(muridId, nilai) => setUbahan((lama) => new Map(lama).set(muridId, nilai))}
            />
          ))}
          <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-md">
            <p className="text-sm">
              {penempatan.size} murid diatur.
              {belumLengkap > 0 ? <span className="font-bold text-destructive"> {belumLengkap} murid belum punya kelas tujuan.</span> : null}
            </p>
            <DialogKonfirmasi
              pemicu={<Button disabled={belumLengkap > 0 || penempatan.size === 0}>Simpan Kenaikan Kelas</Button>}
              judul="Simpan kenaikan kelas?"
              deskripsi={`${penempatan.size} murid akan ditempatkan di Tahun Ajaran ${namaTujuan ?? ""}. Penempatan lama ditandai naik, tinggal, atau lulus.`}
              labelAksi="Simpan"
              onKonfirmasi={async () => {
                const { data } = await kenaikan.mutateAsync({
                  tahun_ajaran_tujuan_id: tujuanId,
                  penempatan: [...penempatan].map(([muridId, nilai]) => ({
                    murid_id: muridId,
                    status: nilai.status,
                    kelas_tujuan_id: nilai.status === "lulus" ? null : nilai.kelasTujuanId,
                  })),
                });
                toast.success("Kenaikan kelas tersimpan.");
                setHasil(data);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
