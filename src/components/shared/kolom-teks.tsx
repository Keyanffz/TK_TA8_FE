"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type KolomTeksProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  deskripsi?: string;
  /** Tombol kecil di sisi kanan input, misalnya tampilkan password. */
  akhiran?: ReactNode;
};

/** Label + input + pesan error, dipakai bersama `register()` react-hook-form. */
export function KolomTeks({ label, error, deskripsi, akhiran, id, className, ...props }: KolomTeksProps) {
  const idCadangan = useId();
  const idInput = id ?? idCadangan;
  const idDeskripsi = `${idInput}-deskripsi`;
  const idError = `${idInput}-error`;
  const describedBy = [deskripsi ? idDeskripsi : null, error ? idError : null].filter(Boolean).join(" ");

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={idInput}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={idInput}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(akhiran ? "pr-12" : undefined, className)}
          {...props}
        />
        {akhiran ? <div className="absolute inset-y-0 right-1 flex items-center">{akhiran}</div> : null}
      </div>
      {deskripsi ? <FieldDescription id={idDeskripsi}>{deskripsi}</FieldDescription> : null}
      {error ? <FieldError id={idError}>{error}</FieldError> : null}
    </Field>
  );
}

/** KolomTeks untuk password dengan tombol tampilkan/sembunyikan. */
export function KolomPassword(props: Omit<KolomTeksProps, "type" | "akhiran">) {
  const [terlihat, setTerlihat] = useState(false);
  return (
    <KolomTeks
      {...props}
      type={terlihat ? "text" : "password"}
      akhiran={
        <button
          type="button"
          onClick={() => setTerlihat((nilai) => !nilai)}
          aria-label={terlihat ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={terlihat}
          className="flex size-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          {terlihat ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
        </button>
      }
    />
  );
}

type KolomAreaProps = ComponentProps<typeof Textarea> & { label: string; error?: string; deskripsi?: string };

/** Seperti KolomTeks, untuk isian beberapa baris (alamat). */
export function KolomArea({ label, error, deskripsi, id, ...props }: KolomAreaProps) {
  const idCadangan = useId();
  const idInput = id ?? idCadangan;
  const idDeskripsi = `${idInput}-deskripsi`;
  const idError = `${idInput}-error`;
  const describedBy = [deskripsi ? idDeskripsi : null, error ? idError : null].filter(Boolean).join(" ");

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={idInput}>{label}</FieldLabel>
      <Textarea id={idInput} aria-invalid={error ? true : undefined} aria-describedby={describedBy || undefined} {...props} />
      {deskripsi ? <FieldDescription id={idDeskripsi}>{deskripsi}</FieldDescription> : null}
      {error ? <FieldError id={idError}>{error}</FieldError> : null}
    </Field>
  );
}
