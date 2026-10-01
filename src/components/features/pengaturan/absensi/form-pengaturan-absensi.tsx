"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { useLokasi } from "@/components/features/absensi/use-lokasi";
import { DaftarTanggalLibur } from "@/components/features/pengaturan/absensi/daftar-tanggal-libur";
import {
  FIELD_PER_KUNCI,
  keItemsPengaturan,
  nilaiAwalForm,
  skemaFormAbsensi,
  teksKoordinat,
  type KeluaranFormAbsensi,
  type MasukanFormAbsensi,
} from "@/components/features/pengaturan/absensi/skema-pengaturan-absensi";
import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, pesanError } from "@/lib/api/errors";
import { skemaAbsensi, usePengaturan, useSimpanPengaturan, type PengaturanAbsensi } from "@/lib/api/pengaturan-dashboard";
import { HARI_ISO } from "@/lib/constants/label";
import { usePeringatanBelumDisimpan } from "@/lib/use-peringatan-belum-disimpan";
import { cn } from "@/lib/utils";

const PetaLokasiSekolah = dynamic(() => import("@/components/features/pengaturan/absensi/peta-lokasi-sekolah").then((modul) => modul.PetaLokasiSekolah), {
  ssr: false,
  loading: () => <Skeleton className="h-72 rounded-lg sm:h-96" />,
});

const KELAS_BAGIAN = "rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5";

