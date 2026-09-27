import type { NilaiPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";
import { LABEL_HUBUNGAN, LABEL_JENIS_KELAMIN, LABEL_TINGKAT } from "@/lib/constants/label";
import { formatTanggal } from "@/lib/format";

type Baris = { label: string; nilai: string };

function Bagian({ judul, baris, onUbah }: { judul: string; baris: readonly Baris[]; onUbah: () => void }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-heading font-bold">{judul}</h3>
        <button type="button" onClick={onUbah} className="min-h-11 px-2 font-heading text-sm font-bold text-primary-strong hover:underline">
          Ubah
        </button>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {baris.map(({ label, nilai }) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold break-words">{nilai || "-"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Langkah terakhir: isian dibaca ulang sebelum dikirim, dengan tombol kembali ke langkahnya. */
export function RingkasanPendaftaran({ nilai, keLangkah }: { nilai: NilaiPendaftaran; keLangkah: (indeks: number) => void }) {
  const dokumen = [...nilai.akta_kelahiran, ...nilai.kartu_keluarga, ...nilai.pas_foto, ...nilai.lainnya];

  return (
    <div className="flex flex-col gap-4">
      <Bagian
        judul="Data anak"
        onUbah={() => keLangkah(0)}
        baris={[
          { label: "Nama lengkap", nilai: nilai.nama_lengkap },
          { label: "Nama panggilan", nilai: nilai.nama_panggilan },
          { label: "Jenis kelamin", nilai: LABEL_JENIS_KELAMIN[nilai.jenis_kelamin] },
          { label: "Tempat, tanggal lahir", nilai: `${nilai.tempat_lahir}, ${formatTanggal(nilai.tanggal_lahir)}` },
          { label: "NIK", nilai: nilai.nik },
          { label: "Agama", nilai: nilai.agama },
          { label: "Mendaftar ke", nilai: LABEL_TINGKAT[nilai.tingkat_tujuan] },
        ]}
      />
      <Bagian
        judul="Orang tua"
        onUbah={() => keLangkah(1)}
        baris={[
          { label: "Pengisi formulir", nilai: LABEL_HUBUNGAN[nilai.hubungan] },
          { label: "Nomor HP", nilai: nilai.no_hp },
          { label: "Nama ayah", nilai: nilai.nama_ayah },
          { label: "Pekerjaan ayah", nilai: nilai.pekerjaan_ayah },
          { label: "Nama ibu", nilai: nilai.nama_ibu },
          { label: "Pekerjaan ibu", nilai: nilai.pekerjaan_ibu },
          { label: "Alamat", nilai: nilai.alamat },
        ]}
      />
      <Bagian
        judul="Dokumen"
        onUbah={() => keLangkah(2)}
        baris={dokumen.map((file, indeks) => ({ label: `File ${indeks + 1}`, nilai: file.name }))}
      />
    </div>
  );
}
