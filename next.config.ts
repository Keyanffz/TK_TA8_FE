import type { NextConfig } from "next";

const beApiUrl = process.env.BE_API_URL;
if (!beApiUrl) {
  throw new Error("BE_API_URL belum diisi. Salin .env.example ke .env.local lalu isi nilainya.");
}

const beOrigin = new URL(beApiUrl).origin;
const beDiMesinLokal = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(beApiUrl).hostname);

const nextConfig: NextConfig = {
  images: {
    // File publik backend (galeri, logo, foto guru) disajikan dari /storage.
    remotePatterns: [new URL(`${beOrigin}/storage/**`)],
    // Optimizer menolak host IP lokal secara bawaan. Hanya dibuka saat backend
    // memang berjalan di mesin yang sama (pengembangan lokal).
    dangerouslyAllowLocalIP: beDiMesinLokal,
  },
};

export default nextConfig;
