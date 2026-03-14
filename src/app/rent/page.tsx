"use client";
import React from "react";
import { MdSearch } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Pagination } from "@/components/common/Pagination";
import { useRentProperties } from "@/hooks/Userentproperties";
import { RentFilterPanel } from "@/components/rent/Rentfilterpanel";
import { RentPropertyCard } from "@/components/rent/Rentpropertycard";
import { ListingPageHeader } from "@/components/common/ListingPageHeader";

function RentPropertiesContent() {
   
  const { currentTheme } = useTheme();
  const state = useRentProperties();

  if (!state.loading && !state.permissionReady && !state.canViewRentals) {
    return (
      <div className="max-w-[1600px] mx-auto py-10">
        <div
          className="rounded-xl border px-5 py-4 text-sm font-medium"
          style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
        >
          You do not have `view` permission for Rentals.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={state.canDeleteRentals && !!state.deleteId}
        onClose={() => !state.isDeleteLoading && state.deleteId === null}
        onConfirm={state.confirmDelete}
        title="Delete Rent"
        message="Are you sure you want to delete this rent listing? This action cannot be undone."
        confirmLabel="Delete Rent"
        isLoading={state.isDeleteLoading}
      />

      {/* Header */}
      <ListingPageHeader
  title="For Rent Listings"
  subtitle="Manage your rental listings."
  tabs={!state.isOrganizationUser ? [
    { value: "all", label: "Active Listings" },
    { value: "pending", label: "Pending Approval" },
  ] : []}
  activeTab={state.activeTab}
  onTabChange={state.handleSetActiveTab}
  searchQuery={state.searchQuery}
  searchPlaceholder="Search rentals..."
  onSearchChange={state.setSearchQuery}
  showFilters={state.showFilters}
  onToggleFilters={() => state.setShowFilters((p) => !p)}
  addLabel="Add Rent"
  addHref="/rent/add"
  canAdd={state.canAddRentals}
  mounted={state.mounted}
/>

      {/* Filter panel */}
      {state.showFilters && (
        <RentFilterPanel
          activeTab={state.activeTab}
          pendingStatus={state.pendingStatus}
          setPendingStatus={state.setPendingStatus}
          filterPropertyType={state.filterPropertyType}
          setFilterPropertyType={state.setFilterPropertyType}
          filterStatus={state.filterStatus}
          setFilterStatus={state.setFilterStatus}
          petsAllowed={state.petsAllowed}
          setPetsAllowed={state.setPetsAllowed}
          furnished={state.furnished}
          setFurnished={state.setFurnished}
          minPrice={state.minPrice}
          setMinPrice={state.setMinPrice}
          maxPrice={state.maxPrice}
          setMaxPrice={state.setMaxPrice}
          beds={state.beds}
          setBeds={state.setBeds}
          baths={state.baths}
          setBaths={state.setBaths}
          onPageReset={() => state.handleSetPage(1)}
          onResetFilters={state.resetFilters}
        />
      )}

      {/* Property grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {state.loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : state.error ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-80">
            <div className="text-red-500 mb-2 font-bold text-lg">Network Error</div>
            <p className="text-sm">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : state.properties.length > 0 ? (
          state.properties.map((property) => {
            const listingImage = state.getListingImage(property);
            const listingImageKey = `${String(property.id)}:${listingImage}`;
            const creatorInfo = state.creatorOverrides[String(property.id)];

            return (
              <RentPropertyCard
                key={property.id}
                property={property}
                activeTab={state.activeTab}
                isRejectedPendingList={state.isRejectedPendingList}
                canViewRentals={state.canViewRentals}
                canEditRentals={state.canEditRentals}
                canDeleteRentals={state.canDeleteRentals}
                creatorInfo={creatorInfo}
                listingImage={listingImage}
                listingImageFailed={!!state.listingImageFailures[listingImageKey]}
                isMenuOpen={state.activeMenuId === property.id}
                onMenuToggle={() =>
                  state.setActiveMenuId(state.activeMenuId === property.id ? null : property.id)
                }
                onMenuClose={() => state.setActiveMenuId(null)}
                onDelete={state.initiateDelete}
                onApprove={state.onApproveClick}
                onReject={state.onRejectClick}
                onToggleStatus={state.handleToggleRentalStatus}
                onListingImageError={(key) =>
                  state.setListingImageFailures((prev) => ({ ...prev, [key]: true }))
                }
              />
            );
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-50">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MdSearch size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: currentTheme.headingColor }}>
              No Properties Found
            </h3>
            <p style={{ color: currentTheme.textColor }}>Try adjusting your search or filters.</p>
            <button
              onClick={state.resetFilters}
              className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {state.properties.length > 0 && (
        <Pagination pagination={state.pagination} onPageChange={state.handleSetPage} entryLabel="results" />
      )}

      {/* Approve / Reject modal */}
      <ConfirmModal
        isOpen={state.isActionModalOpen}
        onClose={() => state.setIsActionModalOpen}
        onConfirm={state.handleConfirmAction}
        title={state.pendingAction === "approve" ? "Approve Property" : "Reject Property"}
        message={`Are you sure you want to ${state.pendingAction} this property?`}
        confirmLabel={state.pendingAction === "approve" ? "Approve" : "Reject"}
        confirmButtonColor={state.pendingAction === "approve" ? "#10b981" : "#ef4444"}
        isLoading={state.actionLoading}
        showTextarea={state.pendingAction === "reject"}
        textareaLabel="Rejection Reason (Optional)"
        textareaPlaceholder="Please provide a reason for rejecting this property..."
      />
    </div>
  );
}

export default function RentPropertiesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      }
    >
      <RentPropertiesContent />
    </React.Suspense>
  );
}
