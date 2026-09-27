"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Redo2, Underline, Undo2, Unlink, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type EditorTeksProps = {
  label: string;
  nilai: string;
  onUbah: (html: string) => void;
  deskripsi?: string;
  error?: string;
};

function TombolAlat({ label, ikon: Ikon, aktif, onClick, disabled }: { label: string; ikon: LucideIcon; aktif?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={aktif}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-40",
        aktif ? "bg-primary text-primary-foreground" : "hover:bg-muted",
      )}
    >
      <Ikon aria-hidden="true" className="size-4" />
    </button>
  );
}

/**
 * Teks berformat (B1: Tiptap StarterKit, yang di v3 sudah memuat Link dan Underline) untuk
 * pengumuman dan konten CMS. Hasilnya HTML; backend menyanitasinya sebelum disimpan.
 */
export function EditorTeks({ label, nilai, onUbah, deskripsi, error }: EditorTeksProps) {
  const id = useId();
  const [tautan, setTautan] = useState("");
  const [popoverTerbuka, setPopoverTerbuka] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false, link: { openOnClick: false, defaultProtocol: "https" } })],
    content: nilai,
    // Next.js merender komponen ini di server juga; editor baru dibuat setelah hydration.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-label": label,
        "aria-multiline": "true",
        "aria-invalid": error ? "true" : "false",
        class: "konten-html min-h-48 max-w-none px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor: aktif }) => onUbah(aktif.isEmpty ? "" : aktif.getHTML()),
  });
  const status = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            tebal: e.isActive("bold"),
            miring: e.isActive("italic"),
            garisBawah: e.isActive("underline"),
            subjudul: e.isActive("heading", { level: 2 }),
            poin: e.isActive("bulletList"),
            nomor: e.isActive("orderedList"),
            tautan: e.isActive("link"),
            bisaUndo: e.can().undo(),
            bisaRedo: e.can().redo(),
          }
        : null,
  });

  const pasangTautan = () => {
    if (!editor) return;
    const alamat = tautan.trim();
    if (alamat === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: /^https?:\/\//.test(alamat) ? alamat : `https://${alamat}` }).run();
    setPopoverTerbuka(false);
  };

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id} onClick={() => editor?.commands.focus()}>
        {label}
      </FieldLabel>
      <div className={cn("overflow-hidden rounded-md border bg-card focus-within:ring-2 focus-within:ring-ring/40", error ? "border-destructive" : "border-input")}>
        <div role="toolbar" aria-label={`Format ${label}`} className="flex flex-wrap gap-0.5 border-b border-border bg-muted/50 p-1">
          <TombolAlat label="Tebal" ikon={Bold} aktif={status?.tebal} onClick={() => editor?.chain().focus().toggleBold().run()} />
          <TombolAlat label="Miring" ikon={Italic} aktif={status?.miring} onClick={() => editor?.chain().focus().toggleItalic().run()} />
          <TombolAlat label="Garis bawah" ikon={Underline} aktif={status?.garisBawah} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
          <TombolAlat label="Subjudul" ikon={Heading2} aktif={status?.subjudul} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
          <TombolAlat label="Daftar poin" ikon={List} aktif={status?.poin} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
          <TombolAlat label="Daftar bernomor" ikon={ListOrdered} aktif={status?.nomor} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
          <Popover
            open={popoverTerbuka}
            onOpenChange={(buka) => {
              setPopoverTerbuka(buka);
              if (buka) setTautan(editor?.getAttributes("link").href ?? "");
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Tautan"
                title="Tautan"
                aria-pressed={status?.tautan}
                className={cn("flex size-9 items-center justify-center rounded-md", status?.tautan ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              >
                <Link2 aria-hidden="true" className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <form
                className="flex flex-col gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  pasangTautan();
                }}
              >
                <label htmlFor={`${id}-tautan`} className="text-sm font-bold">
                  Alamat tautan
                </label>
                <Input id={`${id}-tautan`} value={tautan} onChange={(event) => setTautan(event.target.value)} placeholder="https://" />
                <p className="text-xs text-muted-foreground">Pilih teks lebih dulu. Kosongkan untuk melepas tautan.</p>
                <Button type="submit" size="sm" className="self-start">
                  Pasang Tautan
                </Button>
              </form>
            </PopoverContent>
          </Popover>
          {status?.tautan ? <TombolAlat label="Lepas tautan" ikon={Unlink} onClick={() => editor?.chain().focus().unsetLink().run()} /> : null}
          <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />
          <TombolAlat label="Urungkan" ikon={Undo2} disabled={!status?.bisaUndo} onClick={() => editor?.chain().focus().undo().run()} />
          <TombolAlat label="Ulangi" ikon={Redo2} disabled={!status?.bisaRedo} onClick={() => editor?.chain().focus().redo().run()} />
        </div>
        <EditorContent editor={editor} />
      </div>
      {deskripsi ? <FieldDescription>{deskripsi}</FieldDescription> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
