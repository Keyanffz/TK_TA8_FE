"use client";

import { HalamanGalat } from "@/components/shared/halaman-galat";

export default function ErrorPublik({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <HalamanGalat error={error} retry={retry} beranda="/" />;
}
