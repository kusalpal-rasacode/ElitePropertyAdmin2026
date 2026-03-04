import { MdSecurity, MdCheck, MdClear } from "react-icons/md";

function RoleTab({
  roles,
  selectedRoleId,
  setSelectedRoleId,
  currentTheme,
  roleActions,
  roleModules,
  checkPermission,
  selectedRole,
  selectedRoleDisplayName,
  selectedRoleDescription,
}: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-4 space-y-4">
        {roles.length > 0 ? (
          roles.map((role: any, idx: any) => {
            const roleName =
              role.role ||
              role.name ||
              role.Name ||
              role.label ||
              "Unknown Role";
            const displayName = String(roleName)
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const roleId = String(role.id || role.Id || role._id || idx);
            const roleDescription =
              role.role_title ||
              role.description ||
              role.title ||
              "Custom defined role with specific permission sets.";
            const isSelected = roleId === selectedRoleId;

            return (
              <div
                key={roleId}
                onClick={() => setSelectedRoleId(roleId)}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer ${isSelected ? "shadow-md" : "hover:shadow-md"}`}
                style={{
                  borderColor: isSelected
                    ? currentTheme.primary
                    : currentTheme.borderColor,
                  backgroundColor: currentTheme.cardBg,
                }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full opacity-100 transition-opacity"
                  style={{
                    backgroundColor: isSelected
                      ? currentTheme.primary
                      : `${currentTheme.primary}40`,
                  }}
                ></div>

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-xl transition-colors shadow-sm"
                    style={{
                      backgroundColor: currentTheme.primary + "15",
                      color: currentTheme.primary,
                    }}
                  >
                    <MdSecurity size={24} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-gray-100 text-gray-500 font-bold border border-gray-200">
                    ID: {roleId}
                  </span>
                </div>

                <div className="mb-2">
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ color: currentTheme.headingColor }}
                  >
                    {displayName}
                  </h3>
                  <p
                    className="text-sm opacity-70 leading-relaxed line-clamp-2 min-h-[2.5em]"
                    style={{ color: currentTheme.textColor }}
                  >
                    {roleDescription}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="py-16 text-center border-2 border-dashed rounded-2xl flex flex-col items-center gap-3"
            style={{
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
            }}
          >
            <div className="p-4 rounded-full bg-black/5 opacity-50">
              <MdSecurity size={32} />
            </div>
            <span className="opacity-60 font-medium">
              No custom roles defined.
            </span>
          </div>
        )}
      </div>

      <div className="xl:col-span-8">
        {selectedRole ? (
          <div
            className="rounded-2xl border overflow-hidden shadow-sm bg-white"
            style={{ borderColor: currentTheme.borderColor }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: currentTheme.borderColor }}
            >
              <h3
                className="font-bold text-lg mb-1"
                style={{ color: currentTheme.headingColor }}
              >
                {selectedRoleDisplayName}
              </h3>
              <p
                className="text-sm opacity-70 leading-relaxed"
                style={{ color: currentTheme.textColor }}
              >
                {selectedRoleDescription}
              </p>
            </div>

            <div className="bg-gray-50/50 p-4 xl:p-0">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: currentTheme.borderColor,
                    }}
                  >
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider opacity-50 w-1/3 text-left">
                      Module
                    </th>
                    {roleActions.map((action: any) => (
                      <th
                        key={action.key}
                        className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-wider opacity-50"
                      >
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: currentTheme.borderColor }}
                >
                  {roleModules.map((module: any) => (
                    <tr
                      key={module.key}
                      className="bg-transparent hover:bg-black/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ color: currentTheme.primary }}
                            className="opacity-80"
                          >
                            {module.icon}
                          </span>
                          <span
                            className="font-bold text-xs"
                            style={{
                              color: currentTheme.headingColor,
                            }}
                          >
                            {module.label}
                          </span>
                        </div>
                      </td>
                      {roleActions.map((action: any) => {
                        const hasAccess = checkPermission(
                          selectedRole,
                          module.key,
                          action.key,
                        );

                        return (
                          <td
                            key={action.key}
                            className="py-3 px-4 text-center"
                          >
                            {hasAccess ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 shadow-sm">
                                <MdCheck size={14} />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 opacity-30">
                                <MdClear size={14} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="py-16 text-center border-2 border-dashed rounded-2xl flex flex-col items-center gap-3"
            style={{
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
            }}
          >
            <div className="p-4 rounded-full bg-black/5 opacity-50">
              <MdSecurity size={32} />
            </div>
            <span className="opacity-60 font-medium">
              Select a role to view permissions.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleTab;
