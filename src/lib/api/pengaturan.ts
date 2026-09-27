import type { operations } from "@/types/api";

type ProfilPublikMentah =
  operations["publik.profil"]["responses"][200]["content"]["application/json"]["data"];

export type ItemBerikon = { judul: string; deskripsi: string | null; ikon: string | null };
export type ItemFasilitas = { nama: string; deskripsi: string | null; gambar_url: string | null };

export type ProfilSekolah = {
  namaSekolah: string;
  npsn: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  mapsEmbedUrl: string | null;
  logoUrl: string | null;
  visi: string | null;
  misi: string[];
  sejarah: string | null;
  sambutanKepsek: string | null;
  hero: { judul: string | null; subjudul: string | null; gambarUrl: string | null; ctaTeks: string | null };
  program: ItemBerikon[];
  keunggulan: ItemBerikon[];
  fasilitas: ItemFasilitas[];
};

// Kunci yang belum diisi Kepala Sekolah berisi string kosong atau null. Keduanya
// dianggap kosong supaya halaman tidak menampilkan elemen tanpa isi.
function isi(teks: string | null | undefined): string | null {
  return teks && teks.trim() !== "" ? teks : null;
}

function itemBerikon(item: { judul: string; deskripsi?: string | null; ikon: string }): ItemBerikon {
  return { judul: item.judul, deskripsi: isi(item.deskripsi), ikon: isi(item.ikon) };
}

export function bacaProfilPublik(profil: ProfilPublikMentah): ProfilSekolah {
  const hero = profil["landing.hero"];
  return {
    namaSekolah: profil["profil.nama_sekolah"],
    npsn: isi(profil["profil.npsn"]),
    alamat: isi(profil["profil.alamat"]),
    telepon: isi(profil["profil.telepon"]),
    email: isi(profil["profil.email"]),
    mapsEmbedUrl: isi(profil["profil.maps_embed_url"]),
    logoUrl: isi(profil["profil.logo_url"]),
    visi: isi(profil["profil.visi"]),
    misi: profil["profil.misi"].filter((misi) => misi.trim() !== ""),
    sejarah: isi(profil["profil.sejarah"]),
    sambutanKepsek: isi(profil["profil.sambutan_kepsek"]),
    hero: {
      judul: isi(hero.judul),
      subjudul: isi(hero.subjudul),
      gambarUrl: isi(hero.gambar_url),
      ctaTeks: isi(hero.cta_teks),
    },
    program: profil["landing.program"].map(itemBerikon),
    keunggulan: profil["landing.keunggulan"].map(itemBerikon),
    fasilitas: profil["landing.fasilitas"].map((item) => ({
      nama: item.nama,
      deskripsi: isi(item.deskripsi),
      gambar_url: isi(item.gambar_url),
    })),
  };
}
