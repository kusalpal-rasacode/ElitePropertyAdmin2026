import type { RbacRole } from "@/types/rbac.type";

export const getRoleId = (
  role: (RbacRole & { id?: number }) | null | undefined,
): number => Number(role?.id ?? role?.Id ?? 0);

export const normalizeRoleValue = (value?: string | null): string =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

export const isSuperAdminRole = (
  role: (RbacRole & { id?: number; role?: string }) | null | undefined,
): boolean => {
  const roleName = normalizeRoleValue(role?.name || role?.role);
  const roleTitle = normalizeRoleValue(role?.role_title);
  return roleName === "superadmin" || roleTitle === "superadmin";
};

export const toTitleCase = (value?: string | null): string =>
  String(value ?? "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

export const getRoleLabel = (
  role: (RbacRole & { id?: number; role?: string }) | null | undefined,
): string => toTitleCase(role?.role_title || role?.name || role?.role || "");