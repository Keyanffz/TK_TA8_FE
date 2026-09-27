"use client";

import { toast } from "sonner";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useSetujuiGuru, useTolakGuru } from "@/lib/api/guru";

/** Setujui / tolak pendaftaran guru (status pending), dipakai di daftar dan detail. */
export function AksiPersetujuanGuru({ id, nama }: { id: number; nama: string }) {
  const setujui = useSetujuiGuru();
  const tolak = useTolakGuru();

  return (
    <div className="flex flex-wrap gap-2">
      <DialogKonfirmasi
        pemicu={<Button size="sm">Setujui Guru</Button>}
        judul={`Setujui ${nama}?`}
        deskripsi="Akun menjadi aktif dan guru menerima email pemberitahuan. Setelah itu guru bisa masuk dengan email dan password yang didaftarkan."
        labelAksi="Setujui Guru"
        onKonfirmasi={async () => {
          await setujui.mutateAsync(id);
          toast.success(`${nama} sudah disetujui.`);
        }}
      />
      <DialogKonfirmasi
        pemicu={
          <Button size="sm" variant="outline">
            Tolak
          </Button>
        }
        judul={`Tolak pendaftaran ${nama}?`}
        deskripsi="Alasan ditampilkan saat guru mencoba masuk."
        labelAksi="Tolak Pendaftaran"
        labelAlasan="Alasan penolakan"
        berbahaya
        onKonfirmasi={async (alasan) => {
          await tolak.mutateAsync({ id, alasan });
          toast.success(`Pendaftaran ${nama} ditolak.`);
        }}
      />
    </div>
  );
}
