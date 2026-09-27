import { z } from "zod";

// api.json menulis data GET /public/profil sebagai objek bebas, jadi bentuknya
// divalidasi di sini mengikuti kunci pengaturan A4. String kosong dianggap
// belum diisi.
const teksOpsional = z
  .string()
  .nullish()
  .transform((nilai) => (nilai && nilai.trim() !== "" ? nilai : null));

const daftar = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((nilai) => nilai ?? []);

const itemBerikon = z.object({
  judul: z.string(),
  deskripsi: teksOpsional,
  ikon: teksOpsional,
});

const itemFasilitas = z.object({
  nama: z.string(),
  deskripsi: teksOpsional,
  gambar_url: teksOpsional,
});

const skemaProfilPublik = z.object({
  "profil.nama_sekolah": z.string(),
  "profil.npsn": teksOpsional,
  "profil.alamat": teksOpsional,
  "profil.telepon": teksOpsional,
  "profil.email": teksOpsional,
  "profil.maps_embed_url": teksOpsional,
  "profil.logo_url": teksOpsional,
  "profil.visi": teksOpsional,
  "profil.misi": daftar(z.string()),
  "profil.sejarah": teksOpsional,
  "profil.sambutan_kepsek": teksOpsional,
  "landing.hero": z
    .object({
      judul: teksOpsional,
      subjudul: teksOpsional,
      gambar_url: teksOpsional,
      cta_teks: teksOpsional,
    })
    .nullish(),
  "landing.program": daftar(itemBerikon),
  "landing.keunggulan": daftar(itemBerikon),
  "landing.fasilitas": daftar(itemFasilitas),
});

export type ItemBerikon = z.output<typeof itemBerikon>;
export type ItemFasilitas = z.output<typeof itemFasilitas>;

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

export function bacaProfilPublik(data: unknown): ProfilSekolah {
  const profil = skemaProfilPublik.parse(data);
  const hero = profil["landing.hero"];
  return {
    namaSekolah: profil["profil.nama_sekolah"],
    npsn: profil["profil.npsn"],
    alamat: profil["profil.alamat"],
    telepon: profil["profil.telepon"],
    email: profil["profil.email"],
    mapsEmbedUrl: profil["profil.maps_embed_url"],
    logoUrl: profil["profil.logo_url"],
    visi: profil["profil.visi"],
    misi: profil["profil.misi"],
    sejarah: profil["profil.sejarah"],
    sambutanKepsek: profil["profil.sambutan_kepsek"],
    hero: {
      judul: hero?.judul ?? null,
      subjudul: hero?.subjudul ?? null,
      gambarUrl: hero?.gambar_url ?? null,
      ctaTeks: hero?.cta_teks ?? null,
    },
    program: profil["landing.program"],
    keunggulan: profil["landing.keunggulan"],
    fasilitas: profil["landing.fasilitas"],
  };
}
