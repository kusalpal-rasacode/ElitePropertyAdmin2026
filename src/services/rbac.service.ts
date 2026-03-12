import { privetApi } from "@/services/axios";
import type {
  RbacRole,
  CreateRolePayload,
  UpdateRolePermissionsPayload,
  MyPermissionsResponse,
  PermissionsMatrix,
  PermissionsMap,
  ModuleKey,
  ActionKey,
  PermissionModule,
} from "@/types/rbac.type";

type RawPermissions = PermissionsMap | { permissions?: PermissionsMap } | null | undefined;

export const normalizeModuleKey = (value: string): string =>
  String(value).trim().toLowerCase().replace(/\s+/g, "_");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toRoleArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: unknown[] }).data;
  }
  return [];
};

const normalizePermissionsMap = (raw: unknown): PermissionsMap => {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const keys = getActiveModuleKeys();

  return keys.reduce((acc, mod) => {
    // ✅ Case-insensitive match — find the key in API response
    const matchedKey = Object.keys(source).find(
      (k) =>
        normalizeModuleKey(k).replace(/_+/g, "_") ===
        normalizeModuleKey(mod).replace(/_+/g, "_"),
    );

    const modulePerms = matchedKey ? source[matchedKey] : undefined;
    if (!modulePerms || typeof modulePerms !== "object") return acc;

    const moduleRecord = modulePerms as Record<string, unknown>;
    acc[mod] = ACTION_KEYS.reduce((actionAcc, act) => {
      actionAcc[act] = Boolean(moduleRecord[act]);
      return actionAcc;
    }, {} as Record<ActionKey, boolean>);
    return acc;
  }, {} as PermissionsMap);
};

const extractPermissionsMap = (entries: RawPermissions[] | unknown): PermissionsMap => {
  if (Array.isArray(entries)) {
    if (entries.length === 0) return {};
    const first = entries[0] as RawPermissions;
    if (!first || typeof first !== "object") return {};
    const inner = (first as { permissions?: unknown }).permissions;
    if (inner && typeof inner === "object") return normalizePermissionsMap(inner);
    return normalizePermissionsMap(first);
  }
  if (entries && typeof entries === "object") {
    const inner = (entries as { permissions?: unknown }).permissions;
    if (inner && typeof inner === "object") return normalizePermissionsMap(inner);
    return normalizePermissionsMap(entries);
  }
  return {};
};

const normalizeRole = (raw: unknown): RbacRole => {
  const input = (raw ?? {}) as Record<string, unknown>;
  const id = Number(input.id ?? input.Id ?? 0);
  const roleName = String(input.role ?? input.name ?? input.Name ?? "");
  const roleTitle = String(input.role_title ?? "");
  const permissionsMap = extractPermissionsMap(input.permissions);
  return {
    ...(input as unknown as Partial<RbacRole>),
    id,
    Id: id,
    role: roleName,
    name: roleName,
    role_title: roleTitle,
    permissions: [{ id: 0, permissions: permissionsMap }],
    organization: (input.organization as RbacRole["organization"]) ?? null,
    users: Array.isArray(input.users) ? (input.users as RbacRole["users"]) : [],
    user_count: Number(input.user_count ?? (Array.isArray(input.users) ? input.users.length : 0)),
  };
};

// ─── Role APIs ────────────────────────────────────────────────────────────────

export const getAllRoles = async (): Promise<RbacRole[]> => {
  const res = await privetApi.get<RbacRole[]>(`/rbac/roles`);
  return toRoleArray(res.data).map((item) => normalizeRole(item));
};

export const getRoleById = async (id: number): Promise<RbacRole> => {
  const res = await privetApi.get<RbacRole>(`/rbac/roles/${id}`);
  const payload =
    res.data && typeof res.data === "object" && "data" in (res.data as object)
      ? (res.data as { data?: unknown }).data ?? res.data
      : res.data;
  return normalizeRole(payload);
};

export const createRole = async (payload: CreateRolePayload): Promise<RbacRole> => {
  const res = await privetApi.post<RbacRole>(`/rbac/roles`, payload);
  const body = res.data as unknown;
  const rolePayload =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as { data?: unknown }).data ?? body
      : body;
  return normalizeRole(rolePayload);
};

