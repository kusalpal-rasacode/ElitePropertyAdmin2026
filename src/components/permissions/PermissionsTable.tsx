"use client";
import { useTheme } from "@/providers/ThemeProvider";
import { ACTION_CONFIG } from "@/services/rbac.service";
import type { ModuleKey, ActionKey, PermissionsMatrix } from "@/types/rbac.type";
import { ModuleRow } from "./Modulerow";
import { AddModuleRow } from "./AddModuleRow";

interface PermissionsTableProps {
  activeModules: { key: string; label: string }[];
  permissions: PermissionsMatrix;
  isSuperAdmin: boolean;
  loading: boolean;
  editingModuleKey: string | null;
  editingModuleLabel: string;
  isAddingModule: boolean;
  newModuleLabel: string;
  onEditLabelChange: (value: string) => void;
  onEditStart: (key: string, label: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDeleteClick: (key: string, label: string) => void;
  onToggle: (moduleKey: ModuleKey, actionKey: ActionKey) => void;
  onNewModuleLabelChange: (value: string) => void;
  onAddModule: () => void;
  onCancelAddModule: () => void;
  onStartAddingModule: () => void;
}

export function PermissionsTable({
  activeModules,
  permissions,
  isSuperAdmin,
  loading,
  editingModuleKey,
  editingModuleLabel,
  isAddingModule,
  newModuleLabel,
  onEditLabelChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDeleteClick,
  onToggle,
  onNewModuleLabelChange,
  onAddModule,
  onCancelAddModule,
  onStartAddingModule,
}: PermissionsTableProps) {
  const { currentTheme } = useTheme();

  return (
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
            {ACTION_CONFIG.map((action: { key: ActionKey; label: string | any }) => (
              <th
                key={action.key}
                className="px-4 py-4 font-bold uppercase tracking-wider text-center text-xs"
                style={{ color: currentTheme.textColor }}
              >
                {action.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y" style={{ borderColor: currentTheme.borderColor }}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div
                      className="h-4 w-32 rounded animate-pulse"
                      style={{ backgroundColor: currentTheme.borderColor }}
                    />
                  </td>
                  {ACTION_CONFIG.map((a: { key: ActionKey }) => (
                    <td key={a.key} className="px-4 py-4 text-center">
                      <div
                        className="h-5 w-10 rounded-full mx-auto animate-pulse"
                        style={{ backgroundColor: currentTheme.borderColor }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : activeModules.map((module) => (
                <ModuleRow
                  key={module.key}
                  module={module}
                  permissions={permissions}
                  isSuperAdmin={isSuperAdmin}
                  isEditing={editingModuleKey === module.key}
                  editingLabel={editingModuleLabel}
                  onEditLabelChange={onEditLabelChange}
                  onEditStart={onEditStart}
                  onEditSave={onEditSave}
                  onEditCancel={onEditCancel}
                  onDeleteClick={onDeleteClick}
                  onToggle={onToggle}
                />
              ))}

          {!loading && (
            <AddModuleRow
              isAddingModule={isAddingModule}
              newModuleLabel={newModuleLabel}
              onLabelChange={onNewModuleLabelChange}
              onAdd={onAddModule}
              onCancel={onCancelAddModule}
              onStartAdding={onStartAddingModule}
            />
          )}
        </tbody>
      </table>
    </div>
  );
}