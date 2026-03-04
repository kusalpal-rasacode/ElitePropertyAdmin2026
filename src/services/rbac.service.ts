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
} from "@/types/rbac.type";

type RawPermissions = PermissionsMap | { permissions?: PermissionsMap } | null | undefined;
const inFlightGetRequests = new Map<string, Promise<any>>();
const recentGetCache = new Map<string, { timestamp: number; value: any }>();
const BURST_CACHE_MS = 500;

const dedupeGet = async <T>(key: string, request: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const cached = recentGetCache.get(key);
  if (cached && now - cached.timestamp < BURST_CACHE_MS) {
    return cached.value as T;
  }

  const existing = inFlightGetRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const pending = request()
    .then((result) => {
      recentGetCache.set(key, { timestamp: Date.now(), value: result });
      return result;
    })
    .finally(() => {
      inFlightGetRequests.delete(key);
    });

  inFlightGetRequests.set(key, pending);
  return pending;
};

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
  return MODULE_KEYS.reduce((acc, mod) => {
    const modulePerms = source[mod];
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
    if (inner && typeof inner === "object") {
      return normalizePermissionsMap(inner);
    }
    return normalizePermissionsMap(first);
  }

  if (entries && typeof entries === "object") {
    const inner = (entries as { permissions?: unknown }).permissions;
    if (inner && typeof inner === "object") {
      return normalizePermissionsMap(inner);
    }
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

export const getAllRoles = async (): Promise<RbacRole[]> => {
  const res = await dedupeGet("rbac-roles:all", () =>
    privetApi.get<RbacRole[]>(`/rbac/roles`),
  );
  return toRoleArray(res.data).map((item) => normalizeRole(item));
};

export const getRoleById = async (id: number): Promise<RbacRole> => {
  const res = await dedupeGet(`rbac-role:${id}`, () =>
    privetApi.get<RbacRole>(`/rbac/roles/${id}`),
  );
  const payload =
    res.data && typeof res.data === "object" && "data" in (res.data as object)
      ? (res.data as { data?: unknown }).data ?? res.data
      : res.data;
  return normalizeRole(payload);
};

export const createRole = async (
  payload: CreateRolePayload,
): Promise<RbacRole> => {
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
  const res = await dedupeGet("rbac-my-permissions", () =>
    privetApi.get<MyPermissionsResponse>(`/rbac/my-permissions`),
  );
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



export const MODULE_CONFIG: {
  key: ModuleKey;
  label: string;
}[] = [
  { key: "campaign", label: "Campaigns" },
  { key: "properties", label: "Properties" },
  { key: "user_management", label: "User Management" },
];

export const ACTION_CONFIG: {
  key: ActionKey;
  label: string;
}[] = [ { key: "view", label: "View" },
  { key: "add", label: "Add" },
 
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

export const MODULE_KEYS = MODULE_CONFIG.map((m) => m.key);
export const ACTION_KEYS = ACTION_CONFIG.map((a) => a.key);

// API uses "properties" as canonical key. "property" is kept as a legacy alias.
const API_KEY_NORMALISE: Record<string, ModuleKey> = {
  campaign: "campaign",
  properties: "properties",
  property: "properties",
  user_management: "user_management",
};

export function mapPermissionsToMatrix(
  permissionEntries: RbacRole["permissions"],
): PermissionsMatrix {
  const matrix = MODULE_KEYS.reduce((acc, mod) => {
    acc[mod] = ACTION_KEYS.reduce(
      (a, act) => {
        a[act] = false;
        return a;
      },
      {} as Record<ActionKey, boolean>,
    );
    return acc;
  }, {} as PermissionsMatrix);

  const permMap = extractPermissionsMap(permissionEntries);

  (Object.keys(permMap) as string[]).forEach((rawKey) => {
    const mod = API_KEY_NORMALISE[rawKey];
    if (!mod || !matrix[mod]) return;

    const modulePerms = permMap[rawKey as keyof typeof permMap];
    if (!modulePerms) return;

    (Object.keys(modulePerms) as ActionKey[]).forEach((act) => {
      if (act in matrix[mod]) {
        matrix[mod][act] = modulePerms[act] ?? false;
      }
    });
  });

  return matrix;
}

export function mapMatrixToPermissionsMap(
  matrix: PermissionsMatrix,
): PermissionsMap {
  return MODULE_KEYS.reduce((acc, mod) => {
    acc[mod] = ACTION_KEYS.reduce(
      (a, act) => {
        a[act] = matrix[mod]?.[act] ?? false;
        return a;
      },
      {} as Record<ActionKey, boolean>,
    );
    return acc;
  }, {} as PermissionsMap);
}
