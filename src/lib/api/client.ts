import createClient from "openapi-fetch";

import { serialisasiQuery } from "@/lib/api/query-string";
import type { paths } from "@/types/api";

/** Client untuk komponen browser. Semua request lewat BFF /api/proxy. */
export const api = createClient<paths>({ baseUrl: "/api/proxy", querySerializer: serialisasiQuery });
