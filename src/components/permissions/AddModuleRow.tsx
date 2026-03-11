"use client";
import { useTheme } from "@/providers/ThemeProvider";
import { ACTION_CONFIG } from "@/services/rbac.service";

interface AddModuleRowProps {
  isAddingModule: boolean;
  newModuleLabel: string;
  onLabelChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  onStartAdding: () => void;
}

export function AddModuleRow({
  isAddingModule,
  newModuleLabel,
  onLabelChange,
  onAdd,
  onCancel,
  onStartAdding,
}: AddModuleRowProps) {
  const { currentTheme } = useTheme();

  if (isAddingModule) {
    return (
      <tr>
        <td colSpan={ACTION_CONFIG.length + 1} className="px-6 py-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              autoFocus
              value={newModuleLabel}
              onChange={(e) => onLabelChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
              placeholder="Enter module name"
              className="px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.borderColor,
                color: currentTheme.textColor,
              }}
            />
            <button
              onClick={onAdd}
              className="px-3 py-1.5 text-xs font-bold text-white rounded-lg hover:brightness-110"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Add
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border hover:bg-black/5"
              style={{
                borderColor: currentTheme.borderColor,
                color: currentTheme.textColor,
              }}
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={ACTION_CONFIG.length + 1} className="px-6 py-4">
        <button
          onClick={onStartAdding}
          className="text-sm font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ color: currentTheme.primary }}
        >
          + Add Target Module
        </button>
      </td>
    </tr>
  );
}