"use client";
import { MdAdd, MdSearch, MdFilterList } from "react-icons/md";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

type RentPageHeaderProps = {
  activeTab: "all" | "pending";
  showFilters: boolean;
  searchQuery: string;
  canAddProperties: boolean;
  isOrganizationUser: boolean;
  mounted: boolean;
  onTabChange: (tab: "all" | "pending") => void;
  onSearchChange: (val: string) => void;
  onToggleFilters: () => void;
};

export function RentPageHeader({
  activeTab,
  showFilters,
  searchQuery,
  canAddProperties,
  isOrganizationUser,
  mounted,
  onTabChange,
  onSearchChange,
  onToggleFilters,
}: RentPageHeaderProps) {
  const { currentTheme } = useTheme();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>
          For Rent Listings
        </h1>
        <p className="font-medium text-sm" style={{ color: currentTheme.textColor }}>
          Manage your rental listings.
        </p>

        {/* Tabs */}
        {!isOrganizationUser && (
          <div
            className="flex items-center gap-1 mt-4 p-1 rounded-lg border w-fit"
            style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}
          >
            {(["all", "pending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === tab ? "shadow-sm" : "hover:bg-black/5 opacity-60"}`}
                style={{
                  backgroundColor: activeTab === tab ? currentTheme.primary : "transparent",
                  color: activeTab === tab ? "#fff" : currentTheme.textColor,
                }}
              >
                {tab === "all" ? "Active Listings" : "Pending Approval"}
              </button>
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
            placeholder="Search rentals..."
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
          {/* Filter toggle */}
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

          {/* Add Rent button */}
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
  );
}