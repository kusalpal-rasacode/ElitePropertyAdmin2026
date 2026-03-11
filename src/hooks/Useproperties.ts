import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    getProperties,
    getPendingProperties,
    deletePropertyByIdService,
    approveProperty,
    rejectProperty,
    activeProperty,
    deactiveProperty,
} from "@/services/properties.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useModulePermission } from "@/hooks/useModulePermission";
import { useAuth } from "@/providers/AuthProvider";
import { isSuperAdmin } from "@/utils/authUtils";
import type {
    PropertyData,
    ActiveTab,
    PendingStatus,
    PendingAction,
    Pagination,
    PropertyFilters,
} from "../types/properties.types";

export function useProperties() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { permissionReady, can } = useModulePermission("properties");

    const canViewProperties = can("view");
    const canAddProperties = can("add");
    const canEditProperties = can("edit");
    const canDeleteProperties = can("delete");

    // ─── Core State ───────────────────────────────────────────────────────────
    const [properties, setProperties] = useState<PropertyData[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [listingImageFailures, setListingImageFailures] = useState<Record<string, boolean>>({});

    // ─── Tab & Status ─────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<ActiveTab>(
        (searchParams.get("tab") as ActiveTab) || "all"
    );
    const [pendingStatus, setPendingStatus] = useState<PendingStatus>(
        (searchParams.get("pending_status") as PendingStatus) || "pending"
    );
    const isRejectedPendingList = activeTab === "pending" && pendingStatus === "rejected";

    // ─── Filters ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<PropertyFilters>({
        searchQuery: searchParams.get("search") || "",
        filterStatus: searchParams.get("status") || "All",
        filterListingType: searchParams.get("type") || "All",
        filterPropertyType: searchParams.get("property_type") || "All",
        minPrice: searchParams.get("min_price") || "",
        maxPrice: searchParams.get("max_price") || "",
        beds: searchParams.get("bedrooms") || "",
        baths: searchParams.get("bathrooms") || "",
    });

    // ─── Pagination ───────────────────────────────────────────────────────────
    const [pagination, setPagination] = useState<Pagination>({
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 9,
        total: 0,
        totalPages: 1,
    });

    // ─── Delete State ─────────────────────────────────────────────────────────
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // ─── Action Modal State ───────────────────────────────────────────────────
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [pendingPropertyId, setPendingPropertyId] = useState<number | string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // ─── Menu State ───────────────────────────────────────────────────────────
    const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);

    // ─── UI State ─────────────────────────────────────────────────────────────
    const [showFilters, setShowFilters] = useState(false);

    // ─── Mount ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setMounted(true);
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(pagination.page));
        params.set("limit", String(pagination.limit));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── URL Sync ─────────────────────────────────────────────────────────────
    const syncToUrl = useCallback(
        (overrides: Record<string, string | number> = {}) => {
            const params = new URLSearchParams();
            const current = {
                tab: activeTab,
                pending_status: pendingStatus,
                page: pagination.page,
                limit: pagination.limit,
                search: filters.searchQuery,
                status: filters.filterStatus,
                type: filters.filterListingType,
                property_type: filters.filterPropertyType,
                min_price: filters.minPrice,
                max_price: filters.maxPrice,
                bedrooms: filters.beds,
                bathrooms: filters.baths,
                ...overrides,
            };

            if (current.tab && current.tab !== "all") params.set("tab", String(current.tab));
            if (activeTab === "pending" && current.pending_status && current.pending_status !== "pending")
                params.set("pending_status", String(current.pending_status));
            if (current.search) params.set("search", String(current.search));
            if (current.status && current.status !== "All") params.set("status", String(current.status));
            if (current.type && current.type !== "All") params.set("type", String(current.type));
            if (current.property_type && current.property_type !== "All")
                params.set("property_type", String(current.property_type));
            if (current.min_price) params.set("min_price", String(current.min_price));
            if (current.max_price) params.set("max_price", String(current.max_price));
            if (current.bedrooms) params.set("bedrooms", String(current.bedrooms));
            if (current.bathrooms) params.set("bathrooms", String(current.bathrooms));
            params.set("page", String(current.page || 1));
            params.set("limit", String(current.limit || 9));

            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [activeTab, pendingStatus, pagination.page, pagination.limit, filters, pathname, router]
    );

    useEffect(() => {
        if (!mounted) return;
        syncToUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pendingStatus, pagination.page, filters]);

    // ─── Tab / Page / Filter Handlers ─────────────────────────────────────────
    const handleSetActiveTab = (tab: ActiveTab) => {
        setActiveTab(tab);
        setPagination((p) => ({ ...p, page: 1 }));
        syncToUrl({ tab, page: 1 });
    };

    const handleSetPage = (page: number) => {
        setPagination((p) => ({ ...p, page }));
        syncToUrl({ page });
    };

    const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((p) => ({ ...p, page: 1 }));
        syncToUrl({ [key]: value, page: 1 });
    };

    const resetFilters = () => {
        setFilters({
            searchQuery: "",
            filterStatus: "All",
            filterListingType: "All",
            filterPropertyType: "All",
            minPrice: "",
            maxPrice: "",
            beds: "",
            baths: "",
        });
        setPagination((p) => ({ ...p, page: 1 }));
        router.replace(pathname, { scroll: false });
    };

    // ─── Fetch Properties ─────────────────────────────────────────────────────
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
            const apiParams: Record<string, any> = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (filters.searchQuery) apiParams.search = filters.searchQuery;
            if (filters.filterListingType !== "All") apiParams.type = filters.filterListingType;
            if (filters.filterPropertyType !== "All") apiParams.property_type = filters.filterPropertyType;
            if (filters.filterStatus !== "All") apiParams.status = filters.filterStatus.toLowerCase();
            if (filters.minPrice) apiParams.min_price = Number(filters.minPrice);
            if (filters.maxPrice) apiParams.max_price = Number(filters.maxPrice);
            if (filters.beds) apiParams.bedrooms = Number(filters.beds);
            if (filters.baths) apiParams.bathrooms = Number(filters.baths);

            // ✅ Switch service based on active tab
            let response;
            if (activeTab === "pending") {
                response = await getPendingProperties({
                    ...apiParams,
                    status: pendingStatus, // "pending" | "rejected"
                });
            } else {
                response = await getProperties(apiParams);
            }

            setProperties(response.data);

            // ✅ Update pagination from API response
            setPagination((prev) => ({
                ...prev,
                total: response.pagination?.total ??  0,
                totalPages: response.pagination?.totalPages ?? 1,
            }));

        } catch (err: any) {
            console.error("API ERROR:", err?.response || err?.message || err);
            setError(err?.message || "Failed to fetch properties");
        } finally {
            setLoading(false);
        }
    };

    const timeoutId = setTimeout(fetchProperties, 500);
    return () => clearTimeout(timeoutId);
}, [
    pagination.page,
    pagination.limit,
    filters,
    activeTab,        // ✅ re-fetch when tab changes
    pendingStatus,    // ✅ re-fetch when pending/rejected toggles
    refreshKey,
    permissionReady,
    canViewProperties,
]);

    // ─── Delete Handlers ──────────────────────────────────────────────────────
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
            setProperties((prev) => prev.filter((p) => p.id !== deleteId));
            setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete property:", error);
            alert("Failed to delete property. Please try again.");
        } finally {
            setIsDeleteLoading(false);
        }
    };

    // ─── Action Modal Handlers ────────────────────────────────────────────────
    const onApproveClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction("approve");
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const onRejectClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction("reject");
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const onActivateClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction("activate");
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const onDeactivateClick = (id: number | string) => {
        setPendingPropertyId(id);
        setPendingAction("deactivate");
        setIsActionModalOpen(true);
        setActiveMenuId(null);
    };

    const handleConfirmAction = async (reason?: string) => {
        if (!pendingPropertyId || !pendingAction) return;
        setActionLoading(true);
        try {
            if (pendingAction === "approve") {
                await approveProperty(pendingPropertyId);
                showSuccessToast("Property approved successfully!");
            } else if (pendingAction === "reject") {
                await rejectProperty(pendingPropertyId, reason);
                showSuccessToast("Property rejected successfully!");
            } else if (pendingAction === "activate") {
                await activeProperty(pendingPropertyId);
                showSuccessToast("Property activated successfully!");
            } else if (pendingAction === "deactivate") {
                await deactiveProperty(pendingPropertyId);
                showSuccessToast("Property deactivated successfully!");
            }
            setRefreshKey((prev) => prev + 1);
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

    return {
        // auth
        user,
        isSuperAdmin: isSuperAdmin(user),
        permissionReady,
        canViewProperties,
        canAddProperties,
        canEditProperties,
        canDeleteProperties,

        // data
        properties,
        mounted,
        loading,
        error,
        listingImageFailures,
        setListingImageFailures,

        // tab & status
        activeTab,
        pendingStatus,
        setPendingStatus,
        isRejectedPendingList,
        handleSetActiveTab,

        // filters
        filters,
        handleFilterChange,
        resetFilters,
        showFilters,
        setShowFilters,

        // pagination
        pagination,
        setPagination,
        handleSetPage,

        // delete
        deleteId,
        setDeleteId,
        isDeleteLoading,
        initiateDelete,
        confirmDelete,

        // action modal
        isActionModalOpen,
        setIsActionModalOpen,
        pendingAction,
        pendingPropertyId,
        actionLoading,
        onApproveClick,
        onRejectClick,
        onActivateClick,
        onDeactivateClick,
        handleConfirmAction,

        // menu
        activeMenuId,
        setActiveMenuId,
    };
}