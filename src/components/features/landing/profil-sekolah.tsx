import Image from "next/image";

import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { JudulBagian } from "@/components/shared/judul-bagian";
import { KontenHtml } from "@/components/shared/konten-html";
import type { ProfilSekolah } from "@/lib/api/pengaturan";
import { NAUNGAN_SEKOLAH } from "@/lib/constants/sekolah";
import type { GuruPublik } from "@/types/domain";

type ProfilSekolahProps = {
  profil: ProfilSekolah;
  kepalaSekolah: GuruPublik | null;
};

export function BagianProfil({ profil, kepalaSekolah }: ProfilSekolahProps) {
  const adaVisiMisi = profil.visi !== null || profil.misi.length > 0;

  return (
    <section aria-labelledby="judul-profil" className="scroll-mt-16" id="profil">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-profil" judul="Profil Sekolah" deskripsi={`${profil.namaSekolah}, bagian dari ${NAUNGAN_SEKOLAH}.`} />

        {profil.sambutanKepsek ? (
          <div className="mb-14 grid gap-8 md:grid-cols-[220px_1fr] md:gap-12">
            <figure className="max-w-[220px]">
              {kepalaSekolah?.foto_url ? (
                <Image
                  src={kepalaSekolah.foto_url}
                  alt={kepalaSekolah.nama}
                  width={220}
                  height={280}
                  className="aspect-[4/5] w-full rounded-lg object-cover"
                />
              ) : (
                <AvatarInisial nama={kepalaSekolah?.nama ?? "Kepala Sekolah"} className="aspect-[4/5] w-full rounded-lg text-2xl" />
              )}
              {kepalaSekolah ? (
                <figcaption className="mt-3">
                  <p className="font-semibold">{kepalaSekolah.nama}</p>
                  <p className="text-sm text-muted-foreground">{kepalaSekolah.jabatan}</p>
                </figcaption>
              ) : null}
            </figure>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Sambutan Kepala Sekolah</h3>
              <KontenHtml html={profil.sambutanKepsek} />
            </div>
          </div>
        ) : null}

        {adaVisiMisi ? (
          <div className="grid gap-10 rounded-xl border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10">
            {profil.visi ? (
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-primary-strong uppercase">Visi</h3>
                <p className="mt-3 font-heading text-lg leading-8 italic">{profil.visi}</p>
              </div>
            ) : null}
            {profil.misi.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-primary-strong uppercase">Misi</h3>
                <ol className="mt-3 space-y-4">
                  {profil.misi.map((misi, indeks) => (
                    <li key={misi} className="flex gap-4">
                      <span aria-hidden="true" className="w-8 shrink-0 font-heading text-lg font-semibold text-primary">
                        {String(indeks + 1).padStart(2, "0")}
                      </span>
                      <span className="pt-0.5">{misi}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}

        {profil.sejarah ? (
          <div className="mt-14">
            <h3 className="mb-4 text-lg font-semibold">Sejarah Singkat</h3>
            <KontenHtml html={profil.sejarah} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
