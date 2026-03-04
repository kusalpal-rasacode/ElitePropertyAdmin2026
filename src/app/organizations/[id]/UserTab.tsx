"use client";

import { MdPersonAdd, MdDelete, MdEmail, MdPhone } from "react-icons/md";

function UserTab({
  users,
  currentTheme,
  handleAddUserInit,
  setConfirmAction,
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div
          className="text-sm opacity-70 font-medium"
          style={{ color: currentTheme.textColor }}
        >
          Managing access for {users.length} users
        </div>
        <button
          onClick={handleAddUserInit}
          className="px-4 py-2 rounded-lg text-white font-bold text-xs uppercase tracking-wide shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <MdPersonAdd size={16} /> Add User
        </button>
      </div>

      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.borderColor,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b text-xs font-bold uppercase tracking-wider opacity-60 bg-black/[0.02]"
                style={{
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                }}
              >
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className="text-sm divide-y"
              style={{ borderColor: currentTheme.borderColor }}
            >
              {users.length > 0 ? (
                users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-black/[0.01] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-sm shadow-inner"
                          style={{
                            color: currentTheme.headingColor,
                          }}
                        >
                          {user.first_name?.[0] || user.username?.[0] || "U"}
                        </div>
                        <div>
                          <div
                            className="font-bold"
                            style={{
                              color: currentTheme.headingColor,
                            }}
                          >
                            {user.first_name} {user.last_name}
                          </div>
                          <div
                            className="text-xs opacity-60 font-mono"
                            style={{
                              color: currentTheme.textColor,
                            }}
                          >
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {user.email && (
                          <div
                            className="flex items-center gap-2 text-xs"
                            style={{
                              color: currentTheme.textColor,
                            }}
                          >
                            <MdEmail size={14} className="opacity-50" />{" "}
                            {user.email}
                          </div>
                        )}
                        {user.phone_number && (
                          <div
                            className="flex items-center gap-2 text-xs"
                            style={{
                              color: currentTheme.textColor,
                            }}
                          >
                            <MdPhone size={14} className="opacity-50" />{" "}
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-white"
                        style={{
                          borderColor: currentTheme.borderColor,
                          color: currentTheme.textColor,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: "user",
                            id: user.id,
                          })
                        }
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors opacity-70 hover:opacity-100"
                        title="Remove User"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <div className="p-4 rounded-full bg-black/5">
                        <MdPersonAdd size={32} />
                      </div>
                      <p className="font-medium">No users found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserTab;
