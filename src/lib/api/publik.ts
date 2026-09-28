import "server-only";

import { cache } from "react";

import { bacaProfilPublik, type ProfilSekolah } from "@/lib/api/pengaturan";
import { apiServer } from "@/lib/api/server";
import { LOGO_CADANGAN, REVALIDATE_PUBLIK_DETIK, TAG_PUBLIK } from "@/lib/constants/sekolah";
import { bulanJakarta, hariIniJakarta } from "@/lib/tanggal";
import type { Agenda, DataRespons, GuruPublik } from "@/types/domain";

function publik(tag: string) {
  return apiServer({ revalidate: REVALIDATE_PUBLIK_DETIK, tags: [tag] });
}

export const PROFIL_CADANGAN: ProfilSekolah = {
  namaSekolah: "TK Tarbiyathul Athfal 8",
  npsn: "20328901",
  alamat: "Jl. Tlogosari Raya No. 45, Kec. Pedurungan, Kota Semarang",
  telepon: "(024) 6712345",
  email: "tu@tkta8.test",
  mapsEmbedUrl: null,
  logoUrl: LOGO_CADANGAN,
  visi: "Mewujudkan generasi anak usia dini yang berakhlak mulia, cerdas, kreatif, mandiri, dan berwawasan lingkungan.",
  misi: [
    "Menanamkan nilai-nilai keagamaan dan budi pekerti luhur sejak dini.",
    "Mengembangkan potensi kecerdasan jamak anak melalui kegiatan bermain yang bermakna.",
    "Membiasakan hidup bersih, sehat, dan peduli lingkungan sekitar.",
  ],
  sejarah: null,
  sambutanKepsek: null,
  hero: {
    judul: "Pendidikan Usia Dini yang Menyenangkan dan Berkarakter",
    subjudul: "Membimbing tunas bangsa tumbuh cerdas, ceria, dan berakhlak mulia di bawah naungan TK Muslimat NU.",
    gambarUrl: null,
    ctaTeks: "Lihat Info PPDB",
  },
  program: [],
  keunggulan: [],
  fasilitas: [],
};

// cache() menyatukan panggilan dari layout dan halaman dalam satu render.
export const ambilProfilSekolah = cache(async (): Promise<ProfilSekolah> => {
  try {
    const { data } = await publik(TAG_PUBLIK.profil).GET("/public/profil");
    if (!data?.data) return PROFIL_CADANGAN;
    return bacaProfilPublik(data.data);
  } catch {
    return PROFIL_CADANGAN;
  }
});

export async function ambilGuruPublik(): Promise<GuruPublik[]> {
  try {
    const { data } = await publik(TAG_PUBLIK.guru).GET("/public/guru");
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function ambilPpdbPublik(): Promise<DataRespons<"publik.ppdb">> {
  try {
    const { data } = await publik(TAG_PUBLIK.ppdb).GET("/public/ppdb");
    if (!data?.data) {
      return {
        dibuka: false,
        tahun_ajaran: null,
        tanggal_buka: null,
        tanggal_tutup: null,
        kuota: 0,
        sisa_kuota: 0,
        info: "",
      };
    }
    return data.data;
  } catch {
    return {
      dibuka: false,
      tahun_ajaran: null,
      tanggal_buka: null,
      tanggal_tutup: null,
      kuota: 0,
      sisa_kuota: 0,
      info: "",
    };
  }
}

export async function ambilDaftarPengumuman(halaman: number, perHalaman: number) {
  try {
    const { data } = await publik(TAG_PUBLIK.pengumuman).GET("/public/pengumuman", {
      params: { query: { page: halaman, per_page: perHalaman } },
    });
    if (!data) return { data: [], meta: { current_page: halaman, per_page: perHalaman, last_page: 1, total: 0 } };
    return { data: data.data, meta: data.meta };
  } catch {
    return { data: [], meta: { current_page: halaman, per_page: perHalaman, last_page: 1, total: 0 } };
  }
}

/** null kalau slug tidak ada atau pengumuman tidak publik. */
export async function ambilDetailPengumuman(slug: string) {
  try {
    const { data, response } = await publik(TAG_PUBLIK.pengumuman).GET("/public/pengumuman/{slug}", {
      params: { path: { slug } },
    });
    if (response?.status === 404 || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

export async function ambilDaftarGaleri(halaman: number, perHalaman: number) {
  try {
    const { data } = await publik(TAG_PUBLIK.galeri).GET("/public/galeri", {
      params: { query: { page: halaman, per_page: perHalaman } },
    });
    if (!data) return { data: [], meta: { current_page: halaman, per_page: perHalaman, last_page: 1, total: 0 } };
    return { data: data.data, meta: data.meta };
  } catch {
    return { data: [], meta: { current_page: halaman, per_page: perHalaman, last_page: 1, total: 0 } };
  }
}

/** null kalau slug tidak ada atau album tidak publik. */
export async function ambilDetailGaleri(slug: string) {
  try {
    const { data, response } = await publik(TAG_PUBLIK.galeri).GET("/public/galeri/{slug}", {
      params: { path: { slug } },
    });
    if (response?.status === 404 || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

async function ambilAgendaBulan(bulan: string): Promise<Agenda[]> {
  try {
    const { data } = await publik(TAG_PUBLIK.agenda).GET("/public/agenda", {
      params: { query: { bulan } },
    });
    return data?.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Agenda publik yang belum selesai, dari bulan ini dan bulan depan.
 * Agenda lintas bulan muncul di kedua bulan, jadi disaring per id.
 */
export async function ambilAgendaMendatang(jumlah: number): Promise<Agenda[]> {
  try {
    const [bulanIni, bulanDepan] = await Promise.all([
      ambilAgendaBulan(bulanJakarta(0)),
      ambilAgendaBulan(bulanJakarta(1)),
    ]);
    const hariIni = hariIniJakarta();
    const unik = new Map<number, Agenda>();
    for (const agenda of [...bulanIni, ...bulanDepan]) {
      if (agenda.tanggal_selesai >= hariIni) unik.set(agenda.id, agenda);
    }
    return [...unik.values()]
      .sort((a, b) => a.tanggal_mulai.localeCompare(b.tanggal_mulai))
      .slice(0, jumlah);
  } catch {
    return [];
  }
}
