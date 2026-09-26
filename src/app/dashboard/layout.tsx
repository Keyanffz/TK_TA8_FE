import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { queryKeys } from "@/lib/api/query-keys";
import { ambilSesi } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await ambilSesi();
  if (!user) redirect("/api/auth/sesi-habis?next=/dashboard");

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.me, user);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
