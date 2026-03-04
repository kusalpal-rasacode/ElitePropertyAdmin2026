"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdSecurity } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { createRole } from "@/services/rbac.service";
import { getOrganizations } from "@/services/organization.service";
import { Organization } from "@/types/organization.types";

type ActionKey = "view" | "add" |  "edit" | "delete";
type ModuleKey = "campaign" | "properties" | "user_management";

const MODULES: { key: ModuleKey; label: string }[] = [
    { key: "campaign", label: "Campaign" },
    { key: "properties", label: "Properties" },
    { key: "user_management", label: "User Management" },
];

const ACTIONS: { key: ActionKey; label: string }[] = [
    { key: "view", label: "View" },
    { key: "add", label: "Add" },    
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
];

type PermissionsMatrix = Record<ModuleKey, Record<ActionKey, boolean>>;

const defaultPermissions = (): PermissionsMatrix =>
    MODULES.reduce((acc, mod) => {
        acc[mod.key] = ACTIONS.reduce((a, act) => {
            a[act.key] = false;
            return a;
        }, {} as Record<ActionKey, boolean>);
        return acc;
    }, {} as PermissionsMatrix);

export default function AddRoleForm() {
    const { currentTheme } = useTheme();
    const router = useRouter();

    const [role, setRole] = useState("");
    const [organizationId, setOrganizationId] = useState<number | "">("");
    const [permissions, setPermissions] = useState<PermissionsMatrix>(defaultPermissions());
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getOrganizations({ limit: 100 })
            .then((res) => setOrganizations(res.data))
            .catch(() => setOrganizations([]))
            .finally(() => setLoadingOrgs(false));
    }, []);

    const togglePermission = (mod: ModuleKey, action: ActionKey) => {
        setPermissions((prev) => ({
            ...prev,
            [mod]: {
                ...prev[mod],
                [action]: !prev[mod][action],
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim() ) return;
        // || organizationId === ""

        setSubmitting(true);
        setError(null);
         let payload;
if (organizationId !== "") {
      payload = {
            role: role.trim(),
            organization_id: organizationId,
            permission: [
                {
                    campaign: permissions.campaign,
                    properties: permissions.properties,
                    user_management: permissions.user_management,
                },
            ],
        };
}else{
      payload = {
            role: role.trim(), 
            permission: [
                {
                    campaign: permissions.campaign,
                    properties: permissions.properties,
                    user_management: permissions.user_management,
                },
            ],
        };
}
      

        try {
           const response= await createRole(payload);
           console.log('response',response);
           
            router.push("/roles");
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to create role. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/roles")}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity font-bold text-sm"
                    style={{ color: currentTheme.textColor }}
                >
                    <MdArrowBack size={20} />
                    Back to Roles
                </button>
            </div>

            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>
                    Add New Role
                </h1>
                <p className="text-sm font-medium mt-1" style={{ color: currentTheme.textColor }}>
                    Define a role name, assign it to an organization, and configure module permissions.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card */}
                <div
                    className="rounded-xl border p-6 space-y-6"
                    style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
                >
                    {/* Role Name */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-1.5"
                            style={{ color: currentTheme.textColor }}
                        >
                            Role Name
                        </label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            placeholder="e.g. free_role"
                            className="w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none focus:ring-2 text-sm"
                            style={{
                                borderColor: currentTheme.borderColor,
                                color: currentTheme.headingColor,
                                // @ts-ignore
                                "--tw-ring-color": currentTheme.primary + "40",
                            }}
                        />
                    </div>

                    {/* Organization */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-1.5"
                            style={{ color: currentTheme.textColor }}
                        >
                            Organization
                        </label>
                        <select
                            value={organizationId}
                            onChange={(e) => setOrganizationId(Number(e.target.value))}
                            // required
                            disabled={loadingOrgs}
                            className="w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none focus:ring-2 text-sm"
                            style={{
                                borderColor: currentTheme.borderColor,
                                color: organizationId === "" ? currentTheme.textColor : currentTheme.headingColor,
                                backgroundColor: currentTheme.cardBg,
                            }}
                        >
                            <option value="" disabled>
                                {loadingOrgs ? "Loading organizations…" : "Select an organization"}
                            </option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Permissions Matrix */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-3"
                            style={{ color: currentTheme.textColor }}
                        >
                            Permissions
                        </label>

                        <div
                            className="rounded-lg border overflow-hidden"
                            style={{ borderColor: currentTheme.borderColor }}
                        >
                            <table className="w-full text-left table-fixed">
                                <thead>
                                    <tr
                                        className="border-b"
                                        style={{
                                            backgroundColor: currentTheme.background,
                                            borderColor: currentTheme.borderColor,
                                        }}
                                    >
                                        <th
                                            className="px-5 py-3 text-xs font-bold uppercase tracking-wider w-1/3"
                                            style={{ color: currentTheme.textColor }}
                                        >
                                            Module
                                        </th>
                                        {ACTIONS.map((action) => (
                                            <th
                                                key={action.key}
                                                className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-center"
                                                style={{ color: currentTheme.textColor }}
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
                                    {MODULES.map((mod) => (
                                        <tr
                                            key={mod.key}
                                            className="transition-colors hover:bg-black/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MdSecurity
                                                        size={16}
                                                        style={{ color: currentTheme.primary }}
                                                        className="opacity-70"
                                                    />
                                                    <span
                                                        className="text-sm font-bold"
                                                        style={{ color: currentTheme.headingColor }}
                                                    >
                                                        {mod.label}
                                                    </span>
                                                </div>
                                            </td>
                                            {ACTIONS.map((action) => {
                                                const isChecked = permissions[mod.key][action.key];
                                                const isDisabled =
                                                    action.key !== "view" &&
                                                    !permissions[mod.key].view;
                                                return (
                                                    <td key={action.key} className="px-5 py-4 text-center">
                                                        <label
                                                            className={`inline-flex items-center justify-center cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only"
                                                                // checked={isChecked}
                                                                onChange={() => !isDisabled && togglePermission(mod.key, action.key)}
                                                                disabled={isDisabled}
                                                            />
                                                            {/* Track */}
                                                            <div
                                                                className="w-10 h-5 rounded-full transition-colors duration-200 ease-in-out relative"
                                                                style={{
                                                                    backgroundColor: isChecked
                                                                        ? currentTheme.primary
                                                                        : currentTheme.borderColor,
                                                                }}
                                                            >
                                                                {/* Thumb */}
                                                                <div
                                                                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${isChecked ? "translate-x-5" : "translate-x-0"}`}
                                                                />
                                                            </div>
                                                        </label>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm font-medium text-red-500">{error}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => router.push("/roles")}
                        className="px-5 py-2.5 rounded-lg border font-bold text-sm transition-colors hover:bg-black/5"
                        style={{
                            borderColor: currentTheme.borderColor,
                            color: currentTheme.textColor,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !role.trim()}
                        //  || organizationId === ""
                        className="px-6 py-2.5 rounded-lg text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: currentTheme.primary }}
                    >
                        {submitting ? "Creating…" : "Create Role"}
                    </button>
                </div>
            </form>
        </div>
    );
}
