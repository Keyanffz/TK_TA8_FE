import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { IlustrasiGuru, IlustrasiWali } from "@/components/features/auth/ilustrasi-login";
import { RUTE_LOGIN, urlLogin } from "@/lib/auth/rute-login";
import { amankanTujuan } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Masuk" };

type PilihanProps = {
  href: string;
  judul: string;
  keterangan: string;
  ilustrasi: ReactNode;
  className: string;
  urutan: number;
};

function Pilihan({ href, judul, keterangan, ilustrasi, className, urutan }: PilihanProps) {
  return (
    <li className="gerak-masuk" style={{ "--i": urutan } as CSSProperties}>
      <Link
        href={href}
        className={cn(
          "angkat group flex min-h-40 items-center gap-4 rounded-xl p-5 focus-visible:outline-offset-4 sm:p-6",
          className,
        )}
      >
        <div className="flex-1">
          <p className="font-heading text-lg leading-tight font-extrabold">{judul}</p>
          <p className="mt-2 text-sm">{keterangan}</p>
          <p className="mt-4 inline-flex items-center gap-1 font-heading font-bold">
            Masuk
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </p>
        </div>
        {ilustrasi}
      </Link>
    </li>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const tujuan = typeof next === "string" ? amankanTujuan(next) : null;

  return (
    <>
      <h1 className="gerak-masuk-naik text-xl font-extrabold">Masuk sebagai siapa?</h1>
      <p className="gerak-masuk-naik mt-2 mb-8 text-muted-foreground" style={{ "--i": 1 } as CSSProperties}>
        Pilih sesuai peran Anda di sekolah.
      </p>
      <ul className="grid gap-5">
        <Pilihan
          href={urlLogin(RUTE_LOGIN.wali, tujuan)}
          judul="Orang Tua / Wali Murid"
          keterangan="Masuk dengan akun Google untuk melihat tagihan, kegiatan kelas, dan rapor anak."
          ilustrasi={<IlustrasiWali className="w-28 shrink-0 sm:w-32" />}
          className="bg-highlight text-highlight-foreground"
          urutan={2}
        />
        <Pilihan
          href={urlLogin(RUTE_LOGIN.guru, tujuan)}
          judul="Guru & Kepala Sekolah"
          keterangan="Masuk dengan email dan password yang terdaftar di sekolah."
          ilustrasi={<IlustrasiGuru className="w-28 shrink-0 sm:w-32" />}
          className="bg-primary text-primary-foreground"
          urutan={3}
        />
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        Murid tidak punya akun sendiri. Semua informasi anak dibuka lewat akun orang tua atau wali.
      </p>
    </>
  );
}
