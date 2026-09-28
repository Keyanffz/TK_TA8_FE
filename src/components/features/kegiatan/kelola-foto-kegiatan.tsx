"use client";

import { KelolaFoto } from "@/components/shared/kelola-foto";
import {
  MAKS_FOTO_PER_KEGIATAN,
  MAKS_FOTO_PER_UNGGAHAN,
  useHapusFotoKegiatan,
  useTambahFotoKegiatan,
  useUbahFotoKegiatan,
} from "@/lib/api/kegiatan";
import type { KegiatanKelas } from "@/types/domain";

/** Foto kegiatan (pembuat kegiatan dan Kepala Sekolah). */
export function KelolaFotoKegiatan({ kegiatan }: { kegiatan: KegiatanKelas }) {
  const tambah = useTambahFotoKegiatan(kegiatan.id);
  const ubah = useUbahFotoKegiatan();
  const hapus = useHapusFotoKegiatan();

  return (
    <KelolaFoto
      foto={kegiatan.foto}
      privat
      deskripsi="Urutan di sini sama dengan urutan yang dilihat wali murid. Foto pertama menjadi sampul di feed."
      maksPerUnggahan={MAKS_FOTO_PER_UNGGAHAN}
      sisa={MAKS_FOTO_PER_KEGIATAN - kegiatan.foto.length}
      contohKeterangan="Keterangan foto, misalnya: Kinan menyiram tanaman"
      ubahFoto={(id, body) => ubah.mutateAsync({ id, ...body })}
      hapusFoto={(id) => hapus.mutateAsync(id)}
      tambahFoto={(foto) => tambah.mutateAsync(foto)}
    />
  );
}
