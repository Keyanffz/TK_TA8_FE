import { sudahMeninggal, type IsianFormulir, type IsianOrangTua } from "@/components/features/formulir-murid/skema";
import type { components } from "@/types/api";
import type { Agama, Hubungan, MuridDetail, OrangTua } from "@/types/domain";
import { NILAI_ENUM } from "@/types/enum-api";

type BodyMurid = components["schemas"]["SimpanMuridRequest"];
export type BodyOrangTua = NonNullable<BodyMurid["ayah"]>;

/** Bagian body yang sama untuk `POST /murid`, `PUT /murid/{id}`, dan `POST /pendaftaran`. */
export type BodyFormulir = Pick<
  BodyMurid,
  | "desa_kelurahan" | "kecamatan" | "kabupaten_kota" | "provinsi" | "asal_sekolah" | "kewarganegaraan" | "anak_ke"
  | "jumlah_saudara_kandung" | "jumlah_saudara_tiri" | "jumlah_saudara_angkat" | "status_yatim_piatu" | "bahasa_sehari_hari"
  | "jarak_rumah_km" | "golongan_darah" | "riwayat_penyakit" | "tinggi_badan" | "berat_badan" | "imunisasi"
  | "imunisasi_lainnya" | "ciri_khusus" | "kontak_utama" | "ayah" | "ibu" | "wali"
>;

/** Bentuk formulir yang sama di detail murid dan detail pendaftaran. `nik` tidak dikirim ke guru tanpa izin. */
export type DataFormulir = Pick<
  MuridDetail,
  | "nama_lengkap" | "nama_panggilan" | "jenis_kelamin" | "tempat_lahir" | "tanggal_lahir" | "agama" | "alamat"
  | keyof Omit<BodyFormulir, "ayah" | "ibu" | "wali"> | "orang_tua"
> & { nik?: string | null };

export const ORANG_TUA_KOSONG: IsianOrangTua = {
  status: "",
  hubungan: "",
  hubungan_lainnya: "",
  nama: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  agama: "",
  kewarganegaraan: "",
  pendidikan_terakhir: "",
  pekerjaan: "",
  pekerjaan_lainnya: "",
  penghasilan: "",
  alamat_sama_dengan_anak: false,
  alamat_rumah: "",
  alamat_kantor: "",
  no_hp: "",
};

/**
 * Nilai awal form baru. Jenis kelamin sengaja tanpa nilai supaya pengisi memilihnya sendiri. Status yatim/piatu
 * "tidak" karena ayah dan ibu awalnya dianggap masih hidup; langkah Orang Tua yang mengubahnya.
 */
export const FORMULIR_KOSONG: Omit<IsianFormulir, "jenis_kelamin"> = {
  nama_lengkap: "",
  nama_panggilan: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  agama: "",
  alamat: "",
  nik: "",
  desa_kelurahan: "",
  kecamatan: "",
  kabupaten_kota: "",
  provinsi: "",
  asal_sekolah: "",
  kewarganegaraan: "",
  anak_ke: "",
  jumlah_saudara_kandung: "0",
  jumlah_saudara_tiri: "0",
  jumlah_saudara_angkat: "0",
  status_yatim_piatu: "tidak",
  bahasa_sehari_hari: "",
  jarak_rumah_km: "",
  golongan_darah: "",
  riwayat_penyakit: "",
  tinggi_badan: "",
  berat_badan: "",
  imunisasi: [],
  imunisasi_lainnya: "",
  ciri_khusus: "",
  kontak_utama: "",
  ayah: ORANG_TUA_KOSONG,
  ibu: ORANG_TUA_KOSONG,
  wali: ORANG_TUA_KOSONG,
  ada_wali: false,
};

const teksAtauKosong = (nilai: string | number | null | undefined) => (nilai === null || nilai === undefined ? "" : String(nilai));
const desimalKeTeks = (nilai: number | null) => (nilai === null ? "" : String(nilai).replace(".", ","));

