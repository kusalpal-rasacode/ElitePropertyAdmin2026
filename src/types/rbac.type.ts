//  Action keys used in the permissions object ---
export type ActionKey = "view" | "add" | "edit" | "delete";

// RBAC module keys returned by API payloads.
export type ModuleKey = "campaign" | "properties" | "user_management";

//  Per-module action map -
export type ModulePermissions = Record<ActionKey, boolean>;

//  Nested permissions object inside a permission entry
export type PermissionsMap = Partial<Record<ModuleKey, ModulePermissions>>;

//  Single item inside the role's permissions array --
export interface RbacPermissionEntry {
  id: number;
  permissions: PermissionsMap;
}

//  Organization attached to a role --
export interface RbacOrganization {
  id: number;
  name: string;
  industry: string;
  size: string | null;
  created_at: string;
  updated_at: string;
}

//  User attached to a role --
export interface RbacUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

//  Role object returned by GET /rbac/roles --
export interface RbacRole {
  id?: number;
  Id: number;
  role?: string;
  name: string;
  role_title: string;
  permissions: Array<RbacPermissionEntry | PermissionsMap>;
  organization: RbacOrganization | null;
  users: RbacUser[];
  user_count: number;
}

//  Payload for POST /rbac/roles -
export interface CreateRolePayload {
  role: string;
  organization_id?: number;
  permission: PermissionsMap[];
}

//  Payload for PATCH /rbac/roles/{id} ---
export interface UpdateRolePermissionsPayload {
  permissions?: PermissionsMap;
  permission?: PermissionsMap[];
}

//  GET /rbac/my-permissions -
export interface MyPermissionsResponse {
  role?: string;
  name?: string;
  role_title?: string;
  permissions: PermissionsMap;
}

export type PermissionsMatrix = Record<ModuleKey, Record<ActionKey, boolean>>;
