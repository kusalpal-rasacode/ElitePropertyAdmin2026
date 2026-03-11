"use client";
import React from "react";
import Link from "next/link";
import { MdAdd, MdSearch, MdFilterList } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import type { ActiveTab } from "@/types/properties.types";

interface PropertiesHeaderProps {
    activeTab: ActiveTab;
    searchQuery: string;
    showFilters: boolean;
    mounted: boolean;
    canAddProperties: boolean;
    isSuperAdmin: boolean;
    onTabChange: (tab: ActiveTab) => void;
    onSearchChange: (value: string) => void;
    onToggleFilters: () => void;
}

export function PropertiesHeader({
    activeTab,
    searchQuery,
    showFilters,
    mounted,
    canAddProperties,
    isSuperAdmin,
    onTabChange,
    onSearchChange,
    onToggleFilters,
}: PropertiesHeaderProps) {
    const { currentTheme } = useTheme();

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>
                    Property Listings
                </h1>
                <p className="font-medium text-sm" style={{ color: currentTheme.textColor }}>
                    Manage all properties displayed on the user site.
                </p>

                {/* Tabs */}
                <div
                    className="flex items-center gap-1 mt-4 p-1 rounded-lg border w-fit"
                    style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}
                >
                    <TabButton
                        label="Active Listings"
                        isActive={activeTab === "all"}
                        onClick={() => onTabChange("all")}
                    />
                    {isSuperAdmin && (
                        <TabButton
                            label="Pending Approval"
                            isActive={activeTab === "pending"}
                            onClick={() => onTabChange("pending")}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative group w-full sm:w-auto">
                    <MdSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                        size={20}
                        style={{ color: currentTheme.textColor }}
                    />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64 transition-all"
                        style={{
                            backgroundColor: currentTheme.cardBg,
                            borderColor: currentTheme.borderColor,
                            color: currentTheme.textColor,
                        }}
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {/* Filter Toggle */}
                    <button
                        onClick={onToggleFilters}
                        className={`px-4 py-2.5 border rounded-lg hover:brightness-95 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none ${showFilters ? "ring-2 ring-blue-500/20 border-blue-500" : ""}`}
                        style={{
                            backgroundColor: currentTheme.cardBg,
                            borderColor: showFilters ? currentTheme.primary : currentTheme.borderColor,
                            color: showFilters ? currentTheme.primary : currentTheme.headingColor,
                        }}
                    >
                        <MdFilterList size={18} />
                        Filter
                    </button>

                    {/* Add Property */}
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
    );
}

// ─── Internal sub-component ───────────────────────────────────────────────────
function TabButton({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    const { currentTheme } = useTheme();
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${isActive ? "shadow-sm" : "hover:bg-black/5 opacity-60"}`}
            style={{
                backgroundColor: isActive ? currentTheme.primary : "transparent",
                color: isActive ? "#fff" : currentTheme.textColor,
            }}
        >
            {label}
        </button>
    );
}