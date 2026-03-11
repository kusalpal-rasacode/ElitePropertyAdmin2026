"use client";
import { MdOutlineShield, MdLockOutline } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import type { RbacRole } from "@/types/rbac.type";
import { getRoleId, getRoleLabel } from "@/utils/Rolehelpers";

interface RoleSelectorProps {
  roles: RbacRole[];
  selectedRole: RbacRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  onRoleChange: (roleId: string) => void;
}

export function RoleSelector({
  roles,
  selectedRole,
  loading,
  isSuperAdmin,
  onRoleChange,
}: RoleSelectorProps) {
  const { currentTheme } = useTheme();

  return (
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
        <p className="text-xs mt-1" style={{ color: currentTheme.textColor }}>
          Select role to modify permissions:
        </p>
      </div>

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
            onChange={(e) => onRoleChange(e.target.value)}
          >
            {roles.map((role) => (
              <option key={String(getRoleId(role))} value={String(getRoleId(role))}>
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

      {isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 text-amber-800 font-medium text-xs">
          <MdLockOutline size={16} className="shrink-0 mt-0.5" />
          <p>System Locked: Super Admin permissions cannot be modified.</p>
        </div>
      )}
    </div>
  );
}