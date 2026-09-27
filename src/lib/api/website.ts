"use client";

import { TAG_PUBLIK } from "@/lib/constants/sekolah";

export type TagPublik = (typeof TAG_PUBLIK)[keyof typeof TAG_PUBLIK];

/**
 * Minta Next.js membuang cache halaman publik (ISR) setelah Kepala Sekolah menyimpan konten yang
 * tampil di website, supaya landing langsung berubah. Kegagalan hanya dicatat: data sudah tersimpan
 * di backend dan cache tetap kedaluwarsa sendiri dalam 5 menit.
 */
export async function segarkanWebsite(tags: TagPublik[]): Promise<void> {
  try {
    const respons = await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (!respons.ok) console.error(`Menyegarkan cache website gagal (${respons.status}).`);
  } catch (penyebab) {
    console.error("Menyegarkan cache website gagal:", penyebab);
  }
}
