import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { DaftarAlbum } from "@/components/features/galeri-sekolah/daftar-album";
import { DialogAlbum } from "@/components/features/galeri-sekolah/dialog-album";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { Button } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriSekolahPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Galeri"
        deskripsi="Album foto untuk halaman Galeri website. Foto di sini bisa dilihat siapa saja; foto kegiatan harian anak cukup di Kegiatan Kelas."
        aksi={
          <DialogAlbum
            album={null}
            pemicu={
              <Button>
                <Plus aria-hidden="true" />
                Tambah Album
              </Button>
            }
          />
        }
      />
      <DaftarAlbum />
    </div>
  );
}