function isianOrangTua(orang: OrangTua | null): IsianOrangTua {
  if (!orang) return ORANG_TUA_KOSONG;
  return {
    status: orang.status ?? "",
    hubungan: orang.hubungan ?? "",
    hubungan_lainnya: teksAtauKosong(orang.hubungan_lainnya),
    nama: teksAtauKosong(orang.nama),
    tempat_lahir: teksAtauKosong(orang.tempat_lahir),
    tanggal_lahir: teksAtauKosong(orang.tanggal_lahir),
    agama: orang.agama && isAgama(orang.agama) ? orang.agama : "",
    kewarganegaraan: orang.kewarganegaraan ?? "",
    pendidikan_terakhir: orang.pendidikan_terakhir ?? "",
    pekerjaan: orang.pekerjaan ?? "",
    pekerjaan_lainnya: teksAtauKosong(orang.pekerjaan_lainnya),
    penghasilan: orang.penghasilan ?? "",
    alamat_sama_dengan_anak: orang.alamat_sama_dengan_anak,
    alamat_rumah: teksAtauKosong(orang.alamat_rumah),
    alamat_kantor: teksAtauKosong(orang.alamat_kantor),
    no_hp: teksAtauKosong(orang.no_hp),
  };
}

function isAgama(nilai: string): nilai is Agama {
  return NILAI_ENUM.Agama.some((agama) => agama === nilai);
}

/**
 * Data dari detail murid atau pendaftaran menjadi isian form. Angka kosong (data lama) tetap kosong, bukan 0,
 * supaya halaman Lengkapi Data wali tahu isian mana yang belum diisi.
 */
export function isianDariData(data: DataFormulir): IsianFormulir {
  return {
    nama_lengkap: data.nama_lengkap,
    nama_panggilan: data.nama_panggilan,
    jenis_kelamin: data.jenis_kelamin,
    tempat_lahir: data.tempat_lahir,
    tanggal_lahir: data.tanggal_lahir,
    agama: data.agama,
    alamat: data.alamat,
    nik: teksAtauKosong(data.nik),
    desa_kelurahan: teksAtauKosong(data.desa_kelurahan),
    kecamatan: teksAtauKosong(data.kecamatan),
    kabupaten_kota: teksAtauKosong(data.kabupaten_kota),
    provinsi: teksAtauKosong(data.provinsi),
    asal_sekolah: teksAtauKosong(data.asal_sekolah),
    kewarganegaraan: data.kewarganegaraan ?? "",
    anak_ke: teksAtauKosong(data.anak_ke),
    jumlah_saudara_kandung: teksAtauKosong(data.jumlah_saudara_kandung),
    jumlah_saudara_tiri: teksAtauKosong(data.jumlah_saudara_tiri),
    jumlah_saudara_angkat: teksAtauKosong(data.jumlah_saudara_angkat),
    status_yatim_piatu: data.status_yatim_piatu ?? "",
    bahasa_sehari_hari: teksAtauKosong(data.bahasa_sehari_hari),
    jarak_rumah_km: desimalKeTeks(data.jarak_rumah_km),
    golongan_darah: data.golongan_darah ?? "",
    riwayat_penyakit: teksAtauKosong(data.riwayat_penyakit),
    tinggi_badan: desimalKeTeks(data.tinggi_badan),
    berat_badan: desimalKeTeks(data.berat_badan),
    imunisasi: data.imunisasi ?? [],
    imunisasi_lainnya: teksAtauKosong(data.imunisasi_lainnya),
    ciri_khusus: teksAtauKosong(data.ciri_khusus),
    kontak_utama: data.kontak_utama ?? "",
    ayah: isianOrangTua(data.orang_tua.ayah),
    ibu: isianOrangTua(data.orang_tua.ibu),
    wali: isianOrangTua(data.orang_tua.wali),
    ada_wali: data.orang_tua.wali !== null,
  };
}

const teksAtauNull = (nilai: string) => (nilai.trim() === "" ? null : nilai.trim());
const angkaAtauNull = (nilai: string) => (nilai.trim() === "" ? null : Number(nilai.trim().replace(",", ".")));
const pilihanAtauNull = <T extends string>(nilai: T | "") => (nilai === "" ? null : nilai);

