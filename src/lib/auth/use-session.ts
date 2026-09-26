"use client";

import { useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { statusSesi } from "@/lib/auth/role";

export function useSession() {
  const { data: user } = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => (await ambilData(api.GET("/auth/me"))).data,
  });
  return { user, ...statusSesi(user) };
}