export const updateRolePermissions = async (
  id: number,
  payload: UpdateRolePermissionsPayload,
): Promise<RbacRole> => {
  const permissions = payload.permissions ?? payload.permission?.[0] ?? {};
  const requestBody = { permission: [permissions] };
  const res = await privetApi.patch<RbacRole>(`/rbac/roles/${id}`, requestBody);
  const body = res.data as unknown;
  const rolePayload =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as { data?: unknown }).data ?? body
      : body;
  return normalizeRole(rolePayload);
};

export const deleteRole = async (id: number): Promise<void> => {
  await privetApi.delete(`/rbac/roles/${id}`);
};

export const getMyPermissions = async (): Promise<MyPermissionsResponse> => {
  const res = await privetApi.get<MyPermissionsResponse>(`/rbac/my-permissions`);
  const body = res.data as unknown;
  const payload =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as { data?: unknown }).data ?? body
      : body;
  const entry = Array.isArray(payload) ? payload[0] : payload;
  const map = extractPermissionsMap((entry as { permissions?: unknown })?.permissions);
  return {
    ...(entry as MyPermissionsResponse),
    role: String(
      (entry as { role?: unknown; name?: unknown; Name?: unknown })?.role ??
      (entry as { role?: unknown; name?: unknown; Name?: unknown })?.name ??
      (entry as { role?: unknown; name?: unknown; Name?: unknown })?.Name ??
      "",
    ),
    permissions: map,
  };
};

// ─── Permission Modules APIs ──────────────────────────────────────────────────

export const getAllPermissionModules = async (): Promise<PermissionModule[]> => {
  const res = await privetApi.get<{ is_success: boolean; data: PermissionModule[] }>(
    `/rbac/permission-modules`,
  );
  return res.data?.data ?? [];
};

export const createPermissionModule = async (payload: {
  label: string;
}): Promise<PermissionModule> => {
  const res = await privetApi.post<{
    is_success: boolean;
    message: string;
    data: PermissionModule;
  }>(`/rbac/permission-modules`, payload);
  return res.data.data;
};

export const updatePermissionModule = async (
  id: number,
  payload: { label: string },
): Promise<{ is_success: boolean; message: string; data: PermissionModule }> => {
  const res = await privetApi.patch<{
    is_success: boolean;
    message: string;
    data: PermissionModule;
  }>(`/rbac/permission-modules/${id}`, payload);
  return res.data;
};

export const deletePermissionModule = async (
  id: number,
): Promise<{ is_success: boolean; message: string }> => {
  const res = await privetApi.delete<{ is_success: boolean; message: string }>(
    `/rbac/permission-modules/${id}`,
  );
  return res.data;
};

// ─── Static module config ─────────────────────────────────────────────────────

export const MODULE_CONFIG: { key: ModuleKey; label: string }[] = [
  { key: "campaign", label: "Campaigns" },
  { key: "properties", label: "Properties" },
  { key: "user_management", label: "User Management" },
];

export const ACTION_CONFIG: { key: ActionKey; label: string }[] = [
  { key: "view", label: "View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

export const MODULE_KEYS = MODULE_CONFIG.map((m) => m.key);
export const ACTION_KEYS = ACTION_CONFIG.map((a) => a.key);

// ─── Dynamic module local cache (stores apiId for PATCH / DELETE) ─────────────

const LOCAL_STORAGE_KEY = "elite_dynamic_modules_v2";

interface StoredModule {
  key: string;
  label: string;
  apiId: number;
}

export const getDynamicModules = (): StoredModule[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredModule[]) : [];
  } catch {
    return [];
  }
};

export const saveDynamicModules = (modules: StoredModule[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(modules));
  }
};

/**
 * Seed local cache from GET /rbac/permission-modules.
 */
export const syncPermissionModulesFromApi = async (): Promise<void> => {
  try {
    const apiModules = await getAllPermissionModules();
    const current = getDynamicModules();

    const freshFromApi: StoredModule[] = apiModules.map((apiMod) => {
      const key = normalizeModuleKey(apiMod.name ?? apiMod.label);
      const existing = current.find((m) => m.apiId === apiMod.id);
      // Keep previously entered label for UI display if available.
      return existing ?? { key, label: apiMod.label ?? apiMod.name ?? key, apiId: apiMod.id };
    });

    // ✅ Overwrite localStorage with only what the API currently has
    saveDynamicModules(freshFromApi);
  } catch {
    // silently fail — local cache remains as-is
  }
};

