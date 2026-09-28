import "server-only";

import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { connection } from "next/server";
import { cache } from "react";

import { buatApiError } from "@/lib/api/errors";
import { bacaProfilPublik } from "@/lib/api/pengaturan";
import { apiServer } from "@/lib/api/server";
import { REVALIDATE_PUBLIK_DETIK, TAG_PUBLIK } from "@/lib/constants/sekolah";
import { bulanJakarta, hariIniJakarta } from "@/lib/tanggal";
import type { Agenda } from "@/types/domain";

type HasilPermintaan<T> = { data?: T; error?: unknown; response: Response };

function publik(tag: string) {
  return apiServer({ revalidate: REVALIDATE_PUBLIK_DETIK, tags: [tag] });
}

/**
 * Backend mati saat `next build` tidak boleh menggagalkan build, tetapi halaman juga tidak boleh
 * di-prerender dengan data kosong lalu disajikan dari cache ISR. connection() menghentikan
 * prerender sehingga halaman itu dirender saat diminta. Di luar build, error dilempar ke error.tsx.
 */
async function gagalMengambil(jalur: string, penyebab: unknown): Promise<never> {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    console.warn(`${jalur} tidak bisa diambil saat build, halaman dirender saat diminta.`);
    await connection();
  }
  console.error(`Mengambil ${jalur} dari backend gagal:`, penyebab);
  throw penyebab;
}

async function tunggu<T>(jalur: string, permintaan: Promise<HasilPermintaan<T>>): Promise<HasilPermintaan<T>> {
  try {
    return await permintaan;
  } catch (penyebab) {
    return gagalMengambil(jalur, penyebab);
  }
}

async function ambil<T>(jalur: string, permintaan: Promise<HasilPermintaan<T>>): Promise<T> {
  const { data, error, response } = await tunggu(jalur, permintaan);
  return data ?? gagalMengambil(jalur, buatApiError(response, error));
}

/** null hanya kalau backend membalas 404 (slug tidak ada atau tidak publik). */
async function ambilDetail<T>(jalur: string, permintaan: Promise<HasilPermintaan<T>>): Promise<T | null> {
  const { data, error, response } = await tunggu(jalur, permintaan);
  if (response.status === 404) return null;
  return data ?? gagalMengambil(jalur, buatApiError(response, error));
}

// cache() menyatukan panggilan dari layout dan halaman dalam satu render.
export const ambilProfilSekolah = cache(async () => {
  const { data } = await ambil("/public/profil", publik(TAG_PUBLIK.profil).GET("/public/profil"));
  return bacaProfilPublik(data);
});

export async function ambilGuruPublik() {
  const { data } = await ambil("/public/guru", publik(TAG_PUBLIK.guru).GET("/public/guru"));
  return data;
}

export async function ambilPpdbPublik() {
  const { data } = await ambil("/public/ppdb", publik(TAG_PUBLIK.ppdb).GET("/public/ppdb"));
  return data;
}

export async function ambilDaftarPengumuman(halaman: number, perHalaman: number) {
  const { data, meta } = await ambil(
    "/public/pengumuman",
    publik(TAG_PUBLIK.pengumuman).GET("/public/pengumuman", {
      params: { query: { page: halaman, per_page: perHalaman } },
    }),
  );
  return { data, meta };
}

/** null kalau slug tidak ada atau pengumuman tidak publik. */
export async function ambilDetailPengumuman(slug: string) {
  const hasil = await ambilDetail(
    `/public/pengumuman/${slug}`,
    publik(TAG_PUBLIK.pengumuman).GET("/public/pengumuman/{slug}", { params: { path: { slug } } }),
  );
  return hasil?.data ?? null;
}

export async function ambilDaftarGaleri(halaman: number, perHalaman: number) {
  const { data, meta } = await ambil(
    "/public/galeri",
    publik(TAG_PUBLIK.galeri).GET("/public/galeri", {
      params: { query: { page: halaman, per_page: perHalaman } },
    }),
  );
  return { data, meta };
}

/** null kalau slug tidak ada atau album tidak publik. */
export async function ambilDetailGaleri(slug: string) {
  const hasil = await ambilDetail(
    `/public/galeri/${slug}`,
    publik(TAG_PUBLIK.galeri).GET("/public/galeri/{slug}", { params: { path: { slug } } }),
  );
  return hasil?.data ?? null;
}

async function ambilAgendaBulan(bulan: string): Promise<Agenda[]> {
  const { data } = await ambil(
    "/public/agenda",
    publik(TAG_PUBLIK.agenda).GET("/public/agenda", { params: { query: { bulan } } }),
  );
  return data;
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
