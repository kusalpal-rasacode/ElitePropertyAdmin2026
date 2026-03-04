"use client";

import React, { useState, useEffect } from "react";
import {
    MdAdd,
    MdSearch,
    MdFilterList,
    MdMoreHoriz,
    MdChevronLeft,
    MdChevronRight,
    MdBusiness,
    MdPeople,
    MdLocalOffer,
    MdSecurity,
    MdEdit,
    MdDelete
} from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import {
    createOrganization,
    deleteOrganization,
    getOrganizations
} from "@/services/organization.service";
import {
    CreateOrganizationDto,
    Organization,
    OrganizationParams
} from "@/types/organization.types";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function OrganizationsPage() {
    const { currentTheme } = useTheme();
    const router = useRouter();

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 1
    });

    // Create/Delete Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [newOrgData, setNewOrgData] = useState<CreateOrganizationDto>({
        name: "",
        industry: "",
        logo_url: ""
    });
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const params: OrganizationParams = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery
            };
            const response = await getOrganizations(params);

            if (response && Array.isArray(response.data)) {
                setOrganizations(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else if (Array.isArray(response)) {
                setOrganizations(response);
            } else {
                setOrganizations([]);
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
    }, [searchQuery, pagination.page]);

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

    const handleDeleteOrganization = async () => {
        if (!selectedOrgId) return;
        setDeleting(true);
        try {
            await deleteOrganization(selectedOrgId);
            setIsDeleteModalOpen(false);
            setSelectedOrgId(null);
            fetchOrganizations();
            showSuccessToast("Organization deleted successfully");
        } catch (error) {
            console.error("Failed to delete organization", error);
            showErrorToast("Failed to delete organization");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>
                        Organizations
                    </h1>
                    <p className="font-medium text-sm" style={{ color: currentTheme.textColor }}>
                        Manage your organizations and their details.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: currentTheme.textColor }} />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64 transition-all"
                            style={{
                                backgroundColor: currentTheme.cardBg,
                                borderColor: currentTheme.borderColor,
                                color: currentTheme.textColor
                            }}
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 border rounded-lg hover:brightness-95 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none ${showFilters ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
                            style={{
                                backgroundColor: showFilters ? currentTheme.cardBg : currentTheme.cardBg,
                                borderColor: showFilters ? currentTheme.primary : currentTheme.borderColor,
                                color: showFilters ? currentTheme.primary : currentTheme.headingColor
                            }}
                        >
                            <MdFilterList size={18} />
                            Filter
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full px-5 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                            style={{ backgroundColor: currentTheme.primary }}
                        >
                            <MdAdd size={20} />
                            Add Organization
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters (Hidden Logic) - Can expand later */}
            {showFilters && (
                <div className="p-4 rounded-xl border mb-6" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                    <p className="text-sm opacity-60">Filter functionality for organizations coming soon...</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : organizations.length > 0 ? (
                    organizations.map((org) => (
                        <div
                            key={org.id}
                            onClick={() => router.push(`/organizations/${org.id}`)}
                            className="rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md flex flex-col"
                            style={{
                                backgroundColor: currentTheme.cardBg + 'E6',
                                borderColor: currentTheme.borderColor
                            }}
                        >
                            {/* Image / Logo Section - Replicating Property Image Style */}
                            <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                {/* Logo Background / Placeholder */}
                                <div className="absolute inset-0 bg-cover bg-center opacity-50 blur-sm" style={{ backgroundImage: org.logo_url ? `url(${org.logo_url})` : 'none' }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                {/* Actual Logo */}
                                <div className="h-24 w-24 rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold uppercase overflow-hidden relative z-10"
                                    style={{
                                        backgroundColor: currentTheme.cardBg,
                                        color: currentTheme.primary
                                    }}
                                >
                                    {org.logo_url ? (
                                        <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                                    ) : (
                                        (org.name || "Org").slice(0, 2)
                                    )}
                                </div>

                                {/* Status Tag */}
                                <div className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm bg-emerald-500">
                                    Active
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold line-clamp-1 transition-colors" style={{ color: currentTheme.headingColor }}>
                                        {org.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1 text-sm mb-4" style={{ color: currentTheme.textColor }}>
                                    <MdBusiness size={16} />
                                    <p>{org.industry || "Industry not specified"}</p>
                                </div>

                                {/* Stats Grid (Replacing Bed/Bath details) */}
                                <div className="grid grid-cols-3 gap-2 py-3 border-t mt-auto" style={{ borderColor: currentTheme.borderColor }}>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                                            <MdPeople />
                                            <span className="text-xs font-bold">Users</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>--</span>
                                    </div>
                                    <div className="flex flex-col items-center border-l" style={{ borderColor: currentTheme.borderColor }}>
                                        <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                                            <MdLocalOffer />
                                            <span className="text-xs font-bold">Plans</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>--</span>
                                    </div>
                                    <div className="flex flex-col items-center border-l" style={{ borderColor: currentTheme.borderColor }}>
                                        <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                                            <MdSecurity />
                                            <span className="text-xs font-bold">Roles</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>--</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex items-center justify-between mt-2" style={{ borderColor: currentTheme.borderColor }}>
                                    <span className="text-xs font-medium" style={{ color: currentTheme.textColor }}>Created recently</span>

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === org.id ? null : org.id);
                                            }}
                                            className="hover:opacity-80 p-1 rounded-full hover:bg-black/5 transition-colors"
                                            style={{ color: currentTheme.textColor }}
                                        >
                                            <MdMoreHoriz size={20} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenuId === org.id && (
                                            <div
                                                className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2"
                                                style={{
                                                    backgroundColor: currentTheme.cardBg,
                                                    borderColor: currentTheme.borderColor
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex flex-col py-1">
                                                    <button
                                                        onClick={() => router.push(`/organizations/${org.id}`)}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors flex items-center gap-2"
                                                        style={{ color: currentTheme.headingColor }}
                                                    >
                                                        <MdEdit size={16} /> Edit Details
                                                    </button>

                                                    <div className="h-px bg-black/5 my-1" style={{ backgroundColor: currentTheme.borderColor }}></div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrgId(org.id);
                                                            setIsDeleteModalOpen(true);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <MdDelete size={16} /> Delete
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

            {/* Pagination Controls */}
            {!loading && organizations.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t mt-8" style={{ borderColor: currentTheme.borderColor }}>

                    <div className="text-sm opacity-70" style={{ color: currentTheme.textColor }}>
                        Showing <span className="font-bold">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold">{Math.min(pagination.page * pagination.limit, pagination.total || organizations.length)}</span> of <span className="font-bold">{pagination.total || organizations.length}</span> entries
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={{
                                borderColor: currentTheme.borderColor,
                                color: currentTheme.headingColor
                            }}
                        >
                            <MdChevronLeft size={20} />
                        </button>

                        {/* Simplified Page Numbers */}
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold text-white shadow-md transform scale-105"
                            style={{ backgroundColor: currentTheme.primary }}
                        >
                            {pagination.page}
                        </button>

                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages || 1, prev.page + 1) }))}
                            disabled={pagination.page === (pagination.totalPages || 1)}
                            className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={{
                                borderColor: currentTheme.borderColor,
                                color: currentTheme.headingColor
                            }}
                        >
                            <MdChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300"
                        style={{ backgroundColor: currentTheme.cardBg }}
                    >
                        <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.headingColor }}>Create Organization</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1" style={{ color: currentTheme.textColor }}>Name *</label>
                                <input
                                    type="text"
                                    value={newOrgData.name}
                                    onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                                    className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                                    style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                    placeholder="Enter organization name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1" style={{ color: currentTheme.textColor }}>Industry</label>
                                <input
                                    type="text"
                                    value={newOrgData.industry}
                                    onChange={(e) => setNewOrgData({ ...newOrgData, industry: e.target.value })}
                                    className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                                    style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                    placeholder="e.g. Real Estate, Tech"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1" style={{ color: currentTheme.textColor }}>Logo URL</label>
                                <input
                                    type="text"
                                    value={newOrgData.logo_url}
                                    onChange={(e) => setNewOrgData({ ...newOrgData, logo_url: e.target.value })}
                                    className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                                    style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold border transition-colors hover:bg-black/5"
                                style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
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
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteOrganization}
                title="Delete Organization"
                message="Are you sure you want to delete this organization? This action cannot be undone."
                confirmLabel="Delete"
                confirmButtonColor="#ef4444"
                isLoading={deleting}
            />
        </div>
    );
}
