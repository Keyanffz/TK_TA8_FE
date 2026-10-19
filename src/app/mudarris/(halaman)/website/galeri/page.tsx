import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { DaftarAlbum } from "@/components/features/galeri-sekolah/daftar-album";
import { DialogAlbum } from "@/components/features/galeri-sekolah/dialog-album";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { Button } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriSekolahPage() {
  const sesi = statusSesi(await wajibAkses((sesi) => punyaIzin(sesi, "konten_website")));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Galeri"
        deskripsi="Album foto untuk halaman Galeri website. Foto di sini bisa dilihat siapa saja; foto kegiatan harian anak cukup di Kegiatan Kelas."
        aksi={
          punyaIzin(sesi, "konten_website", "kelola") ? (
            <DialogAlbum
              album={null}
              pemicu={
                <Button>
                  <Plus aria-hidden="true" />
                  Tambah Album
                </Button>
              }
            />
          ) : null
        }
      />
      <DaftarAlbum />
    </div>
  );
}
