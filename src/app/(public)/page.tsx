import { BagianFasilitas } from "@/components/features/landing/fasilitas";
import { BagianGuru } from "@/components/features/landing/daftar-guru";
import { GaleriTerbaru } from "@/components/features/landing/galeri-terbaru";
import { Hero } from "@/components/features/landing/hero";
import { BagianKeunggulan } from "@/components/features/landing/keunggulan";
import { BagianKontak } from "@/components/features/landing/kontak";
import { BagianPengumumanAgenda } from "@/components/features/landing/pengumuman-agenda";
import { PitaPpdb } from "@/components/features/landing/pita-ppdb";
import { BagianProfil } from "@/components/features/landing/profil-sekolah";
import { BagianProgram } from "@/components/features/landing/program";
import {
  ambilAgendaMendatang,
  ambilDaftarGaleri,
  ambilDaftarPengumuman,
  ambilGuruPublik,
  ambilPpdbPublik,
  ambilProfilSekolah,
} from "@/lib/api/publik";

const JUMLAH_PENGUMUMAN = 3;
const JUMLAH_ALBUM = 5;
const JUMLAH_AGENDA = 4;
const JABATAN_KEPALA_SEKOLAH = "Kepala Sekolah";

export default async function LandingPage() {
  const [profil, guru, ppdb, pengumuman, galeri, agenda] = await Promise.all([
    ambilProfilSekolah(),
    ambilGuruPublik(),
    ambilPpdbPublik(),
    ambilDaftarPengumuman(1, JUMLAH_PENGUMUMAN),
    ambilDaftarGaleri(1, JUMLAH_ALBUM),
    ambilAgendaMendatang(JUMLAH_AGENDA),
  ]);
  const kepalaSekolah = guru.find((orang) => orang.jabatan === JABATAN_KEPALA_SEKOLAH) ?? null;
  const adaGuruBerfoto = guru.some((orang) => orang.foto_url);

  return (
    <>
      <Hero profil={profil} warnaTepi={ppdb.dibuka ? "text-highlight" : "text-background"} />
      {ppdb.dibuka ? (
        <PitaPpdb
          tahunAjaran={ppdb.tahun_ajaran?.nama ?? null}
          tanggalTutup={ppdb.tanggal_tutup}
          kuota={ppdb.kuota}
          sisaKuota={ppdb.sisa_kuota}
        />
      ) : null}
      <BagianProfil profil={profil} kepalaSekolah={kepalaSekolah} />
      {profil.program.length > 0 ? <BagianProgram program={profil.program} /> : null}
      {profil.keunggulan.length > 0 ? <BagianKeunggulan keunggulan={profil.keunggulan} /> : null}
      {profil.fasilitas.length > 0 ? <BagianFasilitas fasilitas={profil.fasilitas} /> : null}
      {adaGuruBerfoto ? <BagianGuru guru={guru} /> : null}
      {galeri.data.length > 0 ? <GaleriTerbaru album={galeri.data} /> : null}
      <BagianPengumumanAgenda pengumuman={pengumuman.data} agenda={agenda} />
      <BagianKontak profil={profil} />
    </>
  );
}
