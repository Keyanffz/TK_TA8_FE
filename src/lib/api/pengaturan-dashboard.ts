"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import { segarkanWebsite, type TagPublik } from "@/lib/api/website";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";

export type GrupPengaturan = "profil" | "landing" | "keuangan" | "ppdb" | "beranda";

// Grup yang tampil di website publik; setelah disimpan, cache halaman publiknya dibuang.
const TAG_GRUP: Partial<Record<GrupPengaturan, TagPublik>> = {
  profil: TAG_PUBLIK.profil,
  landing: TAG_PUBLIK.profil,
  ppdb: TAG_PUBLIK.ppdb,
};

// `data` GET /pengaturan berupa objek berkunci bebas di api.json, jadi bentuk
// tiap kunci dipastikan dengan zod sesuai A4.
export const skemaInfoWali = z.object({
  aktif: z.boolean(),
  judul: z.string().nullable(),
  isi: z.string().nullable(),
  nada: z.enum(["info", "penting", "peringatan"]),
  berlaku_sampai: z.string().nullable(),
});

export type InfoWali = z.infer<typeof skemaInfoWali>;

const teks = z.string().nullable().catch(null);

export const skemaProfilSekolah = z.object({
  "profil.nama_sekolah": z.string().catch(""),
  "profil.npsn": teks,
  "profil.alamat": teks,
  "profil.telepon": teks,
  "profil.email": teks,
  "profil.maps_embed_url": teks,
  "profil.logo": teks,
  "profil.logo_url": teks,
  "profil.visi": teks,
  "profil.misi": z.array(z.string()).catch([]),
  "profil.sejarah": teks,
  "profil.sambutan_kepsek": teks,
});

const itemBerikon = z.object({ judul: z.string(), deskripsi: teks, ikon: teks });

export const skemaLanding = z.object({
  "landing.hero": z
    .object({ judul: teks, subjudul: teks, gambar: teks, gambar_url: teks, cta_teks: teks })
    .catch({ judul: null, subjudul: null, gambar: null, gambar_url: null, cta_teks: null }),
  "landing.program": z.array(itemBerikon).catch([]),
  "landing.keunggulan": z.array(itemBerikon).catch([]),
  "landing.fasilitas": z.array(z.object({ nama: z.string(), deskripsi: teks, gambar: teks, gambar_url: teks })).catch([]),
});

export const skemaKeuangan = z.object({
  "keuangan.rekening": z.array(z.object({ bank: z.string(), nomor: z.string(), atas_nama: z.string() })).catch([]),
  "keuangan.tanggal_jatuh_tempo": z.number().catch(10),
  "keuangan.hari_pengingat": z.number().catch(3),
});

export const skemaPpdb = z.object({
  "ppdb.dibuka": z.boolean().catch(false),
  "ppdb.tanggal_buka": teks,
  "ppdb.tanggal_tutup": teks,
  "ppdb.tahun_ajaran_id": z.number().nullable().catch(null),
  "ppdb.kuota": z.number().catch(0),
  "ppdb.info": teks,
});

/**
 * Pesan VALIDATION_ERROR untuk satu kunci pengaturan, sebagai pasangan [sisa path, pesan].
 * Backend memakai kunci "items.<kunci>.<field>", misalnya "items.landing.program.0.judul" → "0.judul".
 */
export function pesanErrorPengaturan(error: unknown, kunci: string): [string, string][] {
  if (!(error instanceof ApiError) || !error.errors) return [];
  const awalan = `items.${kunci}`;
  return Object.entries(error.errors)
    .filter(([nama]) => nama === awalan || nama.startsWith(`${awalan}.`))
    .map(([nama, pesan]) => [nama.slice(awalan.length + 1), pesan[0] ?? ""]);
}

export function usePengaturan<T>(grup: GrupPengaturan, baca: (data: Record<string, unknown>) => T) {
  return useQuery({
    queryKey: queryKeys.pengaturan(grup),
    queryFn: async () => baca((await ambilData(api.GET("/pengaturan", { params: { query: { grup } } }))).data),
  });
}

export function useSimpanPengaturan(grup: GrupPengaturan) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: Record<string, unknown>) => ambilData(api.PUT("/pengaturan", { body: { items } })),
    onSuccess: () => {
      const tag = TAG_GRUP[grup];
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.pengaturan(grup) }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        grup === "ppdb" ? queryClient.invalidateQueries({ queryKey: queryKeys.pendaftaran.status }) : null,
        tag ? segarkanWebsite([tag]) : null,
      ]);
    },
  });
}

/** Unggah gambar CMS (logo, hero, fasilitas); hasilnya path untuk disimpan di pengaturan dan URL pratinjau. */
export function useUnggahGambarPengaturan() {
  return useMutation({
    mutationFn: async (gambar: File) => (await ambilData(api.POST("/pengaturan/upload", { body: { gambar }, bodySerializer: keFormData }))).data,
  });
}
