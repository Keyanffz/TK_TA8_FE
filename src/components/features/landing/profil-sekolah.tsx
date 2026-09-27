import Image from "next/image";

import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { JudulBagian } from "@/components/shared/judul-bagian";
import { KontenHtml } from "@/components/shared/konten-html";
import { Muncul } from "@/components/shared/muncul";
import { Bintang } from "@/components/shared/ornamen/bintang";
import { GAYA_MASKER_PERISAI } from "@/components/shared/ornamen/perisai";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import type { ProfilSekolah } from "@/lib/api/pengaturan";
import { NAUNGAN_SEKOLAH } from "@/lib/constants/sekolah";
import type { GuruPublik } from "@/types/domain";

type ProfilSekolahProps = {
  profil: ProfilSekolah;
  kepalaSekolah: GuruPublik | null;
};

function Sambutan({ html, kepalaSekolah }: { html: string; kepalaSekolah: GuruPublik | null }) {
  return (
    <div className="mb-16 grid gap-8 md:grid-cols-[240px_1fr] md:gap-12">
      <figure className="max-w-[240px]">
        {kepalaSekolah?.foto_url ? (
          <div className="relative aspect-square bg-primary-soft" style={GAYA_MASKER_PERISAI}>
            <Image src={kepalaSekolah.foto_url} alt={kepalaSekolah.nama} fill sizes="240px" className="object-cover" />
          </div>
        ) : (
          <AvatarInisial nama={kepalaSekolah?.nama ?? "Kepala Sekolah"} className="size-28 rounded-full text-xl" />
        )}
        {kepalaSekolah ? (
          <figcaption className="mt-3">
            <p className="font-bold">{kepalaSekolah.nama}</p>
            <p className="text-sm text-muted-foreground">{kepalaSekolah.jabatan}</p>
          </figcaption>
        ) : null}
      </figure>
      <div>
        <h3 className="mb-4 text-lg font-bold">Sambutan Kepala Sekolah</h3>
        <KontenHtml html={html} />
      </div>
    </div>
  );
}

function VisiMisi({ visi, misi }: { visi: string | null; misi: string[] }) {
  return (
    <div className="relative isolate overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground md:p-10">
      <PolaGeometri className="-z-10 text-primary-foreground/[0.08]" />
      <div className="grid gap-10 md:grid-cols-2">
        {visi ? (
          <div>
            <h3 className="font-heading text-sm font-bold tracking-widest text-bintang uppercase">Visi</h3>
            <p className="mt-3 font-heading text-xl leading-snug font-bold">{visi}</p>
          </div>
        ) : null}
        {misi.length > 0 ? (
          <div>
            <h3 className="font-heading text-sm font-bold tracking-widest text-bintang uppercase">Misi</h3>
            <Muncul as="ol" efek="geser" className="mt-4 space-y-4">
              {misi.map((isi, indeks) => (
                <li key={isi} className="flex gap-3">
                  <span className="relative flex size-8 shrink-0 items-center justify-center">
                    <Bintang className="putar-saat-hover absolute inset-0 size-8" />
                    <span className="relative font-heading text-sm font-extrabold text-highlight-foreground">
                      {indeks + 1}
                    </span>
                  </span>
                  <span className="pt-1">{isi}</span>
                </li>
              ))}
            </Muncul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BagianProfil({ profil, kepalaSekolah }: ProfilSekolahProps) {
  const adaVisiMisi = profil.visi !== null || profil.misi.length > 0;

  return (
    <section aria-labelledby="judul-profil" className="scroll-mt-16" id="profil">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-profil" judul="Profil Sekolah" deskripsi={`${profil.namaSekolah}, bagian dari ${NAUNGAN_SEKOLAH}.`} />
        {profil.sambutanKepsek ? <Sambutan html={profil.sambutanKepsek} kepalaSekolah={kepalaSekolah} /> : null}
        {adaVisiMisi ? <VisiMisi visi={profil.visi} misi={profil.misi} /> : null}
        {profil.sejarah ? (
          <div className="mt-16">
            <h3 className="mb-4 text-lg font-bold">Sejarah Singkat</h3>
            <KontenHtml html={profil.sejarah} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
