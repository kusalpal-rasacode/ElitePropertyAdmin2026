"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdSearch, MdFilterList, MdMoreHoriz, MdOutlineBedroomParent, MdOutlineBathroom, MdSquareFoot, MdLocationOn, MdChevronLeft, MdChevronRight } from "react-icons/md";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { getProperties, getPendingProperties, deletePropertyByIdService, approveProperty, rejectProperty, activeProperty, deactiveProperty } from "@/services/properties.service";
import { PropertyData } from "@/types/properties.types";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useModulePermission } from "@/hooks/useModulePermission";

export default function PropertiesPage() {
    const { currentTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { permissionReady, can } = useModulePermission("properties");
    const canViewProperties = can("view");
    const canAddProperties = can("add");
    const canEditProperties = can("edit");
    const canDeleteProperties = can("delete");

    const [properties, setProperties] = useState<PropertyData[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [listingImageFailures, setListingImageFailures] = useState<Record<string, boolean>>({});

    // Delete State
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // Modal State for Approve/Reject/Activate/Deactivate
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'activate' | 'deactivate' | null>(null);
    const [pendingPropertyId, setPendingPropertyId] = useState<number | string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pendingStatus, setPendingStatus] = useState<'pending' | 'approved' | 'rejected'>(
        (searchParams.get("pending_status") as 'pending' | 'approved' | 'rejected') || 'pending'
    );

    // ─── Read initial state from URL params ───────────────────────────────────
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>(
        (searchParams.get("tab") as 'all' | 'pending') || 'all'
    );
    const [pagination, setPagination] = useState({
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 9,
        total: 0,
        totalPages: 1
    });
    const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "All");
    const [filterListingType, setFilterListingType] = useState(searchParams.get("type") || "All");
    const [filterPropertyType, setFilterPropertyType] = useState(searchParams.get("property_type") || "All");
    const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
    const [beds, setBeds] = useState(searchParams.get("bedrooms") || "");
    const [baths, setBaths] = useState(searchParams.get("bathrooms") || "");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    // ──────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        setMounted(true);
        // Always write page & limit to URL on first load
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(pagination.page));
        params.set("limit", String(pagination.limit));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Sync all filter state → URL params ───────────────────────────────────
    const syncToUrl = useCallback((overrides: Record<string, string | number> = {}) => {
        const params = new URLSearchParams();

        const current = {
            tab: activeTab,
            pending_status: pendingStatus,
            page: pagination.page,
            limit: pagination.limit,
            search: searchQuery,
            status: filterStatus,
            type: filterListingType,
            property_type: filterPropertyType,
            min_price: minPrice,
            max_price: maxPrice,
            bedrooms: beds,
            bathrooms: baths,
            ...overrides,
        };

        if (current.tab && current.tab !== 'all') params.set("tab", String(current.tab));
        if (activeTab === 'pending' && current.pending_status && current.pending_status !== 'pending') params.set("pending_status", String(current.pending_status));
        if (current.search) params.set("search", String(current.search));
        if (current.status && current.status !== "All") params.set("status", String(current.status));
        if (current.type && current.type !== "All") params.set("type", String(current.type));
        if (current.property_type && current.property_type !== "All") params.set("property_type", String(current.property_type));
        if (current.min_price) params.set("min_price", String(current.min_price));
        if (current.max_price) params.set("max_price", String(current.max_price));
        if (current.bedrooms) params.set("bedrooms", String(current.bedrooms));
        if (current.bathrooms) params.set("bathrooms", String(current.bathrooms));
        // page & limit always last
        params.set("page", String(current.page || 1));
        params.set("limit", String(current.limit || 9));

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [activeTab, pendingStatus, pagination.page, pagination.limit, searchQuery, filterStatus, filterListingType, filterPropertyType, minPrice, maxPrice, beds, baths, pathname, router]);
    // ──────────────────────────────────────────────────────────────────────────

    // Wrapped setters that also update URL
    const handleSetActiveTab = (tab: 'all' | 'pending') => {
        setActiveTab(tab);
        setPagination(p => ({ ...p, page: 1 }));
        syncToUrl({ tab, page: 1 });
    };

    const handleSetPage = (page: number) => {
        setPagination(p => ({ ...p, page }));
        syncToUrl({ page });
    };

    const handleFilterChange = (key: string, value: string) => {
        // Reset to page 1 when any filter changes
        setPagination(p => ({ ...p, page: 1 }));
        syncToUrl({ [key]: value, page: 1 });
    };

    const resetFilters = () => {
        setFilterStatus("All");
        setFilterListingType("All");
        setFilterPropertyType("All");
        setMinPrice("");
        setMaxPrice("");
        setBeds("");
        setBaths("");
        setSearchQuery("");
        setPagination(p => ({ ...p, page: 1 }));
        router.replace(pathname, { scroll: false });
    };

    // ─── Open Modal Handlers ──────────────────────────────────────────────────
    const onApproveClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction('approve');
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const onRejectClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction('reject');
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const onActivateClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction('activate');
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const onDeactivateClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction('deactivate');
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const handleConfirmAction = async () => {
        if (!pendingPropertyId || !pendingAction) return;
        setActionLoading(true);
        try {
            if (pendingAction === 'approve') {
                await approveProperty(pendingPropertyId);
                showSuccessToast("Property approved successfully!");
                setRefreshKey(prev => prev + 1);
            } else if (pendingAction === 'reject') {
                await rejectProperty(pendingPropertyId);
                showSuccessToast("Property rejected successfully!");
                setRefreshKey(prev => prev + 1);
            } else if (pendingAction === 'activate') {
                await activeProperty(pendingPropertyId);
                showSuccessToast("Property activated successfully!");
                // Optimistically update is_active without full refetch
                setProperties(prev => prev.map(p => p.id === pendingPropertyId ? { ...p, is_active: true } : p));
            } else if (pendingAction === 'deactivate') {
                await deactiveProperty(pendingPropertyId);
                showSuccessToast("Property deactivated successfully!");
                setProperties(prev => prev.map(p => p.id === pendingPropertyId ? { ...p, is_active: false } : p));
            }
        } catch (error: any) {
            const errorMessage = error?.message || error?.error || `Failed to ${pendingAction} property.`;
            showErrorToast(errorMessage);
        } finally {
            setActionLoading(false);
            setIsActionModalOpen(false);
            setPendingAction(null);
            setPendingPropertyId(null);
        }
    };
    // ──────────────────────────────────────────────────────────────────────────

    // ─── Fetch properties (server-side filtering) ─────────────────────────────
    useEffect(() => {
        if (!permissionReady) return;
        if (!canViewProperties) {
            setProperties([]);
            setLoading(false);
            return;
        }

        const fetchProperties = async () => {
            setLoading(true);
            setError(null);
            try {
                // Build API params — only send defined/non-"All" values
                const apiParams: Record<string, any> = {
                    page: pagination.page,
                    limit: pagination.limit,
                };
                if (searchQuery) apiParams.search = searchQuery;
                if (filterListingType !== "All") apiParams.type = filterListingType;
                if (filterPropertyType !== "All") apiParams.property_type = filterPropertyType;
                if (filterStatus !== "All") apiParams.status = filterStatus.toLowerCase();
                if (minPrice) apiParams.min_price = Number(minPrice);
                if (maxPrice) apiParams.max_price = Number(maxPrice);
                if (beds) apiParams.bedrooms = Number(beds);
                if (baths) apiParams.bathrooms = Number(baths);

                let response;
                if (activeTab === 'pending') {
                    // Pending endpoint only supports: status (pending/approved/rejected), search, page, limit
                    response = await getPendingProperties({
                        page: pagination.page,
                        limit: pagination.limit,
                        status: pendingStatus,
                        ...(searchQuery ? { search: searchQuery } : {}),
                    });
                } else {
                    response = await getProperties(apiParams);
                }

                setProperties(response.data);
                if (response.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.pagination.total,
                        totalPages: response.pagination.totalPages
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch properties", err);
                setError("Failed to connect to the server. Please ensure the backend is running.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(fetchProperties, 500);
        return () => clearTimeout(timeoutId);
    }, [
        pagination.page,
        searchQuery,
        filterListingType,
        filterPropertyType,
        filterStatus,
        minPrice,
        maxPrice,
        beds,
        baths,
        activeTab,
        pendingStatus,
        refreshKey,
        permissionReady,
        canViewProperties
    ]);
    // ──────────────────────────────────────────────────────────────────────────

    // Keep URL in sync whenever state changes (covers cases like debounced search)
    useEffect(() => {
        if (!mounted) return;
        syncToUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pendingStatus, pagination.page, searchQuery, filterStatus, filterListingType, filterPropertyType, minPrice, maxPrice, beds, baths]);

    // ─── Delete handlers ──────────────────────────────────────────────────────
    const initiateDelete = (id: number | string) => {
        if (!canDeleteProperties) return;
        setDeleteId(id);
        setActiveMenuId(null);
    };

    const confirmDelete = async () => {
        if (!deleteId || !canDeleteProperties) return;
        setIsDeleteLoading(true);
        try {
            await deletePropertyByIdService(String(deleteId));
            setProperties(prev => prev.filter(p => p.id !== deleteId));
            setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete property:", error);
            alert("Failed to delete property. Please try again.");
        } finally {
            setIsDeleteLoading(false);
        }
    };
    // ──────────────────────────────────────────────────────────────────────────

    if (!loading && permissionReady && !canViewProperties) {
        return (
            <div className="max-w-[1600px] mx-auto py-10">
                <div className="rounded-xl border px-5 py-4 text-sm font-medium" style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}>
                    You do not have `view` permission for Properties.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
            <ConfirmModal
                isOpen={canDeleteProperties && !!deleteId}
                onClose={() => !isDeleteLoading && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Property"
                message="Are you sure you want to delete this property? This action cannot be undone."
                confirmLabel="Delete Property"
                isLoading={isDeleteLoading}
            />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>Property Listings</h1>
                    <p className="font-medium text-sm" style={{ color: currentTheme.textColor }}>Manage all properties displayed on the user site.</p>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mt-4 p-1 rounded-lg border w-fit" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                        <button
                            onClick={() => handleSetActiveTab('all')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'all' ? 'shadow-sm' : 'hover:bg-black/5 opacity-60'}`}
                            style={{
                                backgroundColor: activeTab === 'all' ? currentTheme.primary : 'transparent',
                                color: activeTab === 'all' ? '#fff' : currentTheme.textColor
                            }}
                        >
                            Active Listings
                        </button>
                        <button
                            onClick={() => handleSetActiveTab('pending')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'pending' ? 'shadow-sm' : 'hover:bg-black/5 opacity-60'}`}
                            style={{
                                backgroundColor: activeTab === 'pending' ? currentTheme.primary : 'transparent',
                                color: activeTab === 'pending' ? '#fff' : currentTheme.textColor
                            }}
                        >
                            Pending Approval
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: currentTheme.textColor }} />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64 transition-all"
                            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 border rounded-lg hover:brightness-95 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none ${showFilters ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
                            style={{
                                backgroundColor: currentTheme.cardBg,
                                borderColor: showFilters ? currentTheme.primary : currentTheme.borderColor,
                                color: showFilters ? currentTheme.primary : currentTheme.headingColor
                            }}
                        >
                            <MdFilterList size={18} />
                            Filter
                        </button>
                        {mounted && canAddProperties && (
                            <Link href="/properties/add" className="flex-1 sm:flex-none">
                                <button
                                    className="w-full px-5 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                                    style={{ backgroundColor: currentTheme.primary }}
                                >
                                    <MdAdd size={20} />
                                    Add Property
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 mb-6"
                    style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>

                    {activeTab === 'pending' ? (
                        /* Pending tab: only Listing Status filter */
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Listing Status</label>
                                <select
                                    value={pendingStatus}
                                    onChange={(e) => {
                                        const val = e.target.value as 'pending' | 'approved' | 'rejected';
                                        setPendingStatus(val);
                                        setPagination(p => ({ ...p, page: 1 }));
                                    }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setPendingStatus('pending'); setPagination(p => ({ ...p, page: 1 })); }}
                                    className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center"
                                    style={{ borderColor: currentTheme.borderColor }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* All tab: full filter grid */
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                            {/* Property Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Property Type</label>
                                <select
                                    value={filterPropertyType}
                                    onChange={(e) => { setFilterPropertyType(e.target.value); handleFilterChange("property_type", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                >
                                    <option value="All">All Types</option>
                                    <option>Single-Family</option>
                                    <option>Multi-Family</option>
                                    <option>Residential</option>
                                    <option>Commercial</option>
                                    <option>Industrial</option>
                                    <option>Land</option>
                                </select>
                            </div>

                            {/* Listing Status */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Listing Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange("status", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                >
                                    <option value="All">All Statuses</option>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>

                            {/* Transaction Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Transaction</label>
                                <select
                                    value={filterListingType}
                                    onChange={(e) => { setFilterListingType(e.target.value); handleFilterChange("type", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                >
                                    <option value="All">All Transactions</option>
                                    <option value="Sale">For Sale</option>
                                    <option value="Rent">For Rent</option>
                                </select>
                            </div>

                            {/* Min Price */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Min Price</label>
                                <input
                                    type="number"
                                    placeholder="Any"
                                    value={minPrice}
                                    onChange={(e) => { setMinPrice(e.target.value); handleFilterChange("min_price", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                />
                            </div>

                            {/* Max Price */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Max Price</label>
                                <input
                                    type="number"
                                    placeholder="Any"
                                    value={maxPrice}
                                    onChange={(e) => { setMaxPrice(e.target.value); handleFilterChange("max_price", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                />
                            </div>

                            {/* Min Beds */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Min Beds</label>
                                <input
                                    type="number"
                                    placeholder="Any"
                                    value={beds}
                                    onChange={(e) => { setBeds(e.target.value); handleFilterChange("bedrooms", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                />
                            </div>

                            {/* Min Baths */}
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold uppercase tracking-wide opacity-60" style={{ color: currentTheme.textColor }}>Min Baths</label>
                                <input
                                    type="number"
                                    placeholder="Any"
                                    value={baths}
                                    onChange={(e) => { setBaths(e.target.value); handleFilterChange("bathrooms", e.target.value); }}
                                    className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                                    style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                                />
                            </div>

                            {/* Reset */}
                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center gap-2"
                                    style={{ borderColor: currentTheme.borderColor }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-80">
                        <div className="text-red-500 mb-2 font-bold text-lg">Network Error</div>
                        <p className="text-sm">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Retry</button>
                    </div>
                ) : properties.length > 0 ? (
                    properties.map((property) => {
                        const listingImage = property.images && property.images.length > 0 ? property.images[0] : "";
                        const imageKey = `${property.id}:${listingImage}`;
                        const showListingImage = Boolean(listingImage) && !listingImageFailures[imageKey];
                        return (
                            <div
                                onClick={() => router.push(`/properties/review/${property.id}${activeTab === 'pending' ? '?source=pending' : ''}`)}
                                key={property.id}
                                className="rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md"
                                style={{ backgroundColor: currentTheme.cardBg + 'E6', borderColor: currentTheme.borderColor }}
                            >
                                {/* Image */}
                                <div className="h-48 w-full relative overflow-hidden">
                                    {showListingImage ? (
                                        <img
                                            src={listingImage}
                                            alt=""
                                            aria-label={property.street_address || "Property image"}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={() => setListingImageFailures((prev) => ({ ...prev, [imageKey]: true }))}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                            <div className="px-3 py-1 rounded-md bg-slate-300 text-slate-700 text-sm font-semibold">No Image Available</div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                                    <div className="absolute top-4 left-4 px-3 py-1 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#0f172a' }}>
                                        {property.transaction_type}
                                    </div>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${
                                        activeTab === 'pending'
                                            ? property.status === 'approved' ? 'bg-emerald-500'
                                            : property.status === 'rejected' ? 'bg-rose-500'
                                            : 'bg-orange-500'
                                            : property.is_active
                                                ? 'bg-emerald-500'
                                                : 'bg-slate-500'
                                    }`}>
                                        {activeTab === 'pending'
                                            ? property.status === 'approved' ? 'Approved'
                                            : property.status === 'rejected' ? 'Rejected'
                                            : 'Pending'
                                            : property.is_active
                                                ? 'Active'
                                                : 'Deactive'}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold line-clamp-1" style={{ color: currentTheme.headingColor }}>{property.street_address}</h3>
                                        <p className="text-lg font-bold" style={{ color: currentTheme.primary }}>${property.listing_price?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm mb-4" style={{ color: currentTheme.textColor }}>
                                        <MdLocationOn size={16} />
                                        <p>{property.city}, {property.state}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 py-3 border-t" style={{ borderColor: currentTheme.borderColor }}>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                                                <MdOutlineBedroomParent /><span className="text-xs font-bold">Beds</span>
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>{property.bedrooms}</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l" style={{ borderColor: currentTheme.borderColor }}>
                                            <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                                                <MdOutlineBathroom /><span className="text-xs font-bold">Baths</span>
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>{property.bathrooms}</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l" style={{ borderColor: currentTheme.borderColor }}>
                                            <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                                                <MdSquareFoot /><span className="text-xs font-bold">Sqft</span>
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>{property.square_feet}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: currentTheme.borderColor }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                style={{ backgroundColor: currentTheme.primary }}>
                                                {activeTab === 'pending' && property.creator
                                                    ? `${property.creator.first_name?.[0] ?? ''}${property.creator.last_name?.[0] ?? ''}`.toUpperCase()
                                                    : 'A'}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: currentTheme.headingColor }}>
                                                    {activeTab === 'pending' && property.creator
                                                        ? `${property.creator.first_name} ${property.creator.last_name}`
                                                        : 'Agent'}
                                                </span>
                                                {activeTab === 'pending' && property.creator && (
                                                    <span className="text-[10px] truncate max-w-[160px] opacity-60" style={{ color: currentTheme.textColor }}>
                                                        {property.creator.username}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            {(canViewProperties || canEditProperties || canDeleteProperties) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === property.id ? null : property.id); }}
                                                    className="hover:opacity-80 p-1 rounded-full hover:bg-black/5 transition-colors"
                                                    style={{ color: currentTheme.textColor }}
                                                >
                                                    <MdMoreHoriz size={20} />
                                                </button>
                                            )}
                                            {activeMenuId === property.id && (
                                                <div
                                                    className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2"
                                                    style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex flex-col py-1">
                                                        {canViewProperties && (
                                                            <Link href={`/properties/review/${property.id}`} className="w-full">
                                                                <button className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors" style={{ color: currentTheme.headingColor }}>
                                                                    Review Property
                                                                </button>
                                                            </Link>
                                                        )}
                                                        {canEditProperties && activeTab === 'pending' && (
                                                            <Link href={`/properties/edit/${property.id}`} className="w-full">
                                                                <button className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors" style={{ color: currentTheme.headingColor }}>
                                                                    Edit Property
                                                                </button>
                                                            </Link>
                                                        )}
                                                        {canEditProperties && (
                                                            activeTab === 'all' ? (
                                                                property.is_active ? (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onDeactivateClick(property.id); }}
                                                                        className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors w-full"
                                                                    >
                                                                        Deactivate
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onActivateClick(property.id); }}
                                                                        className="px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
                                                                    >
                                                                        Activate
                                                                    </button>
                                                                )
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onApproveClick(property.id); }}
                                                                    className="px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                            )
                                                        )}
                                                        {(canDeleteProperties || (canEditProperties && activeTab !== 'all')) && (
                                                            <div className="h-px my-1" style={{ backgroundColor: currentTheme.borderColor }}></div>
                                                        )}
                                                        {activeTab === 'all' ? (
                                                            canDeleteProperties && (
                                                                <button
                                                                    onClick={() => initiateDelete(property.id)}
                                                                    className="px-4 py-2.5 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                                                                >
                                                                    Delete Property
                                                                </button>
                                                            )
                                                        ) : (
                                                            canEditProperties && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onRejectClick(property.id); }}
                                                                    className="px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                                                >
                                                                    Reject Property
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center opacity-50">
                        <p className="text-lg font-bold">No properties found matching your filters.</p>
                        <button onClick={resetFilters} className="text-sm text-blue-500 mt-2 hover:underline">Clear all filters</button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && !error && properties.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t mt-8" style={{ borderColor: currentTheme.borderColor }}>
                    <div className="text-sm opacity-70" style={{ color: currentTheme.textColor }}>
                        Showing <span className="font-bold">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                        <span className="font-bold">{pagination.total}</span> entries
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleSetPage(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                        >
                            <MdChevronLeft size={20} />
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (pagination.totalPages <= 5) pageNum = i + 1;
                            else if (pagination.page <= 3) pageNum = i + 1;
                            else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                            else pageNum = pagination.page - 2 + i;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handleSetPage(pageNum)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${pagination.page === pageNum ? 'text-white shadow-md scale-105' : 'hover:bg-black/5'}`}
                                    style={{
                                        backgroundColor: pagination.page === pageNum ? currentTheme.primary : 'transparent',
                                        color: pagination.page === pageNum ? '#fff' : currentTheme.textColor
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handleSetPage(Math.min(pagination.totalPages, pagination.page + 1))}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                        >
                            <MdChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                onConfirm={handleConfirmAction}
                title={
                    pendingAction === 'approve' ? "Approve Property" :
                    pendingAction === 'reject' ? "Reject Property" :
                    pendingAction === 'activate' ? "Activate Property" :
                    "Deactivate Property"
                }
                message={
                    pendingAction === 'approve'
                        ? "Are you sure you want to approve this property? It will become active immediately."
                        : pendingAction === 'reject'
                        ? "Are you sure you want to reject this property? This action cannot be undone."
                        : pendingAction === 'activate'
                        ? "Are you sure you want to activate this property? It will be visible to users."
                        : "Are you sure you want to deactivate this property? It will be hidden from users."
                }
                confirmLabel={
                    pendingAction === 'approve' ? "Approve" :
                    pendingAction === 'reject' ? "Reject" :
                    pendingAction === 'activate' ? "Activate" :
                    "Deactivate"
                }
                isLoading={actionLoading}
                confirmButtonColor={
                    pendingAction === 'activate' || pendingAction === 'approve'
                        ? currentTheme.primary
                        : pendingAction === 'deactivate'
                        ? '#f59e0b'
                        : '#ef4444'
                }
            />
        </div>
    );
}