import { cn } from "@/lib/utils";

/**
 * Menampilkan HTML dari CMS/pengumuman. Backend sudah menyanitasi isinya
 * (stevebauman/purify) sebelum disimpan, jadi aman dirender langsung.
 */
export function KontenHtml({ html, className }: { html: string; className?: string }) {
  return <div className={cn("konten-html", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
