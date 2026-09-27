import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DaftarPpdbWali } from "@/components/features/ppdb/daftar-ppdb-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { ambilPpdbPublik } from "@/lib/api/publik";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Daftarkan Anak" };

export default async function DaftarPpdbWaliPage() {
  const [user, ppdb] = await Promise.all([wajibAkses((sesi) => sesi.isWali), ambilPpdbPublik()]);
  if (!ppdb.dibuka || ppdb.sisa_kuota <= 0) redirect("/dashboard/ppdb");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Daftarkan Anak"
        deskripsi={ppdb.tahun_ajaran ? `Pendaftaran murid baru Tahun Ajaran ${ppdb.tahun_ajaran.nama}.` : undefined}
      />
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <DaftarPpdbWali noHp={user.no_hp ?? ""} alamat={user.wali_murid?.alamat ?? ""} />
      </div>
    </div>
  );
}