function FormIsi({ awal }: { awal: PengaturanAbsensi }) {
  const simpan = useSimpanPengaturan("absensi");
  const lokasiSaya = useLokasi();
  const form = useForm<MasukanFormAbsensi, unknown, KeluaranFormAbsensi>({ resolver: zodResolver(skemaFormAbsensi), defaultValues: nilaiAwalForm(awal) });
  const { errors, isDirty, isSubmitting } = form.formState;
  const [latitude, longitude, radius] = useWatch({ control: form.control, name: ["latitude", "longitude", "radius_meter"] });
  usePeringatanBelumDisimpan(isDirty);

  const titik = latitude.trim() !== "" && longitude.trim() !== "" && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    ? { latitude: Number(latitude), longitude: Number(longitude) }
    : null;
  const radiusPeta = Number.isFinite(Number(radius)) && Number(radius) > 0 ? Number(radius) : awal["absensi.radius_meter"];

  const pindahTitik = ({ latitude: lat, longitude: lng }: { latitude: number; longitude: number }) => {
    form.setValue("latitude", teksKoordinat(lat), { shouldDirty: true, shouldValidate: true });
    form.setValue("longitude", teksKoordinat(lng), { shouldDirty: true, shouldValidate: true });
  };

  // Hasil "Pakai Lokasi Saya" datang belakangan, jadi dipasang ke form saat lokasinya sudah didapat.
  const posisiSaya = lokasiSaya.lokasi.tahap === "dapat" ? lokasiSaya.lokasi.posisi : null;
  useEffect(() => {
    if (!posisiSaya) return;
    form.setValue("latitude", teksKoordinat(posisiSaya.latitude), { shouldDirty: true, shouldValidate: true });
    form.setValue("longitude", teksKoordinat(posisiSaya.longitude), { shouldDirty: true, shouldValidate: true });
  }, [posisiSaya, form]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync(keItemsPengaturan(nilai));
      form.reset(form.getValues());
      toast.success("Pengaturan absensi tersimpan dan langsung berlaku.");
    } catch (error) {
      const pesanPerKunci = error instanceof ApiError ? Object.entries(error.errors ?? {}) : [];
      let terpasang = false;
      for (const [kunci, pesan] of pesanPerKunci) {
        const field = FIELD_PER_KUNCI.find(([awalan]) => kunci === awalan || kunci.startsWith(`${awalan}.`))?.[1];
        if (field && pesan[0]) {
          form.setError(field, { type: "server", message: pesan[0] });
          terpasang = true;
        }
      }
      if (!terpasang) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      <section aria-labelledby="judul-lokasi" className={KELAS_BAGIAN}>
        <h2 id="judul-lokasi" className="text-lg font-extrabold">
          Lokasi sekolah
        </h2>
        <p className="mt-1 mb-4 max-w-prose text-sm text-muted-foreground">
          Ketuk peta atau geser penanda ke gedung sekolah. Absen hanya diterima di dalam lingkaran. Selama titik belum diisi, absen belum bisa dilakukan.
        </p>
        <PetaLokasiSekolah titik={titik} radius={radiusPeta} onPindah={pindahTitik} />
        <FieldGroup className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomTeks label="Latitude" inputMode="decimal" placeholder="-6.990300" error={errors.latitude?.message} {...form.register("latitude")} />
            <KolomTeks label="Longitude" inputMode="decimal" placeholder="110.422900" error={errors.longitude?.message} {...form.register("longitude")} />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" className="self-start" disabled={lokasiSaya.lokasi.tahap === "mencari"} onClick={lokasiSaya.cari}>
              <LocateFixed aria-hidden="true" />
              {lokasiSaya.lokasi.tahap === "mencari" ? "Mencari lokasi..." : "Pakai Lokasi Saya"}
            </Button>
            <p className="text-sm text-muted-foreground">Pakai tombol ini saat Anda sedang berada di sekolah, lalu rapikan posisi penanda di peta.</p>
            {lokasiSaya.lokasi.tahap === "gagal" ? <KotakPesan nada="bahaya">{lokasiSaya.lokasi.pesan}</KotakPesan> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomTeks
              label="Radius absen (meter)"
              type="number"
              inputMode="numeric"
              min={10}
              max={5000}
              deskripsi="Jarak paling jauh dari titik sekolah."
              error={errors.radius_meter?.message}
              {...form.register("radius_meter")}
            />
            <KolomTeks
              label="Batas akurasi GPS (meter)"
              type="number"
              inputMode="numeric"
              min={5}
              max={1000}
              deskripsi="Absen ditolak kalau perkiraan lokasi HP lebih kasar dari angka ini."
              error={errors.batas_akurasi_meter?.message}
              {...form.register("batas_akurasi_meter")}
            />
          </div>
        </FieldGroup>
      </section>

      <section aria-labelledby="judul-jam" className={KELAS_BAGIAN}>
        <h2 id="judul-jam" className="mb-4 text-lg font-extrabold">
          Jam absen
        </h2>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">Masuk</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-3">
              <KolomTeks label="Jam buka" type="time" error={errors.masuk_buka?.message} {...form.register("masuk_buka")} />
              <KolomTeks label="Batas terlambat" type="time" deskripsi="Absen setelah jam ini tercatat terlambat." error={errors.masuk_batas_terlambat?.message} {...form.register("masuk_batas_terlambat")} />
              <KolomTeks label="Jam tutup" type="time" deskripsi="Setelah jam ini, yang belum absen ditandai tidak hadir." error={errors.masuk_tutup?.message} {...form.register("masuk_tutup")} />
            </div>
          </FieldSet>
          <FieldSet>
            <FieldLegend variant="label">Pulang</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-3">
              <KolomTeks label="Jam buka" type="time" error={errors.pulang_buka?.message} {...form.register("pulang_buka")} />
              <KolomTeks label="Jam tutup" type="time" error={errors.pulang_tutup?.message} {...form.register("pulang_tutup")} />
            </div>
          </FieldSet>
        </FieldGroup>
      </section>

      <section aria-labelledby="judul-hari" className={KELAS_BAGIAN}>
        <h2 id="judul-hari" className="mb-4 text-lg font-extrabold">
          Hari kerja dan libur
        </h2>
        <FieldGroup>
          <Controller
            control={form.control}
            name="hari_kerja"
            render={({ field }) => (
              <FieldSet data-invalid={errors.hari_kerja ? true : undefined}>
                <FieldLegend variant="label">Hari kerja</FieldLegend>
                <div className="flex flex-wrap gap-2">
                  {HARI_ISO.map(({ nomor, label }) => {
                    const aktif = field.value.includes(nomor);
                    return (
                      <button
                        key={nomor}
                        type="button"
                        aria-pressed={aktif}
                        onClick={() => field.onChange(aktif ? field.value.filter((hari) => hari !== nomor) : [...field.value, nomor].sort())}
                        className={cn(
                          "min-h-11 rounded-full border px-4 font-heading text-sm font-bold transition-colors duration-150",
                          aktif ? "border-transparent bg-primary text-primary-foreground" : "border-input bg-card hover:bg-muted",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {errors.hari_kerja ? <FieldError>{errors.hari_kerja.message}</FieldError> : null}
              </FieldSet>
            )}
          />
          <Controller
            control={form.control}
            name="tanggal_libur"
            render={({ field }) => <DaftarTanggalLibur tanggal={field.value} onUbah={field.onChange} error={errors.tanggal_libur?.message} />}
          />
        </FieldGroup>
      </section>

      <section aria-labelledby="judul-foto" className={KELAS_BAGIAN}>
        <h2 id="judul-foto" className="mb-4 text-lg font-extrabold">
          Foto absensi
        </h2>
        <KolomTeks
          label="Masa simpan foto (bulan)"
          type="number"
          inputMode="numeric"
          min={1}
          max={60}
          className="max-w-40"
          deskripsi="Foto yang lebih lama dihapus otomatis setiap malam. Catatan absensinya tetap ada."
          error={errors.masa_simpan_foto_bulan?.message}
          {...form.register("masa_simpan_foto_bulan")}
        />
      </section>

      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Pengaturan Absensi" />
    </form>
  );
}

/** Pengaturan absensi (grup `absensi`, A4), hanya untuk Kepala Sekolah. */
export function FormPengaturanAbsensi() {
  const { data, isPending, isError, error, refetch } = usePengaturan("absensi", (mentah) => skemaAbsensi.parse(mentah));

  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  return <FormIsi awal={data} />;
}
