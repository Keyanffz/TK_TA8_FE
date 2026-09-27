"use client";

import { useId } from "react";

import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type OpsiRadio<T extends string> = { nilai: T; label: string; keterangan?: string };

type KolomRadioProps<T extends string> = {
  label: string;
  opsi: readonly OpsiRadio<T>[];
  nilai: T | undefined;
  onUbah: (nilai: T) => void;
  error?: string;
  className?: string;
};

/** Pilihan tunggal untuk dipakai lewat `Controller` react-hook-form. */
export function KolomRadio<T extends string>({ label, opsi, nilai, onUbah, error, className }: KolomRadioProps<T>) {
  const id = useId();
  const adaKeterangan = opsi.some((item) => item.keterangan);

  return (
    <FieldSet data-invalid={error ? true : undefined}>
      <FieldLegend variant="label">{label}</FieldLegend>
      <RadioGroup
        value={nilai ?? ""}
        onValueChange={(pilihan) => {
          const cocok = opsi.find((item) => item.nilai === pilihan);
          if (cocok) onUbah(cocok.nilai);
        }}
        className={cn(adaKeterangan ? "grid gap-3 sm:grid-cols-2" : "flex flex-wrap gap-6", className)}
      >
        {opsi.map((item) => (
          <Field key={item.nilai} orientation="horizontal" className={adaKeterangan ? "items-start" : "w-auto"}>
            <RadioGroupItem value={item.nilai} id={`${id}-${item.nilai}`} className={adaKeterangan ? "mt-0.5" : undefined} />
            <div>
              <FieldLabel htmlFor={`${id}-${item.nilai}`} className={adaKeterangan ? undefined : "font-normal"}>
                {item.label}
              </FieldLabel>
              {item.keterangan ? <FieldDescription>{item.keterangan}</FieldDescription> : null}
            </div>
          </Field>
        ))}
      </RadioGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </FieldSet>
  );
}
