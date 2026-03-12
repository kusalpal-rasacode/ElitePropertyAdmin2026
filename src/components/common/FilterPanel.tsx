"use client";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectConfig {
  key: string;
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
}

export interface FilterInputConfig {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: "number" | "text";
  onChange: (value: string) => void;
}

interface FilterPanelProps {
  /** Select (dropdown) filter fields */
  selects?: FilterSelectConfig[];
  /** Number / text input filter fields */
  inputs?: FilterInputConfig[];
  onReset: () => void;
  resetLabel?: string;
}

/**
 * Generic, reusable filter panel.
 *
 * Replaces:
 *  - src/components/properties/Propertiesfilterpanel.tsx
 *  - src/components/rent/Rentfilterpanel.tsx
 *
 * Both filter panels shared identical structure (grid, styling, label/select/input pattern)
 * and only differed in which fields they exposed. This component is fully data-driven.
 *
 * Usage (Properties):
 * ```tsx
 * <FilterPanel
 *   selects={[
 *     {
 *       key: "filterPropertyType",
 *       label: "Property Type",
 *       value: filters.filterPropertyType,
 *       options: PROPERTY_TYPE_OPTIONS,
 *       onChange: (v) => handleFilterChange("filterPropertyType", v),
 *     },
 *     {
 *       key: "filterStatus",
 *       label: "Listing Status",
 *       value: filters.filterStatus,
 *       options: STATUS_OPTIONS,
 *       onChange: (v) => handleFilterChange("filterStatus", v),
 *     },
 *   ]}
 *   inputs={[
 *     {
 *       key: "minPrice",
 *       label: "Min Price",
 *       value: filters.minPrice,
 *       type: "number",
 *       onChange: (v) => handleFilterChange("minPrice", v),
 *     },
 *   ]}
 *   onReset={resetFilters}
 * />
 * ```
 */
export function FilterPanel({
  selects = [],
  inputs = [],
  onReset,
  resetLabel = "Reset Filters",
}: FilterPanelProps) {
  const { currentTheme } = useTheme();

  const selectClass =
    "w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer";
  const inputClass =
    "w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide opacity-60";
  const sharedStyle = {
    backgroundColor: currentTheme.background,
    borderColor: currentTheme.borderColor,
    color: currentTheme.headingColor,
  };

  return (
    <div
      className="p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 mb-6"
      style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {selects.map((field) => (
          <div key={field.key} className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              {field.label}
            </label>
            <select
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className={selectClass}
              style={sharedStyle}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {inputs.map((field) => (
          <div key={field.key} className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              {field.label}
            </label>
            <input
              type={field.type ?? "text"}
              placeholder={field.placeholder ?? "Any"}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className={inputClass}
              style={sharedStyle}
            />
          </div>
        ))}

        {/* Reset button always appears last */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center gap-2"
            style={{ borderColor: currentTheme.borderColor }}
          >
            {resetLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pre-built option sets (shared across Properties & Rent) ──────────────────

export const PROPERTY_TYPE_OPTIONS: FilterSelectOption[] = [
  { value: "All", label: "All Types" },
  { value: "Single-Family", label: "Single-Family" },
  { value: "Multi-Family", label: "Multi-Family" },
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Land", label: "Land" },
];

export const LISTING_STATUS_OPTIONS: FilterSelectOption[] = [
  { value: "All", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const PENDING_STATUS_OPTIONS: FilterSelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export const YES_NO_ALL_OPTIONS: FilterSelectOption[] = [
  { value: "All", label: "Any" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];