"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useModulePermission } from "@/hooks/useModulePermission";
import { isEnterpriseAdmin, isSuperAdmin } from "@/utils/authUtils";
import { PropertyData } from "@/types/properties.types";
import {
  getRentals,
  getPendingRentals,
  approveRentalService,
  rejectRentalService,
  activateRentalService,
  deactivateRentalService,
  deleteRentalService,
  getRentalByIdService,
} from "@/services/rentals.service";
import { getRentalImageCandidates, mapRentalToPropertyData } from "@/utils/rentalMapper";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useListingActions } from "@/hooks/useListingActions";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorPreview = {
  username: string;
  phoneNumber: string;
  profileImage: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const pickString = (obj: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

export const extractCreatorPreview = (raw: Record<string, unknown>): CreatorPreview | null => {
  const creator = toRecord(
    raw.creator || raw.created_by || raw.createdBy || raw.user || raw.owner || raw.uploaded_by,
  );
  if (Object.keys(creator).length === 0) return null;

  const first = pickString(creator, ["first_name", "firstName"]);
  const last = pickString(creator, ["last_name", "lastName"]);
  const fullFromParts = `${first} ${last}`.trim();
  const fullFromSingle = pickString(creator, ["full_name", "fullName", "name"]);
  const username = pickString(creator, ["username", "user_name"]);
  const fallbackName = fullFromParts || fullFromSingle || username;
  const phoneNumber = pickString(creator, ["phone_number", "phoneNumber", "phone", "mobile"]);
  const displayUsername = username || fallbackName || "N/A";
  const rawProfile = pickString(creator, ["profile_image", "profileImage", "avatar", "image", "photo"]);
  const profileImage = rawProfile ? getRentalImageCandidates(rawProfile)[0] || rawProfile : "";

  return { username: displayUsername, phoneNumber: phoneNumber || "No phone", profileImage };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRentProperties() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { permissionReady, can } = useModulePermission("properties");
  const { syncToUrl } = useUrlSync();

  const canViewProperties = can("view");
  const canAddProperties = can("add");
  const canEditProperties = can("edit");
  const canDeleteProperties = can("delete");

  const isOrganizationUser = isEnterpriseAdmin(user) && !isSuperAdmin(user);

  const [mounted, setMounted] = useState(false);
  const [allProperties, setAllProperties] = useState<PropertyData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeTab, setActiveTab] = useState<"all" | "pending">(
    (searchParams.get("tab") as "all" | "pending") || "all",
  );
  const [pendingStatus, setPendingStatus] = useState<"pending" | "rejected">(
    (searchParams.get("pending_status") as "pending" | "rejected") || "pending",
  );

  const [pagination, setPagination] = useState({
    page:  1,
    limit:  9,
    total: 0,
    totalPages: 1,
  });

  // ─── Filters ─────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "All");
  const [filterPropertyType, setFilterPropertyType] = useState(searchParams.get("property_type") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [beds, setBeds] = useState(searchParams.get("bedrooms") || "");
  const [baths, setBaths] = useState(searchParams.get("bathrooms") || "");
  const [petsAllowed, setPetsAllowed] = useState(searchParams.get("pets_allowed") || "All");
  const [furnished, setFurnished] = useState(searchParams.get("furnished") || "All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [creatorOverrides, setCreatorOverrides] = useState<Record<string, CreatorPreview>>({});
  const [listingImageFailures, setListingImageFailures] = useState<Record<string, boolean>>({});
  const hydratedRentalIdsRef = useRef<Set<string>>(new Set());

  const isRejectedPendingList = activeTab === "pending" && pendingStatus === "rejected";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOrganizationUser && activeTab !== "all") setActiveTab("all");
  }, [isOrganizationUser, activeTab]);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const {
    deleteId,
    isDeleteLoading,
    initiateDelete: _initiateDelete,
    cancelDelete,
    confirmDelete,
  } = useDeleteConfirm({
    onDelete: async (id) => {
      await deleteRentalService(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setRefreshKey((prev) => prev + 1);
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
    closeModal,
    handleConfirmAction,
  } = useListingActions({
    onAction: async (type, id, reason) => {
      if (type === "approve") await approveRentalService(id);
      else if (type === "reject") await rejectRentalService(id, reason);
    },
    onSuccess: () => setRefreshKey((prev) => prev + 1),
  });

  const onApproveClick = (id: number | string) => {
    if (!canEditProperties) return;
    _onApproveClick(id);
    setActiveMenuId(null);
  };

  const onRejectClick = (id: number | string) => {
    if (!canEditProperties) return;
    _onRejectClick(id);
    setActiveMenuId(null);
  };

  // ─── URL Sync helper ──────────────────────────────────────────────────────
  const pushToUrl = useCallback(
    (overrides: Record<string, string | number> = {}) => {
      syncToUrl(
        {
          tab: activeTab,
          pending_status: pendingStatus,
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
          status: filterStatus,
          property_type: filterPropertyType,
          min_price: minPrice,
          max_price: maxPrice,
          bedrooms: beds,
          bathrooms: baths,
          pets_allowed: petsAllowed,
          furnished,
          ...overrides,
        },
        {
          omitDefaults: {
            tab: "all",
            pending_status: "pending",
            status: "All",
            property_type: "All",
            pets_allowed: "All",
            furnished: "All",
          },
          always: ["page", "limit"],
        }
      );
    },
    [
      activeTab, pendingStatus, pagination.page, pagination.limit,
      searchQuery, filterStatus, filterPropertyType, minPrice, maxPrice,
      beds, baths, petsAllowed, furnished, syncToUrl,
    ]
  );

  useEffect(() => { if (mounted) pushToUrl(); }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    pushToUrl();
  }, [
    activeTab, pendingStatus, pagination.page, searchQuery, filterStatus,
    filterPropertyType, minPrice, maxPrice, beds, baths, petsAllowed, furnished,
  ]);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!permissionReady) return;
    if (!canViewProperties) {
      setAllProperties([]);
      setProperties([]);
      setLoading(false);
      return;
    }

    let isCurrentRequest = true;

    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = activeTab === "pending"
          ? await getPendingRentals({
              page: pagination.page,
              limit: pagination.limit,
              status: pendingStatus,
              ...(searchQuery ? { search: searchQuery } : {}),
            })
          : await getRentals({
              page: pagination.page,
              limit: pagination.limit,
              ...(filterStatus !== "All" && {
                status: filterStatus.toLowerCase() as "active" | "inactive",
              }),
            });

        if (!isCurrentRequest) return;

        const rawList = response.data || [];
        const mappedList = rawList.map((item) =>
          mapRentalToPropertyData(item as Record<string, unknown>)
        );

        const creatorSeed: Record<string, CreatorPreview> = {};
        rawList.forEach((item, index) => {
          const mapped = mappedList[index];
          if (!mapped || mapped.id === null || mapped.id === undefined) return;
          const creator = extractCreatorPreview(item as Record<string, unknown>);
          if (creator) creatorSeed[String(mapped.id)] = creator;
        });
        if (Object.keys(creatorSeed).length > 0)
          setCreatorOverrides((prev) => ({ ...prev, ...creatorSeed }));

        if (response.pagination)
          setPagination((prev) => ({
            ...prev,
            total: response.pagination?.total ?? prev.total,
            totalPages: response.pagination?.totalPages ?? prev.totalPages,
          }));

        hydratedRentalIdsRef.current.clear();
        setAllProperties(mappedList);
      } catch (err: unknown) {
        if (!isCurrentRequest) return;
        setError(getErrorMessage(err, "Failed to load rentals."));
        setAllProperties([]);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchProperties();
    return () => { isCurrentRequest = false; };
  }, [
    activeTab, pendingStatus, filterStatus, refreshKey,
    permissionReady, canViewProperties,
    pagination.page, pagination.limit, searchQuery,
  ]);

  // ─── Local filter ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const filtered = allProperties.filter((property) => {
        const effectivePrice = property.rent_price || property.listing_price || 0;
        const listingType = property.transaction_type || property.listing_type || "Rent";
        const propType = property.property_type || "Single-Family";
        const title = property.street_address || "Untitled Property";
        const location = `${property.city}, ${property.state}`;
        const isPending = activeTab === "pending";

        return (
          (isPending || listingType === "Rent" || listingType === "Both") &&
          (isPending || filterPropertyType === "All" || propType === filterPropertyType) &&
          (title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (isPending || minPrice === "" || effectivePrice >= parseInt(minPrice)) &&
          (isPending || maxPrice === "" || effectivePrice <= parseInt(maxPrice)) &&
          (isPending || beds === "" || (property.bedrooms || 0) >= parseInt(beds)) &&
          (isPending || baths === "" || (property.bathrooms || 0) >= parseInt(baths)) &&
          (isPending || petsAllowed === "All" ||
            (petsAllowed === "Yes" ? property.pets_allowed === true : property.pets_allowed === false)) &&
          (isPending || furnished === "All" ||
            (furnished === "Yes" ? property.is_furnished === true : property.is_furnished === false))
        );
      });
      setProperties(filtered);
    } catch (err) {
      console.error("Failed to filter properties", err);
    }
  }, [
    allProperties, pagination.page, searchQuery, activeTab, filterStatus,
    filterPropertyType, minPrice, maxPrice, beds, baths, petsAllowed, furnished, refreshKey,
  ]);

  // ─── Image / creator hydration ────────────────────────────────────────────
  useEffect(() => {
    const hydrateMissingImages = async () => {
      const targets = properties
        .filter((p) => {
          const key = String(p.id);
          if (hydratedRentalIdsRef.current.has(key)) return false;
          return ((!p.images || p.images.length === 0) && !imageOverrides[key]) || !creatorOverrides[key];
        })
        .map((p) => p.id);

      if (targets.length === 0) return;
      targets.forEach((id) => hydratedRentalIdsRef.current.add(String(id)));

      const imgUpdates: Record<string, string> = {};
      const creatorUpdates: Record<string, CreatorPreview> = {};

      for (const id of targets) {
        try {
          const detail = await getRentalByIdService(id);
          if (!detail) continue;
          const mapped = mapRentalToPropertyData(detail);
          if (mapped.images && mapped.images.length > 0) imgUpdates[String(id)] = mapped.images[0];
          const creator = extractCreatorPreview(detail as Record<string, unknown>);
          if (creator) creatorUpdates[String(id)] = creator;
        } catch { /* ignore */ }
      }

      if (Object.keys(imgUpdates).length > 0)
        setImageOverrides((prev) => ({ ...prev, ...imgUpdates }));
      if (Object.keys(creatorUpdates).length > 0)
        setCreatorOverrides((prev) => ({ ...prev, ...creatorUpdates }));
    };

    hydrateMissingImages();
  }, [properties]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab as "all" | "pending");
    setPagination((p) => ({ ...p, page: 1 }));
    pushToUrl({ tab, page: 1 });
  };

  const handleSetPage = (page: number) => {
    setPagination((p) => ({ ...p, page }));
    pushToUrl({ page });
  };

  const handleToggleRentalStatus = async (property: PropertyData) => {
    if (!canEditProperties) return;
    try {
      if (property.status === "Inactive") {
        await activateRentalService(property.id);
        showSuccessToast("Rental activated successfully");
      } else {
        await deactivateRentalService(property.id);
        showSuccessToast("Rental deactivated successfully");
      }
      setActiveMenuId(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err: unknown) {
      showErrorToast(getErrorMessage(err, "Failed to update rental status."));
    }
  };

  const resetFilters = () => {
    setFilterStatus("All");
    setFilterPropertyType("All");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setBaths("");
    setPetsAllowed("All");
    setFurnished("All");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    router.replace(pathname, { scroll: false });
  };

  const getListingImage = (property: PropertyData) => {
    const override = imageOverrides[String(property.id)];
    if (override) return override;
    if (property.images && property.images.length > 0 && property.images[0]) return property.images[0];
    return "";
  };

  return {
    // Auth / permissions
    mounted, canViewProperties, canAddProperties, canEditProperties, canDeleteProperties,
    isOrganizationUser, permissionReady,

    // Data
    properties, loading, error,

    // Pagination
    pagination, handleSetPage,

    // Tabs
    activeTab, handleSetActiveTab, pendingStatus, setPendingStatus, isRejectedPendingList,

    // Filters
    showFilters, setShowFilters, searchQuery, setSearchQuery,
    filterStatus, setFilterStatus, filterPropertyType, setFilterPropertyType,
    minPrice, setMinPrice, maxPrice, setMaxPrice,
    beds, setBeds, baths, setBaths,
    petsAllowed, setPetsAllowed, furnished, setFurnished,
    resetFilters,

    // Image / creator
    creatorOverrides, listingImageFailures, setListingImageFailures, getListingImage,

    // Menu
    activeMenuId, setActiveMenuId,

    // Delete
    deleteId,
    isDeleteLoading,
    initiateDelete,
    cancelDelete,
    confirmDelete,

    // Approve / Reject
    isActionModalOpen,
    setIsActionModalOpen: closeModal,
    pendingAction,
    pendingPropertyId,
    actionLoading,
    onApproveClick,
    onRejectClick,
    handleConfirmAction,

    // Toggle status
    handleToggleRentalStatus,
  };
}