/**
 * POST /rbac/permission-modules → persist to local cache.
 */
export const addDynamicModule = async (label: string): Promise<StoredModule> => {
  const current = getDynamicModules();
  const displayLabel = label.trim();
  const normalizedInputKey = normalizeModuleKey(displayLabel);

  // Only skip if already exists with a valid apiId from server
  const existingWithApi = current.find((m) => m.key === normalizedInputKey && m.apiId > 0);
  if (existingWithApi) return existingWithApi;

  // ✅ Always call API to create the module
  const created = await createPermissionModule({ label: normalizedInputKey });

  const normalizedKey = normalizeModuleKey(created.name ?? created.label ?? label);
  const entry: StoredModule = {
    key: normalizedKey,
    // Keep UI display exactly as user typed.
    label: displayLabel,
    apiId: created.id,
  };

  // Remove any stale local entry with same key before saving
  const filtered = current.filter((m) => m.key !== normalizedKey);
  saveDynamicModules([...filtered, entry]);

  return entry;
};

/**
 * DELETE /rbac/permission-modules/{id} → remove from local cache.
 */
export const removeDynamicModule = async (key: string): Promise<void> => {
  const current = getDynamicModules();
  saveDynamicModules(current.filter((m) => m.key !== key));
};

/**
 * PATCH /rbac/permission-modules/{id} → update label in local cache.
 */
export const updateDynamicModule = async (
  key: string,
  label: string,
): Promise<{ is_success: boolean; message: string }> => {
  const current = getDynamicModules();
  const index = current.findIndex((m) => m.key === key);
  if (index === -1) throw new Error("Module not found in local cache.");

  const target = current[index];
  if (!target.apiId) throw new Error("Module API ID not found.");

  // ✅ Call API and return response
  const response = await updatePermissionModule(target.apiId, { label: normalizeModuleKey(label) });

  if (response?.is_success) {
    current[index] = { ...target, label };
    saveDynamicModules([...current]);
  }

  return response;
};

export const getActiveModuleConfig = (): { key: string; label: string }[] => {
  return getDynamicModules().map(({ key, label }) => ({ key, label }));
};

export const getActiveModuleKeys = (): string[] => {
  return getActiveModuleConfig().map((m) => m.key);
};

// ─── Matrix helpers ───────────────────────────────────────────────────────────

export function mapPermissionsToMatrix(
  permissionEntries: RbacRole["permissions"],
): PermissionsMatrix {
  const keys = getActiveModuleKeys();
  const matrix = keys.reduce(
    (acc, mod) => {
      acc[mod] = ACTION_KEYS.reduce(
        (a, act) => {
          a[act] = false;
          return a;
        },
        {} as Record<ActionKey, boolean>,
      );
      return acc;
    },
    {} as PermissionsMatrix,
  );

  const permMap = extractPermissionsMap(permissionEntries);

  (Object.keys(permMap) as string[]).forEach((rawKey) => {
    // Normalize rawKey to match our stored module keys (case-insensitive)
    const normalizedRaw = normalizeModuleKey(rawKey).replace(/_+/g, "_");
    const mod =
      getActiveModuleKeys().find(
        (k) => normalizeModuleKey(k).replace(/_+/g, "_") === normalizedRaw,
      ) || normalizedRaw;

    if (!matrix[mod]) return;
    const modulePerms = permMap[rawKey as keyof typeof permMap];
    if (!modulePerms) return;
    (Object.keys(modulePerms) as ActionKey[]).forEach((act) => {
      if (act in matrix[mod]) matrix[mod][act] = modulePerms[act] ?? false;
    });
  });

  return matrix;
}

export function mapMatrixToPermissionsMap(matrix: PermissionsMatrix): PermissionsMap {
  const keys = getActiveModuleKeys();
  return keys.reduce(
    (acc, mod) => {
      acc[mod] = ACTION_KEYS.reduce(
        (a, act) => {
          a[act] = matrix[mod]?.[act] ?? false;
          return a;
        },
        {} as Record<ActionKey, boolean>,
      );
      return acc;
    },
    {} as PermissionsMap,
  );
}
