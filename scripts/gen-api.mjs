import { existsSync, readFileSync, writeFileSync } from "node:fs";

import openapiTS, { astToString, COMMENT_HEADER, NULL } from "openapi-typescript";
import ts from "typescript";

const specPath = process.env.API_SPEC_PATH;
const OUTPUT = "src/types/api.d.ts";
const OUTPUT_ENUM = "src/types/enum-api.ts";

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

const BLOB = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Blob"));

// Field `format: binary` (unggahan multipart, unduhan PDF/Excel) bawaannya
// menjadi `string`. Dijadikan Blob supaya File dari input bisa dikirim sebagai
// body openapi-fetch tanpa cast.
function transform(schemaObject) {
  if (schemaObject.format !== "binary") return undefined;
  const bolehNull = Array.isArray(schemaObject.type) && schemaObject.type.includes("null");
  return bolehNull ? ts.factory.createUnionTypeNode([BLOB, NULL]) : BLOB;
}

// Nilai enum di components.schemas untuk pilihan dropdown. Opsi `enumValues` openapi-typescript tidak dipakai
// karena ikut membuat ratusan konstanta kode error per endpoint, dan api.d.ts tidak boleh berisi nilai runtime.
function berkasEnum(spek) {
  const daftar = Object.entries(spek.components?.schemas ?? {}).filter(([, skema]) => Array.isArray(skema.enum));
  const isi = daftar.map(([nama, skema]) => `  ${nama}: ${JSON.stringify(skema.enum)},`).join("\n");
  const nama = daftar.map(([nama]) => JSON.stringify(nama)).join(" | ");
  return [
    "// Dibuat `npm run gen:api` dari enum di components.schemas api.json backend. Jangan diedit manual.",
    'import type { components } from "@/types/api";',
    "",
    'type Skema = components["schemas"];',
    "",
    "export const NILAI_ENUM = {",
    isi,
    `} as const satisfies { readonly [Nama in ${nama}]: readonly Skema[Nama][] };`,
    "",
  ].join("\n");
}

try {
  const sumber = isUrl ? await (await fetch(specPath)).text() : readFileSync(specPath, "utf8");
  const ast = await openapiTS(sumber, { transform });
  writeFileSync(OUTPUT, COMMENT_HEADER + astToString(ast));
  writeFileSync(OUTPUT_ENUM, berkasEnum(JSON.parse(sumber)));
  process.stdout.write(`${specPath} → ${OUTPUT}, ${OUTPUT_ENUM}\n`);
} catch (penyebab) {
  console.error(`openapi-typescript gagal: ${penyebab instanceof Error ? penyebab.message : String(penyebab)}`);
  process.exit(1);
}
