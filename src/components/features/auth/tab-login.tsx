"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

import { FormLoginGuru } from "@/components/features/auth/form-login-guru";
import { MasukGoogle } from "@/components/features/auth/masuk-google";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB = ["wali", "guru"] as const;

export function TabLogin({ googleClientId }: { googleClientId: string | undefined }) {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB).withDefault("wali"));

  return (
    <Tabs
      value={tab}
      onValueChange={(nilai) => {
        const tujuan = TAB.find((pilihan) => pilihan === nilai);
        if (tujuan) void setTab(tujuan);
      }}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="wali">Orang Tua / Wali</TabsTrigger>
        <TabsTrigger value="guru">Guru & Kepala Sekolah</TabsTrigger>
      </TabsList>
      <TabsContent value="wali" className="mt-6 flex flex-col gap-5 text-base">
        <p className="text-muted-foreground">
          Wali murid masuk memakai akun Google. Saat pertama kali masuk, akun dibuat otomatis dan Anda diminta
          melengkapi nomor HP, alamat, dan pekerjaan.
        </p>
        <MasukGoogle clientId={googleClientId} />
      </TabsContent>
      <TabsContent value="guru" className="mt-6 text-base">
        <FormLoginGuru />
      </TabsContent>
    </Tabs>
  );
}
