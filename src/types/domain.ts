import type { components, operations } from "@/types/api";

type Schemas = components["schemas"];

/** Isi `data` respons sukses sebuah operasi, untuk bentuk yang tidak punya skema bernama. */
export type DataRespons<Op extends keyof operations> = operations[Op]["responses"] extends {
  200: { content: { "application/json": { data: infer Data } } };
}
  ? Data
  : never;

export type Role = Schemas["Role"];
export type StatusAkun = Schemas["StatusAkun"];
export type StatusMurid = Schemas["StatusMurid"];
export type Hubungan = Schemas["Hubungan"];
export type Tingkat = Schemas["Tingkat"];
export type JenisKelamin = Schemas["JenisKelamin"];
export type PeriodeTagihan = Schemas["PeriodeTagihan"];
export type TipeKeringanan = Schemas["TipeKeringanan"];
export type StatusTagihan = Schemas["StatusTagihan"];
export type MetodeBayar = Schemas["MetodeBayar"];
export type StatusPembayaran = Schemas["StatusPembayaran"];
export type TargetPengumuman = Schemas["TargetPengumuman"];
export type JenisAgenda = Schemas["JenisAgenda"];
export type StatusRapor = Schemas["StatusRapor"];
export type StatusPendaftaran = Schemas["StatusPendaftaran"];
export type JenisDokumen = Schemas["JenisDokumen"];
export type JenisNotifikasi = Schemas["JenisNotifikasi"];
export type NadaInfo = Schemas["NadaInfo"];
export type JenisAbsensi = Schemas["JenisAbsensi"];
export type StatusAbsensi = Schemas["StatusAbsensi"];

// A5 punya StatusKelasMurid, tetapi api.json tidak mengekspornya sebagai skema tersendiri.
export type StatusKelasMurid = "aktif" | "naik" | "tinggal" | "lulus" | "keluar";

export type User = Schemas["UserResource"];
export type Akun = Schemas["AkunResource"];
export type Agenda = Schemas["AgendaResource"];
export type GaleriAlbum = Schemas["GaleriAlbumResource"];
export type GuruPublik = Schemas["GuruPublikResource"];
export type PengumumanPublik = Schemas["PengumumanPublikResource"];
export type Pengumuman = Schemas["PengumumanResource"];
export type Notifikasi = Schemas["NotifikasiResource"];
export type AnakWali = Schemas["AnakWaliResource"];
export type Guru = Schemas["GuruResource"];
export type TahunAjaran = Schemas["TahunAjaranResource"];
export type Kelas = Schemas["KelasResource"];
export type KelasDetail = Schemas["KelasDetailResource"];
export type Murid = Schemas["MuridResource"];
export type MuridDetail = Schemas["MuridDetailResource"];
export type WaliMurid = Schemas["WaliMuridResource"];
export type WaliMuridDetail = Schemas["WaliMuridDetailResource"];
export type JenisTagihan = Schemas["JenisTagihanResource"];
export type Keringanan = Schemas["KeringananResource"];
export type Tagihan = Schemas["TagihanResource"];
export type TagihanDetail = Schemas["TagihanDetailResource"];
export type Pembayaran = Schemas["PembayaranResource"];
export type RiwayatPembayaran = Schemas["RiwayatPembayaranResource"];
export type KegiatanKelas = Schemas["KegiatanKelasResource"];
export type Rapor = Schemas["RaporResource"];
export type RaporDetail = Schemas["RaporDetailResource"];
export type ElemenPenilaian = Schemas["ElemenPenilaianResource"];
export type Pendaftaran = Schemas["PendaftaranResource"];
export type PendaftaranDetail = Schemas["PendaftaranDetailResource"];
export type PendaftaranPublik = Schemas["PendaftaranPublikResource"];
export type Absensi = Schemas["AbsensiResource"];

export type Dashboard = DataRespons<"dashboard.dashboard">;
export type LaporanKeuangan = DataRespons<"laporan.keuangan">;
export type LaporanTunggakan = DataRespons<"laporan.tunggakan">;
export type AbsensiHariIni = DataRespons<"absensi.hariIni">;
export type RekapAbsensi = DataRespons<"absensi.rekap">[number];

export type KodeError =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "ACCOUNT_INACTIVE"
  | "PASSWORD_WAJIB_DIGANTI"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE"
  | "TOO_MANY_REQUESTS"
  | "SERVER_ERROR";

export type ResponsError = {
  success: false;
  message: string;
  code: KodeError;
  errors: Record<string, string[]> | null;
};

export type MetaPaginasi = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};
