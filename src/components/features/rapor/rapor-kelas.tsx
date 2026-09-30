"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsNumberLiteral, useQueryState } from "nuqs";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { pesanError } from "@/lib/api/errors";
import { useDetailKelas, useKelasAktif } from "@/lib/api/kelas";
import { RAPOR_SATU_KELAS, useBuatRapor, useDaftarRapor } from "@/lib/api/rapor";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { LABEL_STATUS_RAPOR } from "@/lib/constants/label";
import { NADA_STATUS_RAPOR } from "@/lib/constants/status";
import { cn } from "@/lib/utils";
import type { KelasDetail, Rapor } from "@/types/domain";

const SEMESTER = [1, 2] as const;

function BarisMurid({ murid, rapor, semester }: { murid: KelasDetail["murid"][number]; rapor: Rapor | undefined; semester: 1 | 2 }) {
  const router = useRouter();
  const buat = useBuatRapor();

  return (
    <li className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-bold">{murid.nama_lengkap}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{murid.nis}</p>
      </div>
      {rapor ? (
        <>
          <StatusBadge nada={NADA_STATUS_RAPOR[rapor.status]}>{LABEL_STATUS_RAPOR[rapor.status]}</StatusBadge>
          <Link href={`/mudarris/rapor/${rapor.id}`} className={buttonVariants({ size: "sm", variant: rapor.status === "draft" || rapor.status === "revisi" ? "default" : "outline" })}>
            {rapor.status === "draft" || rapor.status === "revisi" ? "Isi Rapor" : "Buka"}
          </Link>
        </>
      ) : (
        <>
          <StatusBadge nada="netral">Belum dibuat</StatusBadge>
          <Button
            size="sm"
            variant="outline"
            disabled={buat.isPending}
            onClick={() =>
              buat.mutate(
                { muridId: murid.id, semester },
                {
                  onSuccess: ({ data, message }) => {
                    toast.success(message);
                    router.push(`/mudarris/rapor/${data.id}`);
                  },
                  onError: (error) => toast.error(pesanError(error)),
                },
              )
            }
          >
            {buat.isPending ? "Membuat..." : "Buat Draft"}
          </Button>
        </>
      )}
    </li>
  );
}

function DaftarMuridKelas({ kelasId, semester }: { kelasId: number; semester: 1 | 2 }) {
  const kelas = useDetailKelas(kelasId);
  const rapor = useDaftarRapor({ halaman: 1, kelasId, semester, perHalaman: RAPOR_SATU_KELAS });

  if (kelas.isPending || rapor.isPending) return <Skeleton aria-label="Memuat murid" className="h-80 rounded-xl" />;
  if (kelas.isError || rapor.isError) {
    return <GalatMuat error={kelas.error ?? rapor.error} onCobaLagi={() => void Promise.all([kelas.refetch(), rapor.refetch()])} />;
  }

  const muridAktif = kelas.data.murid.filter((murid) => murid.status_kelas === "aktif");
  const raporPerMurid = new Map(rapor.data.data.map((item) => [item.murid.id, item]));
  const hitung = (status: Rapor["status"]) => rapor.data.data.filter((item) => item.status === status).length;

  if (muridAktif.length === 0) return <EmptyState judul={`Belum ada murid aktif di ${kelas.data.nama}.`} />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {muridAktif.length} murid · {hitung("terbit")} terbit · {hitung("diajukan")} menunggu review · {hitung("revisi")} perlu revisi ·{" "}
        {hitung("draft")} draft · {muridAktif.length - raporPerMurid.size} belum dibuat
      </p>
      <ul className={cn("divide-y divide-border rounded-xl border border-border bg-card shadow-sm", rapor.isPlaceholderData && "opacity-60")}>
        {muridAktif.map((murid) => (
          <BarisMurid key={murid.id} murid={murid} rapor={raporPerMurid.get(murid.id)} semester={semester} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Guru (dan Kepala Sekolah yang mengampu kelas): pilih kelas dan semester, lalu buat atau buka rapor tiap murid.
 * Kepala Sekolah mengirim `kelasDiampu` dari sesi, karena `GET /kelas` baginya berisi semua kelas.
 */
export function RaporKelas({ kelasDiampu }: { kelasDiampu?: { id: number; nama: string }[] }) {
  const kelas = useKelasAktif();
  const tahunAjaran = useDaftarTahunAjaran();
  const [kelasPilihan, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [semesterPilihan, setSemester] = useQueryState("semester", parseAsNumberLiteral(SEMESTER));

  if (!kelasDiampu && kelas.isPending) return <Skeleton aria-label="Memuat kelas" className="h-60 rounded-xl" />;
  if (!kelasDiampu && kelas.isError) return <GalatMuat error={kelas.error} onCobaLagi={() => void kelas.refetch()} />;
  const daftarKelas = kelasDiampu ?? kelas.data ?? [];
  if (daftarKelas.length === 0) {
    return <EmptyState judul="Anda belum mengampu kelas di tahun ajaran aktif." deskripsi="Rapor hanya bisa dibuat untuk murid di kelas yang Anda ampu." />;
  }

  const kelasId = kelasPilihan ?? daftarKelas[0].id;
  const semesterAktif = tahunAjaran.data?.find((ta) => ta.is_aktif)?.semester_aktif === 2 ? 2 : 1;
  const semester = semesterPilihan ?? semesterAktif;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {daftarKelas.length > 1 ? (
          <select
            aria-label="Pilih kelas"
            value={kelasId}
            onChange={(event) => void setKelasId(Number(event.target.value))}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm font-bold"
          >
            {daftarKelas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>
        ) : (
          <p className="font-heading font-bold">{daftarKelas[0].nama}</p>
        )}
        <SaringSegmen label="Semester" opsi={SEMESTER.map((nilai) => ({ nilai: String(nilai), label: `Semester ${nilai}` }))} nilai={String(semester)} onUbah={(nilai) => void setSemester(nilai === "2" ? 2 : 1)} />
      </div>
      <DaftarMuridKelas key={`${kelasId}-${semester}`} kelasId={kelasId} semester={semester} />
    </div>
  );
}
