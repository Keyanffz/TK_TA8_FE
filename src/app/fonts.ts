import { Andika, Baloo_2 } from "next/font/google";

// Andika dirancang SIL untuk pembaca pemula (bentuk a dan g seperti tulisan tangan
// di sekolah, l/I/1 mudah dibedakan). Hanya punya bobot 400 dan 700.
const andika = Andika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-andika",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

/** Kelas variabel font untuk <html>, dipakai root layout dan global-error yang menggantikannya saat gagal. */
export const KELAS_FONT = `${andika.variable} ${baloo.variable}`;
