"use client";

import { useState } from "react";

import { FormLoginStaff } from "@/components/features/auth/form-login-staff";
import { TombolMasukGoogle } from "@/components/features/auth/tombol-masuk-google";
import { useMasuk } from "@/components/features/auth/use-masuk";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Separator } from "@/components/ui/separator";
import { masukGoogle, masukStaff } from "@/lib/auth/masuk";

type CaraMasuk = "password" | "google";

/**
 * Satu form masuk untuk guru dan Kepala Sekolah: password (khusus Kepala
 * Sekolah) di atas, tombol Google di bawah. Kedua cara berbagi satu kotak
 * pesan yang menampilkan hasil percobaan terakhir, dan saling menahan selama
 * salah satunya diproses. Hitung mundur 429 tetap terpisah karena batas
 * percobaan di backend dihitung per endpoint.
 */
export function MasukStaff() {
  const [caraTerakhir, setCaraTerakhir] = useState<CaraMasuk>("password");
  const password = useMasuk({
    kirim: masukStaff,
    pesanGagal: () => "Email atau password salah. Periksa kembali, atau atur ulang lewat Lupa password. Guru masuk dengan Google.",
  });
  const google = useMasuk({
    kirim: masukGoogle,
    pesanGagal: (error) => error.errors?.credential?.[0] ?? error.message,
  });
  const pesan = caraTerakhir === "google" ? google.pesan : password.pesan;

  return (
    <div className="flex flex-col gap-6">
      {pesan ? <KotakPesan nada="bahaya">{pesan}</KotakPesan> : null}
      <FormLoginStaff
        masuk={(nilai) => {
          setCaraTerakhir("password");
          password.masuk(nilai);
        }}
        sedangMemeriksa={password.sedangMemeriksa}
        sisaJeda={password.sisaJeda}
        nonaktif={google.sedangMemeriksa}
      />
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        atau
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        <TombolMasukGoogle
          masuk={(credential) => {
            setCaraTerakhir("google");
            google.masuk(credential);
          }}
          sedangMemeriksa={google.sedangMemeriksa}
          sisaJeda={google.sisaJeda}
          nonaktif={password.sedangMemeriksa}
        />
        <p className="text-sm text-muted-foreground">Guru masuk dengan akun Google yang didaftarkan Kepala Sekolah.</p>
      </div>
    </div>
  );
}
