import type { Role, User } from "@/types/domain";

export type StatusSesi = {
  role: Role | null;
  isSuperAdmin: boolean;
  isGuru: boolean;
  isWali: boolean;
  bisaKelolaKeuangan: boolean;
};

export function statusSesi(user: User | null | undefined): StatusSesi {
  const role = user?.role ?? null;
  return {
    role,
    isSuperAdmin: role === "super_admin",
    isGuru: role === "guru",
    isWali: role === "wali_murid",
    bisaKelolaKeuangan: user?.permissions.kelola_keuangan ?? false,
  };
}
