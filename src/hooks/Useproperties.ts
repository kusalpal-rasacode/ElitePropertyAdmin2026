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
import { useModulePermission } from "@/hooks/useModulePermission";
import { useAuth } from "@/providers/AuthProvider";
import { isSuperAdmin } from "@/utils/authUtils";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useListingActions } from "@/hooks/useListingActions";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import type {
    PropertyData,
    ActiveTab,
    PendingStatus,
    Pagination,
    PropertyFilters,
} from "../types/properties.types";

export function useProperties() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { permissionReady, can } = useModulePermission("properties");
    const { syncToUrl } = useUrlSync();

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
        page: 1,
        limit:9,
        total: 0,
        totalPages: 1,
    });

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

    // ─── URL Sync helper ──────────────────────────────────────────────────────
    const pushToUrl = useCallback(
        (overrides: Record<string, string | number> = {}) => {
            syncToUrl(
                {
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
                },
                {
                    omitDefaults: {
                        tab: "all",
                        pending_status: "pending",
                        status: "All",
                        type: "All",
                        property_type: "All",
                    },
                    always: ["page", "limit"],
                }
            );
        },
        [activeTab, pendingStatus, pagination.page, pagination.limit, filters, syncToUrl]
    );

    useEffect(() => {
        if (!mounted) return;
        pushToUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pendingStatus, pagination.page, filters]);

    // ─── Delete ───────────────────────────────────────────────────────────────
    const {
        deleteId,
        isDeleteLoading,
        initiateDelete: _initiateDelete,
        cancelDelete,
        confirmDelete,
    } = useDeleteConfirm({
        onDelete: async (id) => {
            await deletePropertyByIdService(String(id));
            setProperties((prev) => prev.filter((p) => p.id !== id));
            setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        },
        successMessage: "Property deleted successfully",
        errorMessage: "Failed to delete property",
    });

    const initiateDelete = (id: number | string) => {
        if (!canDeleteProperties) return;
        _initiateDelete(id);
        setActiveMenuId(null);
    };

    // ─── Action Modal ─────────────────────────────────────────────────────────
    const {
        isActionModalOpen,
        pendingAction,
        pendingItemId: pendingPropertyId,
        actionLoading,
        onApproveClick: _onApproveClick,
        onRejectClick: _onRejectClick,
        onActivateClick: _onActivateClick,
        onDeactivateClick: _onDeactivateClick,
        handleConfirmAction,
        closeModal,
    } = useListingActions({
        onAction: async (type, id, reason) => {
            if (type === "approve") await approveProperty(id);
            else if (type === "reject") await rejectProperty(id, reason);
            else if (type === "activate") await activeProperty(id);
            else if (type === "deactivate") await deactiveProperty(id);
        },
        onSuccess: () => setRefreshKey((prev) => prev + 1),
    });

    const onApproveClick = (id: number | string) => { _onApproveClick(id); setActiveMenuId(null); };
    const onRejectClick = (id: number | string) => { _onRejectClick(id); setActiveMenuId(null); };
    const onActivateClick = (id: number | string) => { _onActivateClick(id); setActiveMenuId(null); };
    const onDeactivateClick = (id: number | string) => { _onDeactivateClick(id); setActiveMenuId(null); };

    // ─── Tab / Page / Filter Handlers ─────────────────────────────────────────
    const handleSetActiveTab = (tab: string) => {
        setActiveTab(tab as ActiveTab);
        setPagination((p) => ({ ...p, page: 1 }));
        pushToUrl({ tab, page: 1 });
    };

    const handleSetPage = (page: number) => {
        setPagination((p) => ({ ...p, page }));
        pushToUrl({ page });
    };

    const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((p) => ({ ...p, page: 1 }));
        pushToUrl({ [key]: value, page: 1 });
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

                let response;
                if (activeTab === "pending") {
                    response = await getPendingProperties({
                        ...apiParams,
                        status: pendingStatus,
                    });
                } else {
                    response = await getProperties(apiParams);
                }

                setProperties(response.data);
                setPagination((prev) => ({
                    ...prev,
                    total: response.pagination?.total ?? 0,
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
        activeTab,
        pendingStatus,
        refreshKey,
        permissionReady,
        canViewProperties,
    ]);

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
        isDeleteLoading,
        initiateDelete,
        cancelDelete,
        confirmDelete,

        // action modal
        isActionModalOpen,
        setIsActionModalOpen: closeModal,
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