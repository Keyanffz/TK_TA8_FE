import { Mail, MapPin, Phone } from "lucide-react";

import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";
import type { ProfilSekolah } from "@/lib/api/pengaturan";
import { cn } from "@/lib/utils";

const HOST_PETA_DIIZINKAN = ["www.google.com", "maps.google.com"];

// Backend hanya memastikan https; di sini dibatasi ke embed Google Maps (B7).
function urlPetaAman(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && HOST_PETA_DIIZINKAN.includes(parsed.hostname) ? url : null;
  } catch {
    return null;
  }
}

export function BagianKontak({ profil }: { profil: ProfilSekolah }) {
  const peta = urlPetaAman(profil.mapsEmbedUrl);
  const telepon = profil.telepon?.replace(/[^\d+]/g, "");

  return (
    <section aria-labelledby="judul-kontak" id="kontak" className="relative isolate scroll-mt-16 bg-primary text-primary-foreground">
      <TepiBergelombang className="rotate-180 text-background" />
      <PolaGeometri className="-z-10 text-primary-foreground/[0.07]" />
      <div className={cn("mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20", peta && "md:grid-cols-2")}>
        <div>
          <JudulBagian id="judul-kontak" judul="Kontak" terang />
          <Muncul as="dl" efek="pop" className={cn("grid gap-6", !peta && "md:grid-cols-3")}>
            {profil.alamat ? (
              <div className="relative pl-8">
                <dt className="text-sm text-primary-foreground/85">
                  <MapPin aria-hidden="true" className="absolute top-0.5 left-0 size-5 text-bintang" />
                  Alamat
                </dt>
                <dd>{profil.alamat}</dd>
              </div>
            ) : null}
            {profil.telepon ? (
              <div className="relative pl-8">
                <dt className="text-sm text-primary-foreground/85">
                  <Phone aria-hidden="true" className="absolute top-0.5 left-0 size-5 text-bintang" />
                  Telepon
                </dt>
                <dd>
                  <a href={`tel:${telepon}`} className="font-bold underline-offset-4 hover:underline">
                    {profil.telepon}
                  </a>
                </dd>
              </div>
            ) : null}
            {profil.email ? (
              <div className="relative pl-8">
                <dt className="text-sm text-primary-foreground/85">
                  <Mail aria-hidden="true" className="absolute top-0.5 left-0 size-5 text-bintang" />
                  Email
                </dt>
                <dd>
                  <a href={`mailto:${profil.email}`} className="font-bold underline-offset-4 hover:underline">
                    {profil.email}
                  </a>
                </dd>
              </div>
            ) : null}
          </Muncul>
        </div>
        {peta ? (
          <iframe
            src={peta}
            title={`Peta lokasi ${profil.namaSekolah}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full rounded-lg border-4 border-card bg-card shadow-md"
          />
        ) : null}
      </div>
    </section>
  );
}
