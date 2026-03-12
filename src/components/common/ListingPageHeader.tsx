"use client";
import React from "react";
import Link from "next/link";
import { MdAdd, MdSearch, MdFilterList } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

interface Tab {
  value: string;
  label: string;
}

interface ListingPageHeaderProps {
  /** Page heading text */
  title: string;
  /** Subtitle / description */
  subtitle: string;

  // Tabs
  tabs?: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;

  // Search
  searchQuery: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;

  // Filter toggle
  showFilters: boolean;
  onToggleFilters: () => void;

  // Add button
  addLabel?: string;
  addHref?: string;
  /** Use a button click instead of a link (for modals). */
  onAddClick?: () => void;
  canAdd?: boolean;
  mounted?: boolean;
}

/**
 * Common listing-page header used across all list pages.
 *
 * Replaces:
 *  - src/components/properties/Propertiesheader.tsx
 *  - src/components/rent/Rentpageheader.tsx
 *  - Inline header in src/app/organizations/page.tsx
 *
 * Usage:
 * ```tsx
 * <ListingPageHeader
 *   title="Property Listings"
 *   subtitle="Manage all properties displayed on the user site."
 *   tabs={[
 *     { value: "all", label: "Active Listings" },
 *     { value: "pending", label: "Pending Approval" },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={handleSetActiveTab}
 *   searchQuery={filters.searchQuery}
 *   onSearchChange={(v) => handleFilterChange("searchQuery", v)}
 *   showFilters={showFilters}
 *   onToggleFilters={() => setShowFilters((p) => !p)}
 *   addLabel="Add Property"
 *   addHref="/properties/add"
 *   canAdd={canAddProperties}
 *   mounted={mounted}
 * />
 * ```
 */
export function ListingPageHeader({
  title,
  subtitle,
  tabs = [],
  activeTab,
  onTabChange,
  searchQuery,
  searchPlaceholder = "Search...",
  onSearchChange,
  showFilters,
  onToggleFilters,
  addLabel = "Add",
  addHref,
  onAddClick,
  canAdd = true,
  mounted = true,
}: ListingPageHeaderProps) {
  const { currentTheme } = useTheme();

  const showTabs = tabs.length > 1;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: currentTheme.headingColor }}
        >
          {title}
        </h1>
        <p className="font-medium text-sm" style={{ color: currentTheme.textColor }}>
          {subtitle}
        </p>

        {showTabs && (
          <div
            className="flex items-center gap-1 mt-4 p-1 rounded-lg border w-fit"
            style={{
              borderColor: currentTheme.borderColor,
              backgroundColor: currentTheme.cardBg,
            }}
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.value}
                label={tab.label}
                isActive={activeTab === tab.value}
                onClick={() => onTabChange(tab.value)}
              />
            ))}
          </div>
        )}
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
            placeholder={searchPlaceholder}
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
            className={`px-4 py-2.5 border rounded-lg hover:brightness-95 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none ${
              showFilters ? "ring-2 ring-blue-500/20 border-blue-500" : ""
            }`}
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: showFilters ? currentTheme.primary : currentTheme.borderColor,
              color: showFilters ? currentTheme.primary : currentTheme.headingColor,
            }}
          >
            <MdFilterList size={18} />
            Filter
          </button>

          {/* Add button */}
          {mounted && canAdd && (
            <>
              {addHref ? (
                <Link href={addHref} className="flex-1 sm:flex-none">
                  <button
                    className="w-full px-5 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                    style={{ backgroundColor: currentTheme.primary }}
                  >
                    <MdAdd size={20} />
                    {addLabel}
                  </button>
                </Link>
              ) : (
                <button
                  onClick={onAddClick}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <MdAdd size={20} />
                  {addLabel}
                </button>
              )}
            </>
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
      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
        isActive ? "shadow-sm" : "hover:bg-black/5 opacity-60"
      }`}
      style={{
        backgroundColor: isActive ? currentTheme.primary : "transparent",
        color: isActive ? "#fff" : currentTheme.textColor,
      }}
    >
      {label}
    </button>
  );
}