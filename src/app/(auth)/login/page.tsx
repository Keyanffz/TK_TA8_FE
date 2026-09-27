import type { Metadata } from "next";
import { Suspense } from "react";

import { TabLogin } from "@/components/features/auth/tab-login";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Masuk</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Pilih sesuai peran Anda di sekolah.</p>
      <Suspense>
        <TabLogin googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined} />
      </Suspense>
    </>
  );
}
