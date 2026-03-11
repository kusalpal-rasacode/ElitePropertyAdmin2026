"use client";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import type { ModuleKey, ActionKey } from "@/types/rbac.type";

import { usePermissions } from "@/hooks/Usepermissions";
import { PermissionsHeader } from "@/components/permissions/PermissionsHeader";
import { RoleSelector } from "@/components/permissions/RoleSelector";
import { PermissionsTable } from "@/components/permissions/PermissionsTable";

export default function PermissionsPage() {
  const {
    roles,
    selectedRole,
    permissions,
    loading,
    saving,
    activeModules,
    isAddingModule,
    newModuleLabel,
    editingModuleKey,
    editingModuleLabel,
    isDeleteModalOpen,
    moduleToDelete,
    isSuperAdmin,
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
  } = usePermissions();

  return (
    <div className="max-w-[1600px] mx-auto py-4 space-y-8">
      <PermissionsHeader saving={saving} loading={loading} onSave={handleSave} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar — role selector */}
        <div className="lg:col-span-1 space-y-6">
          <RoleSelector
            roles={roles}
            selectedRole={selectedRole}
            loading={loading}
            isSuperAdmin={isSuperAdmin}
            onRoleChange={handleRoleChange}
          />
        </div>

        {/* Main — permissions matrix */}
        <div className="lg:col-span-3">
          <PermissionsTable
            activeModules={activeModules}
            permissions={permissions}
            isSuperAdmin={isSuperAdmin}
            loading={loading}
            editingModuleKey={editingModuleKey}
            editingModuleLabel={editingModuleLabel}
            isAddingModule={isAddingModule}
            newModuleLabel={newModuleLabel}
            onEditLabelChange={setEditingModuleLabel}
            onEditStart={handleEditModuleStart}
            onEditSave={handleEditModuleSave}
            onEditCancel={handleEditModuleCancel}
            onDeleteClick={handleRemoveModuleClick}
            onToggle={(moduleKey: ModuleKey, actionKey: ActionKey) =>
              handleToggle(moduleKey, actionKey)
            }
            onNewModuleLabelChange={setNewModuleLabel}
            onAddModule={handleAddModule}
            onCancelAddModule={() => setIsAddingModule(false)}
            onStartAddingModule={() => setIsAddingModule(true)}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setModuleToDelete(null);
        }}
        onConfirm={confirmRemoveModule}
        title="Delete Module?"
        message={`Are you sure you want to delete the "${moduleToDelete?.label}" module? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}