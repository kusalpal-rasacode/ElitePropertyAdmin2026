"use client";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import type { ActiveTab, PendingStatus, PropertyFilters } from "@/types/properties.types";

interface PropertiesFilterPanelProps {
    activeTab: ActiveTab;
    pendingStatus: PendingStatus;
    filters: PropertyFilters;
    onFilterChange: (key: keyof PropertyFilters, value: string) => void;
    onPendingStatusChange: (status: PendingStatus) => void;
    onReset: () => void;
}

export function PropertiesFilterPanel({
    activeTab,
    pendingStatus,
    filters,
    onFilterChange,
    onPendingStatusChange,
    onReset,
}: PropertiesFilterPanelProps) {
    const { currentTheme } = useTheme();

    const selectClass =
        "w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer";
    const selectStyle = {
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.borderColor,
        color: currentTheme.headingColor,
    };
    const inputClass = "w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500";
    const labelClass = "text-xs font-extrabold uppercase tracking-wide opacity-60";

    return (
        <div
            className="p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 mb-6"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
        >
            {activeTab === "pending" ? (
                /* Pending tab: status filter only */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>
                            Listing Status
                        </label>
                        <select
                            value={pendingStatus}
                            onChange={(e) => onPendingStatusChange(e.target.value as PendingStatus)}
                            className={selectClass}
                            style={selectStyle}
                        >
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <ResetButton onReset={() => onPendingStatusChange("pending")} />
                </div>
            ) : (
                /* All tab: full filter grid */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Property Type</label>
                        <select
                            value={filters.filterPropertyType}
                            onChange={(e) => {
        const value = e.target.value
        onFilterChange("filterPropertyType", value)
        onFilterChange("search", value === "All" ? "" : value.toLowerCase())
    }}
                            className={selectClass}
                            style={selectStyle}
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

                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Listing Status</label>
                        <select
                            value={filters.filterStatus}
                            onChange={(e) => onFilterChange("filterStatus", e.target.value)}
                            className={selectClass}
                            style={selectStyle}
                        >
                            <option value="All">All Statuses</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>

                    {/* <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Transaction</label>
                        <select
                            value={filters.filterListingType}
                            onChange={(e) => onFilterChange("filterListingType", e.target.value)}
                            className={selectClass}
                            style={selectStyle}
                        >
                            <option value="All">All Transactions</option>
                            <option value="Sale">For Sale</option>
                            <option value="Rent">For Rent</option>
                        </select>
                    </div> */}

                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Min Price</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={filters.minPrice}
                            onChange={(e) => onFilterChange("minPrice", e.target.value)}
                            className={inputClass}
                            style={selectStyle}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Max Price</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={filters.maxPrice}
                            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                            className={inputClass}
                            style={selectStyle}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Min Beds</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={filters.beds}
                            onChange={(e) => onFilterChange("beds", e.target.value)}
                            className={inputClass}
                            style={selectStyle}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className={labelClass} style={{ color: currentTheme.textColor }}>Min Baths</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={filters.baths}
                            onChange={(e) => onFilterChange("baths", e.target.value)}
                            className={inputClass}
                            style={selectStyle}
                        />
                    </div>

                    <ResetButton onReset={onReset} />
                </div>
            )}
        </div>
    );
}

function ResetButton({ onReset }: { onReset: () => void }) {
    const { currentTheme } = useTheme();
    return (
        <div className="flex items-end">
            <button
                onClick={onReset}
                className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center gap-2"
                style={{ borderColor: currentTheme.borderColor }}
            >
                Reset Filters
            </button>
        </div>
    );
}