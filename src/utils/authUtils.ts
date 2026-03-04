export const SUPER_ADMIN_ROLE_KEY = "super_admin";
export const ENTERPRIZE_ROLE_KEY = "enterprise_role";

const normalizeRoleValue = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const getRoleCandidates = (r: unknown): string[] => {
  if (typeof r === "string") return [r];
  if (!r || typeof r !== "object") return [];
  const roleObj = r as Record<string, unknown>;
  return [roleObj.role, roleObj.name, roleObj.Name, roleObj.role_title]
    .filter((v): v is string => typeof v === "string");
};

// Matches role keys ignoring case and separators (super_admin, super admin, superadmin)
const matchesRole = (r: unknown, key: string): boolean => {
  const normalizedKey = normalizeRoleValue(key);
  return getRoleCandidates(r).some(
    (candidate) => normalizeRoleValue(candidate) === normalizedKey,
  );
};

export const isSuperAdmin = (user: unknown): boolean => {
  if (!user) return false;
  const roles = (user as { roles?: unknown[] }).roles;
  if (Array.isArray(roles)) {
    return roles.some((r) => matchesRole(r, SUPER_ADMIN_ROLE_KEY));
  }
  return false;
};

export const isEnterpriseAdmin = (user: unknown): boolean => {
  if (!user) return false;
  const roles = (user as { roles?: unknown[] }).roles;
  if (Array.isArray(roles)) {
    return roles.some((r) => matchesRole(r, ENTERPRIZE_ROLE_KEY));
  }
  return false;
};

// Only super_admin and enterprise_role are allowed to access the dashboard
export const hasDashboardAccess = (user: unknown): boolean => {
  return isSuperAdmin(user) || isEnterpriseAdmin(user);
};
