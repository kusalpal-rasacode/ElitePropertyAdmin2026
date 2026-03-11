"use client";
import { MdCheck, MdClose, MdModeEditOutline, MdDeleteOutline } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { getDynamicIcon } from "@/utils/Moduleicons";
import { ACTION_CONFIG } from "@/services/rbac.service";
import type { ModuleKey, ActionKey } from "@/types/rbac.type";

interface ModuleRowProps {
  module: { key: string; label: string };
  permissions: Record<string, Record<string, boolean>>;
  isSuperAdmin: boolean;
  isEditing: boolean;
  editingLabel: string;
  onEditLabelChange: (value: string) => void;
  onEditStart: (key: string, label: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDeleteClick: (key: string, label: string) => void;
  onToggle: (moduleKey: ModuleKey, actionKey: ActionKey) => void;
}

export function ModuleRow({
  module,
  permissions,
  isSuperAdmin,
  isEditing,
  editingLabel,
  onEditLabelChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDeleteClick,
  onToggle,
}: ModuleRowProps) {
  const { currentTheme } = useTheme();

  return (
    <tr className="hover:bg-gray-500/5 transition-colors group">
      {/* Module label cell */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span style={{ color: currentTheme.textColor }}>
            {getDynamicIcon(module.key)}
          </span>

          {isEditing ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                autoFocus
                value={editingLabel}
                onChange={(e) => onEditLabelChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onEditSave()}
                className="px-2 py-1 border rounded text-sm outline-none focus:ring-2 w-full max-w-[150px]"
                style={{
                  backgroundColor: currentTheme.background,
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                }}
              />
              <button
                onClick={onEditSave}
                className="text-green-600 hover:text-green-700 hover:scale-110 transition-all font-bold"
                title="Save"
              >
                <MdCheck size={20} />
              </button>
              <button
                onClick={onEditCancel}
                className="text-red-500 hover:text-red-600 hover:scale-110 transition-all font-bold"
                title="Cancel"
              >
                <MdClose size={20} />
              </button>
            </div>
          ) : (
            <>
              <p
                className="font-bold text-sm truncate"
                style={{ color: currentTheme.headingColor }}
              >
                {module.label}
              </p>
              <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditStart(module.key, module.label)}
                  className="text-blue-500 hover:scale-110 transition-all"
                  title="Edit Module Name"
                >
                  <MdModeEditOutline size={18} />
                </button>
                <button
                  onClick={() => onDeleteClick(module.key, module.label)}
                  className="text-red-500 hover:scale-110 transition-all"
                  title="Delete Module"
                >
                  <MdDeleteOutline size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </td>

      {/* Toggle switch cells */}
      {ACTION_CONFIG.map((action: { key: ActionKey }) => {
        const isChecked = permissions[module.key]?.[action.key] ?? false;
        const isDisabled = action.key !== "view" && !permissions[module.key]?.view;

        return (
          <td key={action.key} className="px-4 py-4 text-center">
            <label
              className={`inline-flex items-center justify-center cursor-pointer ${
                isSuperAdmin || isDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSuperAdmin ? true : isChecked}
                onChange={() =>
                  !isSuperAdmin && !isDisabled && onToggle(module.key as ModuleKey, action.key)
                }
                disabled={isDisabled || isSuperAdmin}
              />
              <div
                className="w-10 h-5 rounded-full transition-colors duration-200 ease-in-out relative"
                style={{
                  backgroundColor:
                    isChecked || isSuperAdmin
                      ? currentTheme.primary
                      : currentTheme.borderColor,
                }}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${
                    isChecked || isSuperAdmin ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </td>
        );
      })}
    </tr>
  );
}