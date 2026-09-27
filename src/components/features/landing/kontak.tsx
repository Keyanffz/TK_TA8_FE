import { Mail, MapPin, Phone } from "lucide-react";

import { JudulBagian } from "@/components/shared/judul-bagian";
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
    <section aria-labelledby="judul-kontak" id="kontak" className="scroll-mt-16 border-t border-border">
      <div className={cn("mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24", peta && "md:grid-cols-2")}>
        <div>
          <JudulBagian id="judul-kontak" judul="Kontak" />
          <dl className={cn("grid gap-6", !peta && "md:grid-cols-3")}>
            {profil.alamat ? (
              <div className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Alamat</dt>
                  <dd>{profil.alamat}</dd>
                </div>
              </div>
            ) : null}
            {profil.telepon ? (
              <div className="flex gap-3">
                <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Telepon</dt>
                  <dd>
                    <a href={`tel:${telepon}`} className="hover:text-primary hover:underline">
                      {profil.telepon}
                    </a>
                  </dd>
                </div>
              </div>
            ) : null}
            {profil.email ? (
              <div className="flex gap-3">
                <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${profil.email}`} className="hover:text-primary hover:underline">
                      {profil.email}
                    </a>
                  </dd>
                </div>
              </div>
            ) : null}
          </dl>
        </div>
        {peta ? (
          <iframe
            src={peta}
            title={`Peta lokasi ${profil.namaSekolah}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full rounded-lg border border-border"
          />
        ) : null}
      </div>
    </section>
  );
}
