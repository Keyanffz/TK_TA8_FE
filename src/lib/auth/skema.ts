import { z } from "zod";

// Aturan sama dengan backend: password minimal 8 karakter berisi huruf dan
// angka (Password::defaults()), nomor HP diawali 08 dengan 10–15 digit.
export const skemaEmail = z
  .string()
  .trim()
  .min(1, "Email wajib diisi.")
  .pipe(z.email("Format email belum benar, contoh: nama@gmail.com."));

export const skemaPasswordBaru = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .regex(/[A-Za-z]/, "Password harus berisi huruf.")
  .regex(/\d/, "Password harus berisi angka.");

export const skemaNomorHp = z
  .string()
  .trim()
  .regex(/^08\d{8,13}$/, "Nomor HP diawali 08 dan berisi 10–15 angka.");
