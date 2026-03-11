"use client";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { PropertyCard } from "./Propertycard";
import type { PropertyData, ActiveTab, PendingStatus } from "@/types/properties.types";

interface PropertiesGridProps {
    properties: PropertyData[];
    loading: boolean;
    error: string | null;
    activeTab: ActiveTab;
    pendingStatus: PendingStatus;
    isRejectedPendingList: boolean;
    activeMenuId: number | string | null;
    listingImageFailures: Record<string, boolean>;
    canViewProperties: boolean;
    canEditProperties: boolean;
    canDeleteProperties: boolean;
    onMenuToggle: (id: number | string | null) => void;
    onImageError: (key: string) => void;
    onApprove: (id: number | string) => void;
    onReject: (id: number | string) => void;
    onActivate: (id: number | string) => void;
    onDeactivate: (id: number | string) => void;
    onDelete: (id: number | string) => void;
    onResetFilters: () => void;
}

export function PropertiesGrid({
    properties,
    loading,
    error,
    activeTab,
    pendingStatus,
    isRejectedPendingList,
    activeMenuId,
    listingImageFailures,
    canViewProperties,
    canEditProperties,
    canDeleteProperties,
    onMenuToggle,
    onImageError,
    onApprove,
    onReject,
    onActivate,
    onDeactivate,
    onDelete,
    onResetFilters,
}: PropertiesGridProps) {
    const { currentTheme } = useTheme();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
                <div className="col-span-full py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                </div>
            ) : error ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-80">
                    <div className="text-red-500 mb-2 font-bold text-lg">Network Error</div>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : properties.length > 0 ? (
                properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        activeTab={activeTab}
                        pendingStatus={pendingStatus}
                        isRejectedPendingList={isRejectedPendingList}
                        activeMenuId={activeMenuId}
                        listingImageFailures={listingImageFailures}
                        canViewProperties={canViewProperties}
                        canEditProperties={canEditProperties}
                        canDeleteProperties={canDeleteProperties}
                        onMenuToggle={onMenuToggle}
                        onImageError={onImageError}
                        onApprove={onApprove}
                        onReject={onReject}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                        onDelete={onDelete}
                    />
                ))
            ) : (
                <div className="col-span-full py-20 text-center opacity-50">
                    <p className="text-lg font-bold" style={{ color: currentTheme.textColor }}>
                        No properties found matching your filters.
                    </p>
                    <button
                        onClick={onResetFilters}
                        className="text-sm text-blue-500 mt-2 hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}