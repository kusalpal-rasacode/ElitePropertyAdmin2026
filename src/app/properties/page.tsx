"use client";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useProperties } from "@/hooks/Useproperties";
import { PropertiesFilterPanel } from "@/components/properties/Propertiesfilterpanel";
import { PropertiesGrid } from "@/components/properties/Propertiesgrid";
import { Pagination } from "@/components/common/Pagination";
import { PropertiesActionModal } from "@/components/properties/Propertiesactionmodal";
import { ListingPageHeader } from "@/components/common/ListingPageHeader";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

function PropertiesContent() {
    const { currentTheme } = useTheme();
    const p = useProperties();
    const tabs = [
  { value: "all", label: "Active Listings" },
  ...(p.isSuperAdmin ? [{ value: "pending", label: "Pending Approval" }] : []),
];

    return (
        <PermissionGuard module="properties" action="view">
            <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
                {/* Delete confirmation */}
                <ConfirmModal
                    isOpen={p.canDeleteProperties && !!p.deleteId}
                    onClose={() => !p.isDeleteLoading && p.deleteId === null}
                    onConfirm={p.confirmDelete}
                    title="Delete Property"
                    message="Are you sure you want to delete this property? This action cannot be undone."
                    confirmLabel="Delete Property"
                    isLoading={p.isDeleteLoading}
                />

                {/* Header */}
                <ListingPageHeader
      title="Property Listings"
      subtitle="Manage all properties displayed on the user site."
      tabs={tabs}
      activeTab={p.activeTab}
      onTabChange={p.handleSetActiveTab}
      searchQuery={p.filters.searchQuery}
      searchPlaceholder="Search properties..."
      onSearchChange={(v) => p.handleFilterChange("searchQuery", v)}
      showFilters={p.showFilters}
      onToggleFilters={() => p.setShowFilters((p) => !p)}
      addLabel="Add Property"
      addHref="/properties/add"
      canAdd={p.canAddProperties}
      mounted={p.mounted}
    />

                {/* Filter panel */}
                {p.showFilters && (
                    <PropertiesFilterPanel
                        activeTab={p.activeTab}
                        pendingStatus={p.pendingStatus}
                        filters={p.filters}
                        onFilterChange={p.handleFilterChange}
                        onPendingStatusChange={(status) => {
                            p.setPendingStatus(status);
                            p.setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        onReset={p.resetFilters}
                    />
                )}

                {/* Property grid */}
                <PropertiesGrid
                    properties={p.properties}
                    loading={p.loading}
                    error={p.error}
                    activeTab={p.activeTab}
                    pendingStatus={p.pendingStatus}
                    isRejectedPendingList={p.isRejectedPendingList}
                    activeMenuId={p.activeMenuId}
                    listingImageFailures={p.listingImageFailures}
                    canViewProperties={p.canViewProperties}
                    canEditProperties={p.canEditProperties}
                    canDeleteProperties={p.canDeleteProperties}
                    onMenuToggle={p.setActiveMenuId}
                    onImageError={(key) =>
                        p.setListingImageFailures((prev) => ({ ...prev, [key]: true }))
                    }
                    onApprove={p.onApproveClick}
                    onReject={p.onRejectClick}
                    onActivate={p.onActivateClick}
                    onDeactivate={p.onDeactivateClick}
                    onDelete={p.initiateDelete}
                    onResetFilters={p.resetFilters}
                />

                {/* Pagination */}
                {!p.loading && !p.error && p.properties.length > 0 && (
                    <Pagination pagination={p.pagination} onPageChange={p.handleSetPage} />
                )}

                {/* Action modal (approve / reject / activate / deactivate) */}
                <PropertiesActionModal
                    isOpen={p.isActionModalOpen}
                    pendingAction={p.pendingAction}
                    isLoading={p.actionLoading}
                    onClose={p.setIsActionModalOpen}
                    onConfirm={p.handleConfirmAction}
                />
            </div>
        </PermissionGuard>
    );
}

export default function PropertiesPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                </div>
            }
        >
            <PropertiesContent />
        </React.Suspense>
    );
}
