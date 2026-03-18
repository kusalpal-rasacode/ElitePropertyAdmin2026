"use client";

import React, { useState, useEffect } from "react";
import {
    MdMoreHoriz,
    MdBusiness,
    MdPeople,
    MdLocalOffer,
    MdSecurity,
    MdEdit,
    MdDelete,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import {
    createOrganization,
    deleteOrganization,
    getOrganizations,
    getOrganizationUsers,  
    getOrganizationPlans,  
    getOrganizationRoles,
} from "@/services/organization.service";
import {
    CreateOrganizationDto,
    Organization,
    OrganizationParams,
} from "@/types/organization.types";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { Pagination } from "@/components/common/Pagination";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import { ListingPageHeader } from "@/components/common/ListingPageHeader";
import { FilterPanel } from "@/components/common/FilterPanel";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function OrganizationsPage() {
    const { currentTheme } = useTheme();
    const router = useRouter();

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
const [orgCounts, setOrgCounts] = useState<Record<number, { users: number; plans: number; roles: number }>>({});
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 1,
    });

    // ─── Create Modal State ───────────────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newOrgData, setNewOrgData] = useState<CreateOrganizationDto>({
        name: "",
        industry: "",
        logo_url: "",
    });
    const [creating, setCreating] = useState(false);

    // ─── Fetch ────────────────────────────────────────────────────────────────
    const fetchOrganizations = async (page = pagination.page) => {
    setLoading(true);
    try {
        const params: OrganizationParams = {
            page,
            limit: pagination.limit,
            search: searchQuery,
        };
        const response = await getOrganizations(params);

        let orgs: Organization[] = [];

        if (response && Array.isArray(response.data)) {
            orgs = response.data;
            setOrganizations(orgs);
            if (response.pagination) {
                setPagination((prev) => ({
                    ...prev,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages,
                }));
            }
        } else if (Array.isArray(response)) {
            orgs = response;
            setOrganizations(orgs);
        } else {
            setOrganizations([]);
        }

        // Fetch counts for each org in parallel
        if (orgs.length > 0) {
            Promise.all(
                orgs.map(async (org: Organization) => {
                    const [usersData, plansData, rolesData] = await Promise.all([
                        getOrganizationUsers(org.id).catch(() => []),
                        getOrganizationPlans(org.id).catch(() => []),
                        getOrganizationRoles(org.id).catch(() => []),
                    ]);
                    return {
                        id: org.id,
                        users: (Array.isArray(usersData) ? usersData : (usersData as any).data || []).length,
                        plans: (Array.isArray(plansData) ? plansData : (plansData as any).data || []).length,
                        roles: (Array.isArray(rolesData) ? rolesData : (rolesData as any).data || []).length,
                    };
                })
            ).then((results) => {
                const map: Record<number, { users: number; plans: number; roles: number }> = {};
                results.forEach((r) => {
                    map[r.id] = { users: r.users, plans: r.plans, roles: r.roles };
                });
                setOrgCounts(map);
            });
        }

    } catch (error) {
        console.error("Failed to fetch organizations", error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrganizations();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // ─── Delete ───────────────────────────────────────────────────────────────
    const {
        deleteId: selectedOrgId,
        isDeleteLoading: deleting,
        initiateDelete: initiateDeleteOrg,
        cancelDelete,
        confirmDelete: handleDeleteOrganization,
    } = useDeleteConfirm({
        onDelete: async (id) => {
            await deleteOrganization(id as number);
            fetchOrganizations();
        },
        successMessage: "Organization deleted successfully",
        errorMessage: "Failed to delete organization",
    });

    // ─── Create ───────────────────────────────────────────────────────────────
    const handleCreateOrganization = async () => {
        if (!newOrgData.name) return;
        setCreating(true);
        try {
            await createOrganization(newOrgData);
            setIsCreateModalOpen(false);
            setNewOrgData({ name: "", industry: "", logo_url: "" });
            fetchOrganizations();
            showSuccessToast("Organization created successfully");
        } catch (error) {
            console.error("Failed to create organization", error);
            showErrorToast("Failed to create organization");
        } finally {
            setCreating(false);
        }
    };

    return (
        <PermissionGuard requireSuperAdmin>
            <div className="max-w-[1600px] mx-auto space-y-6 pb-20">

                {/* Header */}
                <ListingPageHeader
                    title="Organizations"
                    subtitle="Manage your organizations and their details."
                    tabs={[]}
                    activeTab=""
                    onTabChange={() => {}}
                    searchQuery={searchQuery}
                    searchPlaceholder="Search organizations..."
                    onSearchChange={setSearchQuery}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters((p) => !p)}
                    addLabel="Add Organization"
                    onAddClick={() => setIsCreateModalOpen(true)}
                    canAdd={true}
                    mounted={true}
                />

                {/* Filters */}
                {showFilters && (
                    <FilterPanel
                        selects={[]}
                        inputs={[]}
                        onReset={() => {}}
                        resetLabel="Reset Filters"
                    />
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                        </div>
                    ) : organizations.length > 0 ? (
                        organizations.map((org) => (
                            <div
                                key={org.id}
                                onClick={() => router.push(`/organizations/${org.id}`)}
                                className="rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md flex flex-col"
                                style={{
                                    backgroundColor: currentTheme.cardBg + "E6",
                                    borderColor: currentTheme.borderColor,
                                }}
                            >
                                {/* Logo */}
                                <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-50 blur-sm"
                                        style={{
                                            backgroundImage: org.logo_url
                                                ? `url(${org.logo_url})`
                                                : "none",
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div
                                        className="h-24 w-24 rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold uppercase overflow-hidden relative z-10"
                                        style={{
                                            backgroundColor: currentTheme.cardBg,
                                            color: currentTheme.primary,
                                        }}
                                    >
                                        {org.logo_url ? (
                                            <img
                                                src={org.logo_url}
                                                alt={org.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (org.name || "Org").slice(0, 2)
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm bg-emerald-500">
                                        Active
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3
                                            className="text-lg font-bold line-clamp-1 transition-colors"
                                            style={{ color: currentTheme.headingColor }}
                                        >
                                            {org.name}
                                        </h3>
                                    </div>

                                    <div
                                        className="flex items-center gap-1 text-sm mb-4"
                                        style={{ color: currentTheme.textColor }}
                                    >
                                        <MdBusiness size={16} />
                                        <p>{org.industry || "Industry not specified"}</p>
                                    </div>

                                    {/* Stats */}
<div
    className="grid grid-cols-3 gap-2 py-3 border-t mt-auto"
    style={{ borderColor: currentTheme.borderColor }}
>
    {[
        { icon: <MdPeople />,     label: "Users", value: orgCounts[org.id]?.users },
        { icon: <MdLocalOffer />, label: "Plans", value: orgCounts[org.id]?.plans },
        { icon: <MdSecurity />,   label: "Roles", value: orgCounts[org.id]?.roles },
    ].map(({ icon, label, value }, i) => (
        <div
            key={label}
            className={`flex flex-col items-center ${i > 0 ? "border-l" : ""}`}
            style={{ borderColor: currentTheme.borderColor }}
        >
            <div
                className="flex items-center gap-1.5 mb-1"
                style={{ color: currentTheme.textColor, opacity: 0.8 }}
            >
                {icon}
                <span className="text-xs font-bold">{label}</span>
            </div>
            <span
                className="text-sm font-bold"
                style={{ color: currentTheme.headingColor }}
            >
                {value !== undefined ? value : (
                    <span className="inline-block h-3 w-5 rounded bg-gray-200 animate-pulse" />
                )}
            </span>
        </div>
    ))}
</div>

                                    {/* Footer row */}
                                    <div
                                        className="pt-4 border-t flex items-center justify-between mt-2"
                                        style={{ borderColor: currentTheme.borderColor }}
                                    >
                                        <span
                                            className="text-xs font-medium"
                                            style={{ color: currentTheme.textColor }}
                                        >
                                            Created recently
                                        </span>

                                        {/* Dropdown menu */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(
                                                        activeMenuId === org.id ? null : org.id
                                                    );
                                                }}
                                                className="hover:opacity-80 p-1 rounded-full hover:bg-black/5 transition-colors"
                                                style={{ color: currentTheme.textColor }}
                                            >
                                                <MdMoreHoriz size={20} />
                                            </button>

                                            {activeMenuId === org.id && (
                                                <div
                                                    className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2"
                                                    style={{
                                                        backgroundColor: currentTheme.cardBg,
                                                        borderColor: currentTheme.borderColor,
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex flex-col py-1">
                                                        <button
                                                            onClick={() =>
                                                                router.push(`/organizations/${org.id}`)
                                                            }
                                                            className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors flex items-center gap-2"
                                                            style={{ color: currentTheme.headingColor }}
                                                        >
                                                            <MdEdit size={16} />
                                                            Edit Details
                                                        </button>
                                                        <div
                                                            className="h-px my-1"
                                                            style={{
                                                                backgroundColor: currentTheme.borderColor,
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                initiateDeleteOrg(org.id);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <MdDelete size={16} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center opacity-60">
                            <p className="text-lg">No organizations found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && organizations.length > 0 && (
                    <Pagination
                        pagination={pagination}
                        onPageChange={(page) => {
                            setPagination((p) => ({ ...p, page }));
                            fetchOrganizations(page);
                        }}
                    />
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div
                            className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300"
                            style={{ backgroundColor: currentTheme.cardBg }}
                        >
                            <h2
                                className="text-2xl font-bold mb-6"
                                style={{ color: currentTheme.headingColor }}
                            >
                                Create Organization
                            </h2>

                            <div className="space-y-4">
                                {[
                                    {
                                        label: "Name *",
                                        key: "name",
                                        placeholder: "Enter organization name",
                                    },
                                    {
                                        label: "Industry",
                                        key: "industry",
                                        placeholder: "e.g. Real Estate, Tech",
                                    },
                                    {
                                        label: "Logo URL",
                                        key: "logo_url",
                                        placeholder: "https://example.com/logo.png",
                                    },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key}>
                                        <label
                                            className="block text-sm font-bold mb-2 ml-1"
                                            style={{ color: currentTheme.textColor }}
                                        >
                                            {label}
                                        </label>
                                        <input
                                            type="text"
                                            value={newOrgData[key as keyof CreateOrganizationDto]}
                                            onChange={(e) =>
                                                setNewOrgData({
                                                    ...newOrgData,
                                                    [key]: e.target.value,
                                                })
                                            }
                                            className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                                            style={{
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                            }}
                                            placeholder={placeholder}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-bold border transition-colors hover:bg-black/5"
                                    style={{
                                        borderColor: currentTheme.borderColor,
                                        color: currentTheme.textColor,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateOrganization}
                                    disabled={creating || !newOrgData.name}
                                    className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
                                    style={{ backgroundColor: currentTheme.primary }}
                                >
                                    {creating ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={!!selectedOrgId}
                    onClose={cancelDelete}
                    onConfirm={handleDeleteOrganization}
                    title="Delete Organization"
                    message="Are you sure you want to delete this organization? This action cannot be undone."
                    confirmLabel="Delete"
                    confirmButtonColor="#ef4444"
                    isLoading={deleting}
                />
            </div>
        </PermissionGuard>
    );
}