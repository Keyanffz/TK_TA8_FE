import { notFound } from "next/navigation";

// Alamat dashboard yang tidak dikenal ditampilkan di dalam kerangka dashboard
// (dashboard/not-found.tsx), bukan halaman 404 publik tanpa menu.
export default function RuteTidakDikenal() {
  notFound();
}
