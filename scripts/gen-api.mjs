import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const specPath = process.env.API_SPEC_PATH;

if (!specPath) {
  console.error(
    "API_SPEC_PATH belum diisi. Isi di .env.local dengan path atau URL api.json dari backend.",
  );
  process.exit(1);
}

const isUrl = /^https?:\/\//.test(specPath);
if (!isUrl && !existsSync(specPath)) {
  console.error(`File spesifikasi tidak ditemukan: ${specPath}`);
  process.exit(1);
}

const result = spawnSync(
  "openapi-typescript",
  [specPath, "--output", "src/types/api.d.ts"],
  { stdio: "inherit", shell: process.platform === "win32" },
);

if (result.error) {
  console.error(`openapi-typescript gagal dijalankan: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
