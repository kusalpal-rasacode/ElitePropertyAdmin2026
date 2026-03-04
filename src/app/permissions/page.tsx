"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MdSave,
  MdRestartAlt,
  MdOutlineShield,
  MdLockOutline,
  MdCampaign,
  MdBusiness,
  MdManageAccounts,
} from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

import {
  getAllRoles,
  getRoleById,
  updateRolePermissions,
  mapPermissionsToMatrix,
  mapMatrixToPermissionsMap,
  MODULE_CONFIG,
  ACTION_CONFIG,
} from "@/services/rbac.service";
import type {
  RbacRole,
  PermissionsMatrix,
  ModuleKey,
  ActionKey,
} from "@/types/rbac.type";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
// ============================================================
// Icon map per module key
// ============================================================
const MODULE_ICONS: Record<ModuleKey, React.ReactNode> = {
  campaign: <MdCampaign size={20} />,
  properties: <MdBusiness size={20} />,
  user_management: <MdManageAccounts size={20} />,
};

// ============================================================
// Component
// ============================================================
export default function PermissionsPage() {
  const { currentTheme } = useTheme();
  const getRoleId = (
    role: (RbacRole & { id?: number }) | null | undefined,
  ): number => Number(role?.id ?? role?.Id ?? 0);
  const normalizeRoleValue = (value?: string | null): string =>
    String(value ?? "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");
  const isSuperAdminRole = (
    role: (RbacRole & { id?: number; role?: string }) | null | undefined,
  ): boolean => {
    const roleName = normalizeRoleValue(role?.name || role?.role);
    const roleTitle = normalizeRoleValue(role?.role_title);
    return roleName === "superadmin" || roleTitle === "superadmin";
  };
  const toTitleCase = (value?: string | null): string =>
    String(value ?? "")
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  const getRoleLabel = (
    role: (RbacRole & { id?: number; role?: string }) | null | undefined,
  ) => toTitleCase(role?.role_title || role?.name || role?.role || "");

  // ---- state -----------------------------------------------
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [permissions, setPermissions] = useState<PermissionsMatrix>(
    {} as PermissionsMatrix,
  );
  const [originalMatrix, setOriginalMatrix] = useState<PermissionsMatrix>(
    {} as PermissionsMatrix,
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // ---- derived — uses PascalCase Name from API -------------
  const isSuperAdmin = isSuperAdminRole(selectedRole);

  // ---- load all roles on mount ----------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllRoles();
        setRoles(data);

        if (data.length > 0) {
          const first = data[0];
          // API uses nested permissions array — pass it to mapper
          const matrix = mapPermissionsToMatrix(first.permissions);
          setSelectedRole(first);
          setPermissions(matrix);
          setOriginalMatrix(matrix);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load roles.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- when dropdown changes, fetch fresh role by ID ------
  const handleRoleChange = useCallback(
    async (roleId: string) => {
      const id = Number(roleId);
      setError(null);
      setSaveMsg(null);
      try {
        // Optimistically render from cache first
        const cached = roles.find((r) => getRoleId(r) === id);
        if (cached) {
          const matrix = mapPermissionsToMatrix(cached.permissions);
          setSelectedRole(cached);
          setPermissions(matrix);
          setOriginalMatrix(matrix);
        }

        // Then fetch fresh from GET /rbac/roles/{id}
        const fresh = await getRoleById(id);
        const matrix = mapPermissionsToMatrix(fresh.permissions);
        setSelectedRole(fresh);
        setPermissions(matrix);
        setOriginalMatrix(matrix);

        // Update cache entry
        setRoles((prev) => prev.map((r) => (getRoleId(r) === id ? fresh : r)));
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load role.",
        );
      }
    },
    [roles],
  );

  // ---- toggle a single cell --------------------------------
  const handleToggle = (moduleKey: ModuleKey, actionKey: ActionKey) => {
    setPermissions((prev) => {
      const modulePerms = { ...(prev[moduleKey] || {}) } as Record<ActionKey, boolean>;
      const newValue = !modulePerms[actionKey];
      modulePerms[actionKey] = newValue;

      if (actionKey === "view" && !newValue) {
        ACTION_CONFIG.forEach((action) => {
          modulePerms[action.key as ActionKey] = false;
        });
      }

      return {
        ...prev,
        [moduleKey]: modulePerms,
      };
    });
  };

  // ---- reset to original (server) state -------------------
  const handleReset = () => {
    setPermissions(originalMatrix);
    setSaveMsg(null);
  };

  // ---- save via PATCH /rbac/roles/{id} --------------------
  const handleSave = async () => {
    console.log(selectedRole);
    
    if (!selectedRole || isSuperAdmin) return;
    setSaving(true);
    setSaveMsg(null);
    setError(null);
    try {
      const updated = await updateRolePermissions(selectedRole.Id, {
        permissions: mapMatrixToPermissionsMap(permissions),
      });

      // Sync local state with server response
      const matrix = mapPermissionsToMatrix(updated.permissions);
      setPermissions(matrix);
      setOriginalMatrix(matrix);
      const updatedRoleId = getRoleId(updated);
      setRoles((prev) =>
        prev.map((r) => (getRoleId(r) === updatedRoleId ? updated : r)),
      );
      setTimeout(() => {
        showSuccessToast("Permissions saved successfully.");
      }, 1000);
    } catch (err: any) {
      const massage =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to save permissions.";
      showErrorToast(massage);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="max-w-[1600px] mx-auto py-4 space-y-8">
      {/* ---- Header ----------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: currentTheme.headingColor }}
          >
            Permissions Matrix
          </h1>
          <p
            className="font-medium text-sm"
            style={{ color: currentTheme.textColor }}
          >
            Define granular capability sets for each user role.
          </p>
        </div>

        <div className="flex gap-3">
          {/* <button
            onClick={handleReset}
            disabled={saving || isSuperAdmin}
            className="px-4 py-2 border rounded-lg text-sm font-bold hover:brightness-95 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
            }}
          >
            <MdRestartAlt size={16} />
            Reset Defaults
          </button> */}

          <button
            onClick={handleSave}
            disabled={saving || isSuperAdmin || loading}
            className="px-5 py-2 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <MdSave size={18} />
            <span>{saving ? "Saving…" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* ---- Inline feedback -------------------------------- */}
      {/* {error && (
        <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {saveMsg && (
        <div className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          {saveMsg}
        </div>
      )} */}

      {/* ---- Body ------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* -- Context / Role Selector card ------------------ */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className="p-5 rounded-2xl shadow-sm border flex flex-col gap-4 sticky top-24 backdrop-blur-md"
            style={{
              backgroundColor: currentTheme.cardBg + "E6",
              borderColor: currentTheme.borderColor,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg text-white flex items-center justify-center text-xl shadow-md"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <MdOutlineShield />
            </div>

            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: currentTheme.headingColor }}
              >
                Role Context
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: currentTheme.textColor }}
              >
                Select role to modify permissions:
              </p>
            </div>

            {/* Dropdown — populated from GET /rbac/roles */}
            <div className="relative">
              {loading ? (
                <div
                  className="w-full px-4 py-2.5 border rounded-lg text-sm font-bold animate-pulse"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.textColor,
                  }}
                >
                  Loading roles…
                </div>
              ) : (
                <select
                  className="w-full px-4 py-2.5 border rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                  value={String(getRoleId(selectedRole) || "")}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  {roles.map((role) => (
                    <option
                      key={String(getRoleId(role))}
                      value={String(getRoleId(role))}
                    >
                      {getRoleLabel(role)}
                    </option>
                  ))}
                </select>
              )}
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]"
                style={{ color: currentTheme.textColor }}
              >
                ▼
              </div>
            </div>

            {/* Super Admin lock notice */}
            {isSuperAdmin && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 text-amber-800 font-medium text-xs">
                <MdLockOutline size={16} className="shrink-0 mt-0.5" />
                <p>
                  System Locked: Super Admin permissions cannot be modified.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* -- Permissions Matrix table ---------------------- */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl shadow-sm border overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: currentTheme.cardBg + "E6",
              borderColor: currentTheme.borderColor,
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                  }}
                >
                  <th
                    className="text-left px-6 py-4 font-bold uppercase tracking-wider text-xs w-1/3"
                    style={{ color: currentTheme.textColor }}
                  >
                    Target Module
                  </th>
                  {ACTION_CONFIG.map(
                    (action: { key: ActionKey; label: string | any }) => (
                      <th
                        key={action.key}
                        className="px-4 py-4 font-bold uppercase tracking-wider text-center text-xs"
                        style={{ color: currentTheme.textColor }}
                      >
                        {action.label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody
                className="divide-y"
                style={{ borderColor: currentTheme.borderColor }}
              >
                {loading
                  ? // Skeleton rows
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div
                            className="h-4 w-32 rounded animate-pulse"
                            style={{
                              backgroundColor: currentTheme.borderColor,
                            }}
                          />
                        </td>
                        {ACTION_CONFIG.map((a: { key: ActionKey }) => (
                          <td key={a.key} className="px-4 py-4 text-center">
                            <div
                              className="h-5 w-10 rounded-full mx-auto animate-pulse"
                              style={{
                                backgroundColor: currentTheme.borderColor,
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : MODULE_CONFIG.map(
                      (module: { key: ModuleKey; label: string | any }) => (
                        <tr
                          key={module.key}
                          className="hover:bg-gray-500/5 transition-colors"
                        >
                          {/* Module label */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span style={{ color: currentTheme.textColor }}>
                                {MODULE_ICONS[module.key as ModuleKey]}
                              </span>
                              <p
                                className="font-bold text-sm"
                                style={{ color: currentTheme.headingColor }}
                              >
                                {module.label}
                              </p>
                            </div>
                          </td>

                          {/* Toggle switches */}
                          {ACTION_CONFIG.map((action: { key: ActionKey }) => {
                            const isChecked =
                              permissions[module.key]?.[action.key] ?? false;
                            // Non-view actions are disabled when view is off
                            const isDisabled =
                              action.key !== "view" &&
                              !permissions[module.key]?.view;

                            return (
                              <td
                                key={action.key}
                                className="px-4 py-4 text-center"
                              >
                                <label
                                  className={`inline-flex items-center justify-center cursor-pointer ${
                                    isSuperAdmin || isDisabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isSuperAdmin ? true : isChecked}
                                    onChange={() =>
                                      !isSuperAdmin &&
                                      !isDisabled &&
                                      handleToggle(module.key, action.key)
                                    }
                                    disabled={isDisabled || isSuperAdmin}
                                  />
                                  {/* Toggle track */}
                                  <div
                                    className="w-10 h-5 rounded-full transition-colors duration-200 ease-in-out relative"
                                    style={{
                                      backgroundColor:
                                        isChecked || isSuperAdmin
                                          ? currentTheme.primary
                                          : currentTheme.borderColor,
                                    }}
                                  >
                                    {/* Toggle thumb */}
                                    <div
                                      className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${
                                        isChecked || isSuperAdmin
                                          ? "translate-x-5"
                                          : "translate-x-0"
                                      }`}
                                    />
                                  </div>
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      ),
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
