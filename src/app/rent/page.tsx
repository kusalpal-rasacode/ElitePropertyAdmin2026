"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreHoriz,
  MdOutlineBedroomParent,
  MdOutlineBathroom,
  MdSquareFoot,
  MdLocationOn,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { PropertyData } from "@/types/properties.types";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

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
import {
  getRentalImageCandidates,
  mapRentalToPropertyData,
} from "@/utils/rentalMapper";
import { useModulePermission } from "@/hooks/useModulePermission";
import { useAuth } from "@/providers/AuthProvider";
import { isEnterpriseAdmin, isSuperAdmin } from "@/utils/authUtils";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

type CreatorPreview = {
  username: string;
  phoneNumber: string;
  profileImage: string;
};

type CreatorAvatarProps = {
  profileImage?: string;
  username?: string;
  initial: string;
};

function CreatorAvatar({
  profileImage,
  username,
  initial,
}: CreatorAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profileImage]);

  if (profileImage && !imageFailed) {
    return (
      <img
        src={profileImage}
        alt=""
        aria-label={username || "Creator"}
        className="w-6 h-6 rounded-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
      {initial}
    </div>
  );
}

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const pickString = (obj: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const extractCreatorPreview = (
  raw: Record<string, unknown>,
): CreatorPreview | null => {
  const creator = toRecord(
    raw.creator ||
    raw.created_by ||
    raw.createdBy ||
    raw.user ||
    raw.owner ||
    raw.uploaded_by,
  );
  if (Object.keys(creator).length === 0) return null;

  const first = pickString(creator, ["first_name", "firstName"]);
  const last = pickString(creator, ["last_name", "lastName"]);
  const fullFromParts = `${first} ${last}`.trim();
  const fullFromSingle = pickString(creator, ["full_name", "fullName", "name"]);
  const username = pickString(creator, ["username", "user_name"]);
  const fallbackName = fullFromParts || fullFromSingle || username;
  const phoneNumber = pickString(creator, [
    "phone_number",
    "phoneNumber",
    "phone",
    "mobile",
  ]);
  const displayUsername = username || fallbackName || "N/A";
  const rawProfile = pickString(creator, [
    "profile_image",
    "profileImage",
    "avatar",
    "image",
    "photo",
  ]);
  const profileImage = rawProfile
    ? getRentalImageCandidates(rawProfile)[0] || rawProfile
    : "";

  return {
    username: displayUsername,
    phoneNumber: phoneNumber || "No phone",
    profileImage,
  };
};

function RentPropertiesContent() {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { permissionReady, can } = useModulePermission("properties");
  const canViewProperties = can("view");
  const canAddProperties = can("add");
  const canEditProperties = can("edit");
  const canDeleteProperties = can("delete");

  const [allProperties, setAllProperties] = useState<PropertyData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [activeTab, setActiveTab] = useState<"all" | "pending">(
    (searchParams.get("tab") as "all" | "pending") || "all",
  );
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>(
    {},
  );
  const [creatorOverrides, setCreatorOverrides] = useState<
    Record<string, CreatorPreview>
  >({});
  const [listingImageFailures, setListingImageFailures] = useState<
    Record<string, boolean>
  >({});
  const hydratedRentalIdsRef = useRef<Set<string>>(new Set());

  // Delete State
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 9,
    total: 0,
    totalPages: 1,
  });

  // Filter States
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || "All",
  );
  // Default Listing Type to Rent, but allow user to switch if needed (though this page is specifically for Rent)
  // We lock this to Rent or Both logically.
  const [filterListingType] = useState("Rent");
  const [filterPropertyType, setFilterPropertyType] = useState(
    searchParams.get("property_type") || "All",
  ); // Single Family, etc.
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [beds, setBeds] = useState(searchParams.get("bedrooms") || "");
  const [baths, setBaths] = useState(searchParams.get("bathrooms") || "");
  const [petsAllowed, setPetsAllowed] = useState(
    searchParams.get("pets_allowed") || "All",
  );
  const [furnished, setFurnished] = useState(
    searchParams.get("furnished") || "All",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // Modal State for Approve/Reject
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [pendingPropertyId, setPendingPropertyId] = useState<
    number | string | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch
  const [pendingStatus, setPendingStatus] = useState<"pending" | "rejected">(
    (searchParams.get("pending_status") as "pending" | "rejected") || "pending",
  );
  const isOrganizationUser = isEnterpriseAdmin(user) && !isSuperAdmin(user);

  useEffect(() => {
    if (isOrganizationUser && activeTab !== "all") {
      setActiveTab("all");
    }
  }, [isOrganizationUser, activeTab]);

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const syncToUrl = useCallback(
    (overrides: Record<string, string | number> = {}) => {
      const params = new URLSearchParams();
      const current = {
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
      };

      if (current.tab && current.tab !== "all")
        params.set("tab", String(current.tab));
      if (
        activeTab === "pending" &&
        current.pending_status &&
        current.pending_status !== "pending"
      ) {
        params.set("pending_status", String(current.pending_status));
      }
      if (current.search) params.set("search", String(current.search));
      if (current.status && current.status !== "All")
        params.set("status", String(current.status));
      if (current.property_type && current.property_type !== "All")
        params.set("property_type", String(current.property_type));
      if (current.min_price) params.set("min_price", String(current.min_price));
      if (current.max_price) params.set("max_price", String(current.max_price));
      if (current.bedrooms) params.set("bedrooms", String(current.bedrooms));
      if (current.bathrooms) params.set("bathrooms", String(current.bathrooms));
      if (current.pets_allowed && current.pets_allowed !== "All")
        params.set("pets_allowed", String(current.pets_allowed));
      if (current.furnished && current.furnished !== "All")
        params.set("furnished", String(current.furnished));

      params.set("page", String(current.page || 1));
      params.set("limit", String(current.limit || 9));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [
      activeTab,
      pendingStatus,
      pagination.page,
      pagination.limit,
      searchQuery,
      filterStatus,
      filterPropertyType,
      minPrice,
      maxPrice,
      beds,
      baths,
      petsAllowed,
      furnished,
      pathname,
      router,
    ],
  );

  const handleSetActiveTab = (tab: "all" | "pending") => {
    setActiveTab(tab);
    setPagination((p) => ({ ...p, page: 1 }));
    syncToUrl({ tab, page: 1 });
  };

  const handleSetPage = (page: number) => {
    setPagination((p) => ({ ...p, page }));
    syncToUrl({ page });
  };

  // Open Modal Handlers
  const onApproveClick = (id: number | string) => {
    if (!canEditProperties) return;
    setPendingPropertyId(id);
    setPendingAction("approve");
    setIsActionModalOpen(true);
    setActiveMenuId(null); // Close dropdown
  };

  const onRejectClick = (id: number | string) => {
    if (!canEditProperties) return;
    setPendingPropertyId(id);
    setPendingAction("reject");
    setIsActionModalOpen(true);
    setActiveMenuId(null); // Close dropdown
  };

  // Confirm Action Helper
  const handleConfirmAction = async (reason?: string) => {
    if (!pendingPropertyId || !pendingAction || !canEditProperties) return;

    setActionLoading(true);
    try {
      if (pendingAction === "approve") {
        await approveRentalService(pendingPropertyId);
        showSuccessToast("Property approved successfully!");
      } else {
        await rejectRentalService(pendingPropertyId, reason);
        showSuccessToast("Property rejected successfully!");
      }
      setRefreshKey((prev) => prev + 1); // Refresh UI
    } catch (err: unknown) {
      showErrorToast(
        getErrorMessage(err, `Failed to ${pendingAction} property.`),
      );
    } finally {
      setActionLoading(false);
      setIsActionModalOpen(false);
      setPendingAction(null);
      setPendingPropertyId(null);
    }
  };

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
        const response =
          activeTab === "pending"
            ? await getPendingRentals({
              page: pagination.page,
              limit: pagination.limit,
              status: pendingStatus,
              ...(searchQuery ? { search: searchQuery } : {}),
            })
            : await getRentals({
              page: pagination.page,
              limit: pagination.limit,
              ...(filterStatus !== "All"
                ? {
                  status: filterStatus.toLowerCase() as
                    | "active"
                    | "inactive",
                }
                : {}),
            });
        if (!isCurrentRequest) return;
        const rawList = response.data || [];
        const mappedList = rawList.map((item) =>
          mapRentalToPropertyData(item as Record<string, unknown>),
        );
        const creatorSeed: Record<string, CreatorPreview> = {};
        rawList.forEach((item, index) => {
          const mapped = mappedList[index];
          if (!mapped || mapped.id === null || mapped.id === undefined) return;
          const creator = extractCreatorPreview(
            item as Record<string, unknown>,
          );
          if (creator) {
            creatorSeed[String(mapped.id)] = creator;
          }
        });
        if (Object.keys(creatorSeed).length > 0) {
          setCreatorOverrides((prev) => ({ ...prev, ...creatorSeed }));
        }
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination?.total ?? prev.total,
            totalPages: response.pagination?.totalPages ?? prev.totalPages,
          }));
        }
        hydratedRentalIdsRef.current.clear();
        setAllProperties(mappedList);
      } catch (err: unknown) {
        if (!isCurrentRequest) return;
        console.error("Failed to fetch properties", err);
        setError(getErrorMessage(err, "Failed to load rentals."));
        setAllProperties([]);
      } finally {
        if (!isCurrentRequest) return;
        setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      isCurrentRequest = false;
    };
  }, [
    activeTab,
    pendingStatus,
    filterStatus,
    refreshKey,
    permissionReady,
    canViewProperties,
    isOrganizationUser,
    pagination.page,
    pagination.limit,
    searchQuery,
  ]);

  useEffect(() => {
    try {
      const filtered = allProperties.filter((property) => {
        const effectivePrice =
          property.rent_price || property.listing_price || 0;
        const status = property.status || "Active";
        const listingType =
          property.transaction_type || property.listing_type || "Rent";
        const propType = property.property_type || "Single-Family";
        const title = property.street_address || "Untitled Property";
        const location = `${property.city}, ${property.state}`;

        const matchesStatus =
          activeTab === "pending"
            ? true
            : filterStatus === "All" || status === filterStatus;
        // We specifically check if it includes 'Rent' or 'Both'
        const matchesListingType =
          activeTab === "pending"
            ? true
            : filterListingType === "All" ||
            listingType === filterListingType ||
            listingType === "Both";
        const matchesPropertyType =
          activeTab === "pending"
            ? true
            : filterPropertyType === "All" || propType === filterPropertyType;
        const matchesSearch =
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice =
          activeTab === "pending"
            ? true
            : minPrice === "" || effectivePrice >= parseInt(minPrice);
        const matchesMaxPrice =
          activeTab === "pending"
            ? true
            : maxPrice === "" || effectivePrice <= parseInt(maxPrice);
        const matchesBeds =
          activeTab === "pending"
            ? true
            : beds === "" || (property.bedrooms || 0) >= parseInt(beds);
        const matchesBaths =
          activeTab === "pending"
            ? true
            : baths === "" || (property.bathrooms || 0) >= parseInt(baths);
        const matchesPets =
          activeTab === "pending"
            ? true
            : petsAllowed === "All" ||
            (petsAllowed === "Yes"
              ? property.pets_allowed === true
              : property.pets_allowed === false);
        const matchesFurnished =
          activeTab === "pending"
            ? true
            : furnished === "All" ||
            (furnished === "Yes"
              ? property.is_furnished === true
              : property.is_furnished === false);

        return (
          matchesStatus &&
          matchesListingType &&
          matchesPropertyType &&
          matchesSearch &&
          matchesMinPrice &&
          matchesMaxPrice &&
          matchesBeds &&
          matchesBaths &&
          matchesPets &&
          matchesFurnished
        );
      });

      setProperties(filtered);
    } catch (err) {
      console.error("Failed to filter properties", err);
      setError("Failed to load data.");
    }
  }, [
    allProperties,
    pagination.page,
    searchQuery,
    filterListingType,
    activeTab,
    filterStatus,
    filterPropertyType,
    minPrice,
    maxPrice,
    beds,
    baths,
    petsAllowed,
    furnished,
    refreshKey,
  ]);

  useEffect(() => {
    const hydrateMissingImages = async () => {
      const targets = properties
        .filter((p) => {
          const idKey = String(p.id);
          if (hydratedRentalIdsRef.current.has(idKey)) return false;
          return (
            ((!p.images || p.images.length === 0) && !imageOverrides[idKey]) ||
            !creatorOverrides[idKey]
          );
        })
        .map((p) => p.id);

      if (targets.length === 0) return;

      targets.forEach((id) => hydratedRentalIdsRef.current.add(String(id)));

      const updates: Record<string, string> = {};
      const creatorUpdates: Record<string, CreatorPreview> = {};
      for (const id of targets) {
        try {
          const detail = await getRentalByIdService(id);
          if (!detail) continue;
          const mapped = mapRentalToPropertyData(detail);
          if (mapped.images && mapped.images.length > 0) {
            updates[String(id)] = mapped.images[0];
          }

          const creator = extractCreatorPreview(
            detail as Record<string, unknown>,
          );
          if (creator) {
            creatorUpdates[String(id)] = creator;
          }
        } catch {
          // ignore single record hydrate failure
        }
      }

      if (Object.keys(updates).length > 0) {
        setImageOverrides((prev) => ({ ...prev, ...updates }));
      }
      if (Object.keys(creatorUpdates).length > 0) {
        setCreatorOverrides((prev) => ({ ...prev, ...creatorUpdates }));
      }
    };

    hydrateMissingImages();
  }, [properties]);

  const initiateDelete = (id: number | string) => {
    if (!canDeleteProperties) return;
    setDeleteId(id);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    if (!deleteId || !canDeleteProperties) return;
    setIsDeleteLoading(true);

    deleteRentalService(deleteId)
      .then(() => {
        setProperties((prev) => prev.filter((p) => p.id !== deleteId));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setDeleteId(null);
        showSuccessToast("Property deleted successfully");
        setRefreshKey((prev) => prev + 1);
      })
      .catch((err: unknown) => {
        showErrorToast(getErrorMessage(err, "Failed to delete property."));
      })
      .finally(() => {
        setIsDeleteLoading(false);
      });
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
    if (property.images && property.images.length > 0 && property.images[0]) {
      return property.images[0];
    }
    return "";
  };

  useEffect(() => {
    if (!mounted) return;
    syncToUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    pendingStatus,
    pagination.page,
    searchQuery,
    filterStatus,
    filterPropertyType,
    minPrice,
    maxPrice,
    beds,
    baths,
    petsAllowed,
    furnished,
  ]);

  if (!loading && permissionReady && !canViewProperties) {
    return (
      <div className="max-w-[1600px] mx-auto py-10">
        <div
          className="rounded-xl border px-5 py-4 text-sm font-medium"
          style={{
            borderColor: currentTheme.borderColor,
            color: currentTheme.textColor,
          }}
        >
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
        title="Delete Rent"
        message="Are you sure you want to delete this rent listing? This action cannot be undone."
        confirmLabel="Delete Rent"
        isLoading={isDeleteLoading}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: currentTheme.headingColor }}
          >
            For Rent Listings
          </h1>
          <p
            className="font-medium text-sm"
            style={{ color: currentTheme.textColor }}
          >
            Manage your rental listings.
          </p>

          {/* Tabs */}
          {!isOrganizationUser && (
            <div
              className="flex items-center gap-1 mt-4 p-1 rounded-lg border w-fit"
              style={{
                borderColor: currentTheme.borderColor,
                backgroundColor: currentTheme.cardBg,
              }}
            >
              <button
                onClick={() => handleSetActiveTab("all")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "all" ? "shadow-sm" : "hover:bg-black/5 opacity-60"}`}
                style={{
                  backgroundColor:
                    activeTab === "all" ? currentTheme.primary : "transparent",
                  color: activeTab === "all" ? "#fff" : currentTheme.textColor,
                }}
              >
                Active Listings
              </button>
              <button
                onClick={() => handleSetActiveTab("pending")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "pending" ? "shadow-sm" : "hover:bg-black/5 opacity-60"}`}
                style={{
                  backgroundColor:
                    activeTab === "pending"
                      ? currentTheme.primary
                      : "transparent",
                  color:
                    activeTab === "pending" ? "#fff" : currentTheme.textColor,
                }}
              >
                Pending Approval
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-auto">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              size={20}
              style={{ color: currentTheme.textColor }}
            />
            <input
              type="text"
              placeholder="Search rentals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64 transition-all"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.borderColor,
                color: currentTheme.textColor,
              }}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-lg hover:brightness-95 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none ${showFilters ? "ring-2 ring-blue-500/20 border-blue-500" : ""}`}
              style={{
                backgroundColor: showFilters
                  ? currentTheme.cardBg
                  : currentTheme.cardBg,
                borderColor: showFilters
                  ? currentTheme.primary
                  : currentTheme.borderColor,
                color: showFilters
                  ? currentTheme.primary
                  : currentTheme.headingColor,
              }}
            >
              <MdFilterList size={18} />
              Filter
            </button>
            {mounted && canAddProperties && (
              <Link href="/rent/add" className="flex-1 sm:flex-none">
                <button
                  className="w-full px-5 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <MdAdd size={20} />
                  Add Rent
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel - Expanded with Smart Filters */}
      {showFilters && (
        <div
          className="p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 mb-6"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.borderColor,
          }}
        >
          {activeTab === "pending" ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Listing Status
                </label>
                <select
                  value={pendingStatus}
                  onChange={(e) => {
                    const val = e.target.value as "pending" | "rejected";
                    setPendingStatus(val);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPendingStatus("pending");
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center"
                  style={{ borderColor: currentTheme.borderColor }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* 1. Property Type (Smart Filter) */}
              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Rent Type
                </label>
                <select
                  value={filterPropertyType}
                  onChange={(e) => {
                    setFilterPropertyType(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
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

              {/* 2. Listing Status */}
              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Listing Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* 3. Pets Allowed */}
              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Pets Allowed
                </label>
                <select
                  value={petsAllowed}
                  onChange={(e) => {
                    setPetsAllowed(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                >
                  <option value="All">Any</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* 4. Furnished */}
              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Furnished
                </label>
                <select
                  value={furnished}
                  onChange={(e) => {
                    setFurnished(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                >
                  <option value="All">Any</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Row 2: Price & Specs */}
              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Min Rent
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                />
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Max Rent
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                />
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Min Beds
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={beds}
                  onChange={(e) => {
                    setBeds(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                />
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs font-extrabold uppercase tracking-wide opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  Min Baths
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={baths}
                  onChange={(e) => {
                    setBaths(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                />
              </div>

              {/* Reset Button (Last Item) */}
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
            <div className="text-red-500 mb-2 font-bold text-lg">
              Network Error
            </div>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : properties.length > 0 ? (
          properties.map((property) => {
            const propertyKey = String(property.id);
            const listingImage = getListingImage(property);
            const listingImageKey = `${propertyKey}:${listingImage}`;
            const showListingImage =
              Boolean(listingImage) && !listingImageFailures[listingImageKey];
            const creatorInfo = creatorOverrides[String(property.id)];
            const creatorInitial =
              (creatorInfo?.username || "N").trim().charAt(0).toUpperCase() ||
              "N";
            return (
              <div
                onClick={() =>
                  router.push(
                    `/rent/review/${property.id}${activeTab === "pending" ? "?source=pending" : ""}`,
                  )
                }
                key={property.id}
                className="rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md"
                style={{
                  backgroundColor: currentTheme.cardBg + "E6",
                  borderColor: currentTheme.borderColor,
                }}
              >
                {/* Image Placeholder */}
                <div className="h-48 w-full relative overflow-hidden">
                  {showListingImage ? (
                    <img
                      src={
                        getRentalImageCandidates(listingImage)[0] ||
                        listingImage
                      }
                      alt=""
                      aria-label={property.street_address || "Property image"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() =>
                        setListingImageFailures((prev) => ({
                          ...prev,
                          [listingImageKey]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <div className="px-3 py-1 rounded-md bg-slate-300 text-slate-700 text-sm font-semibold">
                        No Image Available
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>

                  <div
                    className="absolute top-4 left-4 px-3 py-1 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "#0f172a",
                    }}
                  >
                    {property.listing_type || "Rent"}
                  </div>
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${property.status === "Pending" ? "bg-orange-500" : property.status === "Rejected" ? "bg-rose-500" : property.status === "Inactive" ? "bg-amber-500" : property.status === "Cancelled" ? "bg-rose-500" : "bg-emerald-500"}`}
                  >
                    {property.status || "Active"}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className="text-lg font-bold line-clamp-1 transition-colors"
                      style={{ color: currentTheme.headingColor }}
                    >
                      {property.street_address}
                    </h3>
                    <div className="text-right">
                      <p
                        className="text-lg font-bold"
                        style={{ color: currentTheme.primary }}
                      >
                        $
                        {(
                          property.rent_price || property.listing_price
                        )?.toLocaleString()}
                        <span className="text-xs font-normal opacity-70 ml-1">
                          /mo
                        </span>
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 text-sm mb-4"
                    style={{ color: currentTheme.textColor }}
                  >
                    <MdLocationOn size={16} />
                    <p>
                      {property.city}, {property.state}
                    </p>
                  </div>

                  {String(property.status).toLowerCase() === "rejected" && property.rejection_reason && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <p className="text-xs font-bold text-rose-600 mb-1 uppercase tracking-wider">Rejection Reason</p>
                      <p className="text-sm text-rose-800 font-medium line-clamp-2" title={property.rejection_reason}>{property.rejection_reason}</p>
                    </div>
                  )}

                  <div
                    className="grid grid-cols-3 gap-2 py-3 border-t"
                    style={{ borderColor: currentTheme.borderColor }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="flex items-center gap-1.5 mb-1"
                        style={{ color: currentTheme.textColor, opacity: 0.8 }}
                      >
                        <MdOutlineBedroomParent />
                        <span className="text-xs font-bold">Beds</span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: currentTheme.headingColor }}
                      >
                        {property.bedrooms}
                      </span>
                    </div>
                    <div
                      className="flex flex-col items-center border-l"
                      style={{ borderColor: currentTheme.borderColor }}
                    >
                      <div
                        className="flex items-center gap-1.5 mb-1"
                        style={{ color: currentTheme.textColor, opacity: 0.8 }}
                      >
                        <MdOutlineBathroom />
                        <span className="text-xs font-bold">Baths</span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: currentTheme.headingColor }}
                      >
                        {property.bathrooms}
                      </span>
                    </div>
                    <div
                      className="flex flex-col items-center border-l"
                      style={{ borderColor: currentTheme.borderColor }}
                    >
                      <div
                        className="flex items-center gap-1.5 mb-1"
                        style={{ color: currentTheme.textColor, opacity: 0.8 }}
                      >
                        <MdSquareFoot />
                        <span className="text-xs font-bold">Sqft</span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: currentTheme.headingColor }}
                      >
                        {property.square_feet}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Agent & Actions */}
                  <div
                    className=" pt-4 border-t flex items-center justify-between"
                    style={{ borderColor: currentTheme.borderColor }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CreatorAvatar
                          profileImage={creatorInfo?.profileImage}
                          username={creatorInfo?.username}
                          initial={creatorInitial}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[10px] uppercase font-bold tracking-wider opacity-60 line-clamp-1"
                          style={{ color: currentTheme.textColor }}
                        >
                          {creatorInfo?.username || "N/A"}
                        </p>
                        <p
                          className="text-[10px] opacity-70 line-clamp-1"
                          style={{ color: currentTheme.textColor }}
                        >
                          {creatorInfo?.phoneNumber || "No phone"}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      {(canViewProperties ||
                        canEditProperties ||
                        canDeleteProperties) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(
                                activeMenuId === property.id ? null : property.id,
                              );
                            }}
                            className="hover:opacity-80 p-1 rounded-full hover:bg-black/5 transition-colors"
                            style={{ color: currentTheme.textColor }}
                          >
                            <MdMoreHoriz size={20} />
                          </button>
                        )}

                      {/* Dropdown Menu */}
                      {activeMenuId === property.id && (
                        <div
                          className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2"
                          style={{
                            backgroundColor: currentTheme.cardBg,
                            borderColor: currentTheme.borderColor,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col py-1">
                            {canViewProperties && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/rent/review/${property.id}${activeTab === "pending" ? "?source=pending" : ""}`,
                                  )
                                }
                                className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors flex items-center gap-2"
                                style={{ color: currentTheme.headingColor }}
                              >
                                Review Property
                              </button>
                            )}
                            {canEditProperties &&
                              property.status === "Pending" && (
                                <button
                                  onClick={() =>
                                    router.push(`/rent/edit/${property.id}`)
                                  }
                                  className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors flex items-center gap-2"
                                  style={{ color: currentTheme.headingColor }}
                                >
                                  Edit Property
                                </button>
                              )}

                            {canEditProperties &&
                              (activeTab === "all" ? (
                                <button
                                  onClick={() =>
                                    handleToggleRentalStatus(property)
                                  }
                                  className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
                                >
                                  {property.status === "Inactive"
                                    ? "Activate"
                                    : "Deactivate"}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onApproveClick(property.id);
                                  }}
                                  className="px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                >
                                  Approve
                                </button>
                              ))}
                            {activeTab !== "all" &&
                              canEditProperties &&
                              String(property.status).toLowerCase() !==
                              "rejected" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRejectClick(property.id);
                                  }}
                                  className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors w-full"
                                >
                                  Reject Property
                                </button>
                              )}
                            {(canDeleteProperties ||
                              (canEditProperties && activeTab !== "all")) && (
                                <div
                                  className="h-px bg-black/5 my-1"
                                  style={{
                                    backgroundColor: currentTheme.borderColor,
                                  }}
                                ></div>
                              )}

                            {canDeleteProperties && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateDelete(property.id);
                                }}
                                className="px-4 py-2.5 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                              >
                                Delete Property
                              </button>
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
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-50">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MdSearch size={48} className="text-gray-400" />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: currentTheme.headingColor }}
            >
              No Properties Found
            </h3>
            <p style={{ color: currentTheme.textColor }}>
              Try adjusting your search or filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              style={{
                borderColor: currentTheme.borderColor,
                color: currentTheme.headingColor,
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {properties.length > 0 && (
        <div
          className="flex items-center justify-between pt-6 border-t"
          style={{ borderColor: currentTheme.borderColor }}
        >
          <p
            className="text-sm font-medium opacity-70"
            style={{ color: currentTheme.textColor }}
          >
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handleSetPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                borderColor: currentTheme.borderColor,
                color: currentTheme.headingColor,
              }}
            >
              <MdChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1 px-2">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let p = i + 1;
                  if (pagination.totalPages > 5 && pagination.page > 3) {
                    p = pagination.page - 2 + i;
                  }
                  if (p > pagination.totalPages) return null;

                  return (
                    <button
                      key={p}
                      onClick={() => handleSetPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${pagination.page === p ? "bg-blue-500 text-white shadow-sm" : "hover:bg-gray-50"}`}
                      style={{
                        backgroundColor:
                          pagination.page === p
                            ? currentTheme.primary
                            : "transparent",
                        color:
                          pagination.page === p
                            ? "#fff"
                            : currentTheme.textColor,
                      }}
                    >
                      {p}
                    </button>
                  );
                },
              )}
            </div>
            <button
              onClick={() =>
                handleSetPage(
                  Math.min(pagination.totalPages, pagination.page + 1),
                )
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                borderColor: currentTheme.borderColor,
                color: currentTheme.headingColor,
              }}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <ConfirmModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          pendingAction === "approve" ? "Approve Property" : "Reject Property"
        }
        message={`Are you sure you want to ${pendingAction} this property?`}
        confirmLabel={pendingAction === "approve" ? "Approve" : "Reject"}
        confirmButtonColor={pendingAction === "approve" ? "#10b981" : "#ef4444"}
        isLoading={actionLoading}
        showTextarea={pendingAction === "reject"}
        textareaLabel="Rejection Reason (Optional)"
        textareaPlaceholder="Please provide a reason for rejecting this property..."
      />
    </div>
  );
}

export default function RentPropertiesPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <RentPropertiesContent />
    </React.Suspense>
  );
}
