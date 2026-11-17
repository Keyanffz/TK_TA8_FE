import { LANGKAH } from "@/components/features/formulir-murid/label-field";
import { sudahMeninggal, type IsianFormulir, type IsianOrangTua } from "@/components/features/formulir-murid/skema";
import {
  LABEL_GOLONGAN_DARAH,
  LABEL_HUBUNGAN_WALI,
  LABEL_IMUNISASI,
  LABEL_KEWARGANEGARAAN,
  LABEL_PEKERJAAN,
  LABEL_PENDIDIKAN,
  LABEL_PENGHASILAN,
  LABEL_STATUS_ORANG_TUA,
} from "@/lib/constants/formulir";
import { LABEL_JENIS_KELAMIN, LABEL_PERAN_ORANG_TUA } from "@/lib/constants/label";
import { formatTanggal } from "@/lib/format";
import type { Hubungan } from "@/types/domain";

type Baris = readonly [label: string, nilai: string];

function Bagian({ judul, baris, onUbah }: { judul: string; baris: readonly Baris[]; onUbah?: () => void }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-heading font-bold">{judul}</h3>
        {onUbah ? (
          <button type="button" onClick={onUbah} className="min-h-11 px-2 font-heading text-sm font-bold text-primary-strong hover:underline">
            Ubah
          </button>
        ) : null}
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {baris.map(([label, nilai]) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold break-words whitespace-pre-line">{nilai.trim() || "-"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const pilihan = <T extends string>(nilai: T | "", label: Record<T, string>) => (nilai === "" ? "" : label[nilai]);
const satuan = (nilai: string, akhiran: string) => (nilai === "" ? "" : `${nilai} ${akhiran}`);
const gabung = (...bagian: string[]) => bagian.filter((isi) => isi.trim() !== "").join(", ");

function barisOrangTua(peran: Hubungan, orang: IsianOrangTua, meninggal: boolean): Baris[] {
  if (meninggal) return [["Nama", orang.nama], ["Keterangan", "Sudah meninggal"]];
  return [
    peran === "wali"
      ? ["Hubungan dengan anak", orang.hubungan === "lainnya" ? orang.hubungan_lainnya : pilihan(orang.hubungan, LABEL_HUBUNGAN_WALI)]
      : ["Status", pilihan(orang.status, LABEL_STATUS_ORANG_TUA)],
    ["Nama", orang.nama],
    ["Tempat, tanggal lahir", gabung(orang.tempat_lahir, orang.tanggal_lahir ? formatTanggal(orang.tanggal_lahir) : "")],
    ["Agama", orang.agama],
    ["Kewarganegaraan", pilihan(orang.kewarganegaraan, LABEL_KEWARGANEGARAAN)],
    ["Pendidikan terakhir", pilihan(orang.pendidikan_terakhir, LABEL_PENDIDIKAN)],
    ["Pekerjaan", orang.pekerjaan === "lainnya" ? orang.pekerjaan_lainnya : pilihan(orang.pekerjaan, LABEL_PEKERJAAN)],
    ["Penghasilan per bulan", pilihan(orang.penghasilan, LABEL_PENGHASILAN)],
    ["Alamat rumah", orang.alamat_sama_dengan_anak ? "Sama dengan alamat anak" : orang.alamat_rumah],
    ["Alamat kantor", orang.alamat_kantor],
    ["Nomor HP", orang.no_hp],
  ];
}

type RingkasanFormulirProps = {
  isian: IsianFormulir;
  /** NIK hanya untuk pengguna yang menerimanya dari backend. */
  tampilkanNik: boolean;
  /** Tombol Ubah per bagian di langkah Konfirmasi wizard. */
  keLangkah?: (indeks: number) => void;
  /** Data di luar formulir resmi (NISN, tanggal masuk, catatan khusus) di form staf. */
  dataSekolah?: readonly Baris[];
};

/** Isian formulir data murid dalam bentuk baca saja, dikelompokkan seperti langkah wizard. */
export function RingkasanFormulir({ isian, tampilkanNik, keLangkah, dataSekolah }: RingkasanFormulirProps) {
  const ubah = (langkah: number) => (keLangkah ? () => keLangkah(langkah) : undefined);
  const peranTampil: Hubungan[] = isian.ada_wali ? ["ayah", "ibu", "wali"] : ["ayah", "ibu"];

  return (
    <div className="flex flex-col gap-4">
      <Bagian
        judul="Data anak"
        onUbah={ubah(LANGKAH.dataAnak)}
        baris={[
          ["Nama lengkap", isian.nama_lengkap],
          ["Nama panggilan", isian.nama_panggilan],
          ["Jenis kelamin", LABEL_JENIS_KELAMIN[isian.jenis_kelamin]],
          ["Tempat, tanggal lahir", gabung(isian.tempat_lahir, isian.tanggal_lahir ? formatTanggal(isian.tanggal_lahir) : "")],
          ...(tampilkanNik ? [["NIK", isian.nik] as const] : []),
          ["Agama", isian.agama],
          ["Kewarganegaraan", pilihan(isian.kewarganegaraan, LABEL_KEWARGANEGARAAN)],
          ["Anak ke-", isian.anak_ke],
          ["Saudara kandung, tiri, angkat", gabung(isian.jumlah_saudara_kandung, isian.jumlah_saudara_tiri, isian.jumlah_saudara_angkat)],
          ["Bahasa sehari-hari", isian.bahasa_sehari_hari],
          ["Asal sekolah", isian.asal_sekolah],
          ["Alamat", gabung(isian.alamat, isian.desa_kelurahan, isian.kecamatan, isian.kabupaten_kota, isian.provinsi)],
          ["Jarak rumah ke sekolah", satuan(isian.jarak_rumah_km, "km")],
        ]}
      />
      {dataSekolah ? <Bagian judul="Data sekolah" onUbah={ubah(LANGKAH.dataAnak)} baris={dataSekolah} /> : null}
      <Bagian
        judul="Kesehatan"
        onUbah={ubah(LANGKAH.kesehatan)}
        baris={[
          ["Golongan darah", pilihan(isian.golongan_darah, LABEL_GOLONGAN_DARAH)],
          ["Tinggi dan berat badan", gabung(satuan(isian.tinggi_badan, "cm"), satuan(isian.berat_badan, "kg"))],
          ["Imunisasi", gabung(...isian.imunisasi.map((nilai) => LABEL_IMUNISASI[nilai]), isian.imunisasi_lainnya)],
          ["Penyakit yang pernah diderita", isian.riwayat_penyakit],
          ["Ciri-ciri khusus", isian.ciri_khusus],
        ]}
      />
      {peranTampil.map((peran) => (
        <Bagian
          key={peran}
          judul={LABEL_PERAN_ORANG_TUA[peran]}
          onUbah={ubah(LANGKAH.orangTua)}
          baris={barisOrangTua(peran, isian[peran], sudahMeninggal(peran, isian.status_yatim_piatu))}
        />
      ))}
      <Bagian
        judul="Kontak utama"
        onUbah={ubah(LANGKAH.orangTua)}
        baris={[
          ["Kontak utama", pilihan(isian.kontak_utama, LABEL_PERAN_ORANG_TUA)],
          ...(isian.ada_wali ? [] : [["Wali (selain ayah dan ibu)", "Tidak diisi"] as const]),
        ]}
      />
    </div>
  );
}
