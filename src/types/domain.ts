import type { components } from "@/types/api";

type Schemas = components["schemas"];

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

// A5 punya StatusKelasMurid, tetapi api.json tidak mengekspornya sebagai skema tersendiri.
export type StatusKelasMurid = "aktif" | "naik" | "tinggal" | "lulus" | "keluar";

export type User = Schemas["UserResource"];
export type Agenda = Schemas["AgendaResource"];
export type GaleriAlbum = Schemas["GaleriAlbumResource"];
export type GuruPublik = Schemas["GuruPublikResource"];
export type PengumumanPublik = Schemas["PengumumanPublikResource"];

export type KodeError =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "ACCOUNT_PENDING"
  | "ACCOUNT_REJECTED"
  | "ACCOUNT_INACTIVE"
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
