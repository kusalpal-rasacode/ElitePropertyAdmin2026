"use client";
import React, { useEffect, useState } from "react";
import { MdAdd, MdArrowForward, MdSecurity, MdBusiness, MdHeadsetMic, MdMoreHoriz, MdDelete } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "next/navigation";
import { getAllRoles, deleteRole } from "@/services/rbac.service";
import { RbacRole } from "@/types/rbac.type";
import { ConfirmModal } from "@/components/common/ConfirmModal";

const ROLE_COLORS = ["bg-[#1E3A8A]", "bg-[#0F766E]", "bg-[#B45309]", "bg-[#6D28D9]", "bg-[#B91C1C]"];
const ROLE_ICONS = [
    <MdSecurity size={24} className="text-white" />,
    <MdBusiness size={24} className="text-white" />,
    <MdHeadsetMic size={24} className="text-white" />,
];

const formatRoleName = (name: string) =>
    String(name).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
const getRoleId = (role: RbacRole): number => Number(role.id ?? role.Id ?? 0);

export default function RolesPage() {
    const { currentTheme } = useTheme();
    const router = useRouter();
    const [expandedRole, setExpandedRole] = useState<number | null>(null);
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        getAllRoles()
            .then(setRoles)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedRole(expandedRole === id ? null : id);
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        setDeleting(true);
        try {
            await deleteRole(deleteId);
            setRoles((prev) => prev.filter((r) => getRoleId(r) !== deleteId));
            if (expandedRole === deleteId) setExpandedRole(null);
        } catch (err) {
            console.error("Failed to delete role", err);
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const roleToDelete = roles.find((r) => getRoleId(r) === deleteId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px] font-bold animate-pulse" style={{ color: currentTheme.textColor }}>
                Loading roles…
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>Access Control</h1>
                    <p className="font-medium text-sm" style={{ color: currentTheme.textColor }}>
                        Configure roles and manage user assignments.
                    </p>
                </div>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm"
                    style={{ backgroundColor: currentTheme.primary }}
                    onClick={() => router.push("/roles/add")}
                >
                    <MdAdd size={20} />
                    <span>Add New Role</span>
                </button>
            </div>

            <div className="grid gap-4">
                {roles.map((role, idx) => (
                    <div
                        key={getRoleId(role)}
                        className={`rounded-xl border transition-all duration-300 overflow-hidden backdrop-blur-md ${expandedRole === getRoleId(role) ? "shadow-md" : "hover:shadow-sm"}`}
                        style={{
                            backgroundColor: currentTheme.cardBg + 'E6',
                            borderColor: expandedRole === getRoleId(role) ? currentTheme.primary : currentTheme.borderColor
                        }}
                    >
                        {/* Header */}
                        <div
                            onClick={() => toggleExpand(getRoleId(role))}
                            className="p-5 cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${ROLE_COLORS[idx % ROLE_COLORS.length]}`}>
                                    {ROLE_ICONS[idx % ROLE_ICONS.length]}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold" style={{ color: currentTheme.headingColor }}>{formatRoleName(role.name)}</h3>
                                    <p className="text-sm mt-0.5" style={{ color: currentTheme.textColor }}>{role.role_title || "—"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textColor, opacity: 0.7 }}>
                                        {role.user_count ?? role.users?.length ?? 0} Users
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(getRoleId(role)); }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500"
                                    style={{ color: currentTheme.textColor }}
                                    title="Delete role"
                                >
                                    <MdDelete size={18} />
                                </button>

                                <button
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80 ${expandedRole === getRoleId(role) ? "rotate-90 text-white" : ""}`}
                                    style={{
                                        backgroundColor: expandedRole === getRoleId(role) ? currentTheme.primary : currentTheme.background,
                                        color: expandedRole === getRoleId(role) ? 'white' : currentTheme.textColor
                                    }}
                                >
                                    <MdArrowForward size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedRole === getRoleId(role) && (
                            <div className="border-t p-6" style={{ backgroundColor: currentTheme.background + '80', borderColor: currentTheme.borderColor }}>
                                <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                                    <table className="w-full text-left">
                                        <thead className="border-b" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold uppercase" style={{ color: currentTheme.textColor }}>User Name</th>
                                                <th className="px-6 py-3 text-xs font-bold uppercase" style={{ color: currentTheme.textColor }}>Email / Username</th>
                                                <th className="px-6 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: currentTheme.borderColor }}>
                                            {role.users && role.users.length > 0 ? (
                                                role.users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-500/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border shrink-0"
                                                                    style={{
                                                                        backgroundColor: currentTheme.background,
                                                                        borderColor: currentTheme.borderColor,
                                                                        color: currentTheme.primary
                                                                    }}
                                                                >
                                                                    {getInitials(user.first_name, user.last_name)}
                                                                </div>
                                                                <span className="font-bold text-sm" style={{ color: currentTheme.primary }}>
                                                                    {user.first_name} {user.last_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm" style={{ color: currentTheme.textColor }}>
                                                            {user.email || user.username}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="hover:opacity-70 p-1" style={{ color: currentTheme.textColor }}>
                                                                <MdMoreHoriz size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-sm font-medium" style={{ color: currentTheme.textColor, opacity: 0.5 }}>
                                                        No users assigned to this role.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Role"
                message={`Are you sure you want to delete "${roleToDelete ? formatRoleName(roleToDelete.name) : ""}"? This action cannot be undone.`}
                confirmLabel="Delete"
                isLoading={deleting}
            />
        </div>
    );
}
