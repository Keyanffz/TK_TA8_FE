import { existsSync, readFileSync, writeFileSync } from "node:fs";

import openapiTS, { astToString, COMMENT_HEADER, NULL } from "openapi-typescript";
import ts from "typescript";

const specPath = process.env.API_SPEC_PATH;
const OUTPUT = "src/types/api.d.ts";

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

try {
  const sumber = isUrl ? new URL(specPath) : readFileSync(specPath, "utf8");
  const ast = await openapiTS(sumber, { transform });
  writeFileSync(OUTPUT, COMMENT_HEADER + astToString(ast));
  process.stdout.write(`${specPath} → ${OUTPUT}\n`);
} catch (penyebab) {
  console.error(`openapi-typescript gagal: ${penyebab instanceof Error ? penyebab.message : String(penyebab)}`);
  process.exit(1);
}
