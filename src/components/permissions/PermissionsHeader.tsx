"use client";
import { MdSave } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

interface PermissionsHeaderProps {
  saving: boolean;
  loading: boolean;
  onSave: () => void;
}

export function PermissionsHeader({ saving, loading, onSave }: PermissionsHeaderProps) {
  const { currentTheme } = useTheme();

  return (
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
        <button
          onClick={onSave}
          disabled={saving || loading}
          className="px-5 py-2 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <MdSave size={18} />
          <span>{saving ? "Saving…" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}