import "server-only";

import { cache } from "react";

import { buatApiError } from "@/lib/api/errors";
import { bacaProfilPublik } from "@/lib/api/pengaturan";
import { apiServer } from "@/lib/api/server";
import { REVALIDATE_PUBLIK_DETIK, TAG_PUBLIK } from "@/lib/constants/sekolah";
import { bulanJakarta, hariIniJakarta } from "@/lib/tanggal";
import type { Agenda } from "@/types/domain";

function publik(tag: string) {
  return apiServer({ revalidate: REVALIDATE_PUBLIK_DETIK, tags: [tag] });
}

// cache() menyatukan panggilan dari layout dan halaman dalam satu render.
export const ambilProfilSekolah = cache(async () => {
  const { data, error, response } = await publik(TAG_PUBLIK.profil).GET("/public/profil");
  if (!data) throw buatApiError(response, error);
  return bacaProfilPublik(data.data);
});

export async function ambilGuruPublik() {
  const { data, error, response } = await publik(TAG_PUBLIK.guru).GET("/public/guru");
  if (!data) throw buatApiError(response, error);
  return data.data;
}

export async function ambilPpdbPublik() {
  const { data, error, response } = await publik(TAG_PUBLIK.ppdb).GET("/public/ppdb");
  if (!data) throw buatApiError(response, error);
  return data.data;
}

export async function ambilDaftarPengumuman(halaman: number, perHalaman: number) {
  const { data, error, response } = await publik(TAG_PUBLIK.pengumuman).GET("/public/pengumuman", {
    params: { query: { page: halaman, per_page: perHalaman } },
  });
  if (!data) throw buatApiError(response, error);
  return { data: data.data, meta: data.meta };
}

/** null kalau slug tidak ada atau pengumuman tidak publik. */
export async function ambilDetailPengumuman(slug: string) {
  const { data, error, response } = await publik(TAG_PUBLIK.pengumuman).GET("/public/pengumuman/{slug}", {
    params: { path: { slug } },
  });
  if (response.status === 404) return null;
  if (!data) throw buatApiError(response, error);
  return data.data;
}

export async function ambilDaftarGaleri(halaman: number, perHalaman: number) {
  const { data, error, response } = await publik(TAG_PUBLIK.galeri).GET("/public/galeri", {
    params: { query: { page: halaman, per_page: perHalaman } },
  });
  if (!data) throw buatApiError(response, error);
  return { data: data.data, meta: data.meta };
}

/** null kalau slug tidak ada atau album tidak publik. */
export async function ambilDetailGaleri(slug: string) {
  const { data, error, response } = await publik(TAG_PUBLIK.galeri).GET("/public/galeri/{slug}", {
    params: { path: { slug } },
  });
  if (response.status === 404) return null;
  if (!data) throw buatApiError(response, error);
  return data.data;
}

async function ambilAgendaBulan(bulan: string): Promise<Agenda[]> {
  const { data, error, response } = await publik(TAG_PUBLIK.agenda).GET("/public/agenda", {
    params: { query: { bulan } },
  });
  if (!data) throw buatApiError(response, error);
  return data.data;
}

/**
 * Agenda publik yang belum selesai, dari bulan ini dan bulan depan.
 * Agenda lintas bulan muncul di kedua bulan, jadi disaring per id.
 */
export async function ambilAgendaMendatang(jumlah: number): Promise<Agenda[]> {
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
}
