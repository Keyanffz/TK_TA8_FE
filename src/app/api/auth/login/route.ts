import type { NextRequest } from "next/server";

import { masukLewatBackend } from "@/lib/auth/bff";

export function POST(request: NextRequest) {
  return masukLewatBackend(request, "/auth/login", ["email", "password"]);
}