/**
 * Ayah atau ibu yang sudah meninggal hanya mengirim nama. Wali yang tidak dibuka dikirim dengan semua isian kosong,
 * supaya backend menghapusnya saat murid diubah.
 */
export function keBodyOrangTua(peran: Hubungan, orang: IsianOrangTua, dikirim: boolean): BodyOrangTua {
  if (!dikirim) return { nama: null, no_hp: null };
  return {
    ...(peran === "wali"
      ? { hubungan: pilihanAtauNull(orang.hubungan), hubungan_lainnya: orang.hubungan === "lainnya" ? teksAtauNull(orang.hubungan_lainnya) : null }
      : { status: pilihanAtauNull(orang.status) }),
    nama: teksAtauNull(orang.nama),
    tempat_lahir: teksAtauNull(orang.tempat_lahir),
    tanggal_lahir: teksAtauNull(orang.tanggal_lahir),
    agama: pilihanAtauNull(orang.agama),
    kewarganegaraan: pilihanAtauNull(orang.kewarganegaraan),
    pendidikan_terakhir: pilihanAtauNull(orang.pendidikan_terakhir),
    pekerjaan: pilihanAtauNull(orang.pekerjaan),
    pekerjaan_lainnya: orang.pekerjaan === "lainnya" ? teksAtauNull(orang.pekerjaan_lainnya) : null,
    penghasilan: pilihanAtauNull(orang.penghasilan),
    alamat_sama_dengan_anak: orang.alamat_sama_dengan_anak,
    alamat_rumah: orang.alamat_sama_dengan_anak ? null : teksAtauNull(orang.alamat_rumah),
    alamat_kantor: teksAtauNull(orang.alamat_kantor),
    no_hp: teksAtauNull(orang.no_hp),
  };
}

function bodyOrangTuaMeninggal(orang: IsianOrangTua): BodyOrangTua {
  return { nama: teksAtauNull(orang.nama) };
}

export function keBodyFormulir(isian: IsianFormulir): BodyFormulir {
  const orangTua = (peran: "ayah" | "ibu") =>
    sudahMeninggal(peran, isian.status_yatim_piatu) ? bodyOrangTuaMeninggal(isian[peran]) : keBodyOrangTua(peran, isian[peran], true);

  return {
    desa_kelurahan: teksAtauNull(isian.desa_kelurahan),
    kecamatan: teksAtauNull(isian.kecamatan),
    kabupaten_kota: teksAtauNull(isian.kabupaten_kota),
    provinsi: teksAtauNull(isian.provinsi),
    asal_sekolah: teksAtauNull(isian.asal_sekolah),
    kewarganegaraan: pilihanAtauNull(isian.kewarganegaraan),
    anak_ke: angkaAtauNull(isian.anak_ke),
    jumlah_saudara_kandung: angkaAtauNull(isian.jumlah_saudara_kandung),
    jumlah_saudara_tiri: angkaAtauNull(isian.jumlah_saudara_tiri),
    jumlah_saudara_angkat: angkaAtauNull(isian.jumlah_saudara_angkat),
    status_yatim_piatu: pilihanAtauNull(isian.status_yatim_piatu),
    bahasa_sehari_hari: teksAtauNull(isian.bahasa_sehari_hari),
    jarak_rumah_km: angkaAtauNull(isian.jarak_rumah_km),
    golongan_darah: pilihanAtauNull(isian.golongan_darah),
    riwayat_penyakit: teksAtauNull(isian.riwayat_penyakit),
    tinggi_badan: angkaAtauNull(isian.tinggi_badan),
    berat_badan: angkaAtauNull(isian.berat_badan),
    imunisasi: isian.imunisasi,
    imunisasi_lainnya: teksAtauNull(isian.imunisasi_lainnya),
    ciri_khusus: teksAtauNull(isian.ciri_khusus),
    kontak_utama: pilihanAtauNull(isian.kontak_utama),
    ayah: orangTua("ayah"),
    ibu: orangTua("ibu"),
    wali: keBodyOrangTua("wali", isian.wali, isian.ada_wali),
  };
}
