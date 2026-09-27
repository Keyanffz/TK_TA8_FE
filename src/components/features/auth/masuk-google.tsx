"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { pesanError } from "@/lib/api/errors";
import { masukDenganGoogle, tujuanSetelahMasuk } from "@/lib/auth/masuk";

const LEBAR_TOMBOL_GOOGLE = 320;

export function MasukGoogle({ clientId }: { clientId: string | undefined }) {
  if (!clientId) {
    return (
      <KotakPesan nada="menunggu" judul="Masuk dengan Google belum bisa dipakai">
        Sekolah belum menyelesaikan pengaturan login Google. Hubungi pihak sekolah untuk informasi lebih lanjut.
      </KotakPesan>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId} locale="id">
      <TombolGoogle />
    </GoogleOAuthProvider>
  );
}

function TombolGoogle() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [pesan, setPesan] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: masukDenganGoogle,
    onSuccess: (user) => {
      router.replace(tujuanSetelahMasuk(user, next));
      router.refresh();
    },
    onError: (error) => setPesan(pesanError(error)),
  });

  return (
    <div className="flex flex-col gap-4">
      {pesan ? <KotakPesan nada="bahaya">{pesan}</KotakPesan> : null}
      {mutation.isPending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Memproses akun Google Anda...
        </p>
      ) : (
        <GoogleLogin
          onSuccess={({ credential }) => {
            setPesan(null);
            if (credential) {
              mutation.mutate(credential);
            } else {
              setPesan("Google tidak mengirim data akun. Coba lagi.");
            }
          }}
          onError={() => setPesan("Masuk dengan Google dibatalkan atau gagal. Coba lagi.")}
          text="signin_with"
          shape="rectangular"
          size="large"
          width={LEBAR_TOMBOL_GOOGLE}
        />
      )}
    </div>
  );
}
