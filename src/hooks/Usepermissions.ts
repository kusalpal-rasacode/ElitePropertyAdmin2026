import { useState, useEffect, useCallback } from "react";
import {
  getAllRoles,
  getRoleById,
  updateRolePermissions,
  mapPermissionsToMatrix,
  mapMatrixToPermissionsMap,
  ACTION_CONFIG,
  getActiveModuleConfig,
  addDynamicModule,
  deletePermissionModule,
  getDynamicModules,
  saveDynamicModules,
  updatePermissionModule,
  syncPermissionModulesFromApi,
} from "@/services/rbac.service";
import type { RbacRole, PermissionsMatrix, ModuleKey, ActionKey } from "@/types/rbac.type";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { getRoleId, isSuperAdminRole } from "../utils/Rolehelpers";

export function usePermissions() {
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [permissions, setPermissions] = useState<PermissionsMatrix>({} as PermissionsMatrix);
  const [originalMatrix, setOriginalMatrix] = useState<PermissionsMatrix>({} as PermissionsMatrix);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeModules, setActiveModules] = useState<{ key: string; label: string }[]>([]);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleLabel, setNewModuleLabel] = useState("");

  const [editingModuleKey, setEditingModuleKey] = useState<string | null>(null);
  const [editingModuleLabel, setEditingModuleLabel] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<{ key: string; label: string } | null>(null);

  const isSuperAdmin = isSuperAdminRole(selectedRole);

  // ---- load all roles on mount ----------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await syncPermissionModulesFromApi();
        setActiveModules(getActiveModuleConfig());

        const data = await getAllRoles();
        setRoles(data);
        if (data.length > 0) {
          const first = data[0];
          const matrix = mapPermissionsToMatrix(first.permissions);
          setSelectedRole(first);
          setPermissions(matrix);
          setOriginalMatrix(matrix);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.message ?? "Failed to load roles.");
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
      try {
        const cached = roles.find((r) => getRoleId(r) === id);
        if (cached) {
          const matrix = mapPermissionsToMatrix(cached.permissions);
          setSelectedRole(cached);
          setPermissions(matrix);
          setOriginalMatrix(matrix);
        }

        const fresh = await getRoleById(id);
        const matrix = mapPermissionsToMatrix(fresh.permissions);
        setSelectedRole(fresh);
        setPermissions(matrix);
        setOriginalMatrix(matrix);
        setRoles((prev) => prev.map((r) => (getRoleId(r) === id ? fresh : r)));
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.message ?? "Failed to load role.");
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

      return { ...prev, [moduleKey]: modulePerms };
    });
  };

  // ---- save via PATCH /rbac/roles/{id} --------------------
  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRolePermissions(selectedRole.Id, {
        permissions: mapMatrixToPermissionsMap(permissions),
      });

      const matrix = mapPermissionsToMatrix(updated.permissions);
      setPermissions(matrix);
      setOriginalMatrix(matrix);
      const updatedRoleId = getRoleId(updated);
      setRoles((prev) => prev.map((r) => (getRoleId(r) === updatedRoleId ? updated : r)));
      setTimeout(() => {
        showSuccessToast("Permissions saved successfully.");
      }, 1000);
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message ?? err?.message ?? "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  // ---- module management ----------------------------------
  const handleAddModule = async () => {
    if (!newModuleLabel.trim()) return;
    const key = newModuleLabel.trim().toLowerCase().replace(/[\s_-]+/g, "_");
    try {
      await addDynamicModule(key, newModuleLabel.trim());
      await syncPermissionModulesFromApi();

      setActiveModules(getActiveModuleConfig());
      setPermissions((prev) => {
        if (prev[key]) return prev;
        return {
          ...prev,
          [key]: ACTION_CONFIG.reduce(
            (acc, a) => ({ ...acc, [a.key]: false }),
            {} as any,
          ),
        };
      });
      setNewModuleLabel("");
      setIsAddingModule(false);
      showSuccessToast("Module added successfully.");
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message ?? "Failed to add module.");
    }
  };

  const handleRemoveModuleClick = (keyToRemove: string, label: string) => {
    setModuleToDelete({ key: keyToRemove, label });
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveModule = async () => {
    if (!moduleToDelete) return;
    try {
      const storedModules = getDynamicModules();
      const target = storedModules.find((m) => m.key === moduleToDelete.key);

      if (!target?.apiId) {
        showErrorToast("Module ID not found. Cannot delete.");
        return;
      }

      const response = await deletePermissionModule(target.apiId);
      if (response?.is_success) {
        const current = getDynamicModules();
        saveDynamicModules(current.filter((m) => m.key !== moduleToDelete.key));
        setActiveModules(getActiveModuleConfig());
        showSuccessToast(response.message || `"${moduleToDelete.label}" deleted successfully.`);
      } else {
        showErrorToast("Failed to delete module.");
      }
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message ?? "Failed to delete module.");
    } finally {
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
    }
  };

  const handleEditModuleStart = (key: string, currentLabel: string) => {
    setEditingModuleKey(key);
    setEditingModuleLabel(currentLabel);
  };

  const handleEditModuleSave = async () => {
    if (!editingModuleKey || !editingModuleLabel.trim()) return;
    try {
      const storedModules = getDynamicModules();
      const target = storedModules.find((m) => m.key === editingModuleKey);

      if (!target?.apiId) {
        showErrorToast("Module ID not found. Cannot update.");
        return;
      }

      const response = await updatePermissionModule(target.apiId, {
        label: editingModuleLabel.trim(),
      });

      if (response?.is_success) {
        const current = getDynamicModules();
        const updated = current.map((m) =>
          m.key === editingModuleKey ? { ...m, label: editingModuleLabel.trim() } : m,
        );
        saveDynamicModules(updated);
        setActiveModules(getActiveModuleConfig());
        showSuccessToast(response.message || "Module updated successfully.");
      } else {
        showErrorToast("Failed to update module.");
      }
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message ?? "Failed to update module.");
    } finally {
      setEditingModuleKey(null);
      setEditingModuleLabel("");
    }
  };

  const handleEditModuleCancel = () => {
    setEditingModuleKey(null);
    setEditingModuleLabel("");
  };

  return {
    // State
    roles,
    selectedRole,
    permissions,
    loading,
    saving,
    error,
    activeModules,
    isAddingModule,
    newModuleLabel,
    editingModuleKey,
    editingModuleLabel,
    isDeleteModalOpen,
    moduleToDelete,
    isSuperAdmin,
    // Handlers
    handleRoleChange,
    handleToggle,
    handleSave,
    handleAddModule,
    handleRemoveModuleClick,
    confirmRemoveModule,
    handleEditModuleStart,
    handleEditModuleSave,
    handleEditModuleCancel,
    setIsAddingModule,
    setNewModuleLabel,
    setIsDeleteModalOpen,
    setModuleToDelete,
    setEditingModuleLabel,
  };
}