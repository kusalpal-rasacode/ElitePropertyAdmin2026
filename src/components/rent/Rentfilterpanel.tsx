"use client";
import { useTheme } from "@/providers/ThemeProvider";

type RentFilterPanelProps = {
  activeTab: "all" | "pending";
  pendingStatus: "pending" | "rejected";
  setPendingStatus: (val: "pending" | "rejected") => void;
  filterPropertyType: string;
  setFilterPropertyType: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  petsAllowed: string;
  setPetsAllowed: (val: string) => void;
  furnished: string;
  setFurnished: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  beds: string;
  setBeds: (val: string) => void;
  baths: string;
  setBaths: (val: string) => void;
  onPageReset: () => void;
  onResetFilters: () => void;
};

export function RentFilterPanel({
  activeTab,
  pendingStatus,
  setPendingStatus,
  filterPropertyType,
  setFilterPropertyType,
  filterStatus,
  setFilterStatus,
  petsAllowed,
  setPetsAllowed,
  furnished,
  setFurnished,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  beds,
  setBeds,
  baths,
  setBaths,
  onPageReset,
  onResetFilters,
}: RentFilterPanelProps) {
  const { currentTheme } = useTheme();

  const selectClass =
    "w-full h-10 px-3 rounded-lg border text-sm font-medium outline-none focus:border-blue-500 cursor-pointer";
  const inputClass =
    "w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-blue-500";
  const labelClass =
    "text-xs font-extrabold uppercase tracking-wide opacity-60";
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
      {activeTab === "pending" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              Listing Status
            </label>
            <select
              value={pendingStatus}
              onChange={(e) => {
                setPendingStatus(e.target.value as "pending" | "rejected");
                onPageReset();
              }}
              className={selectClass}
              style={sharedStyle}
            >
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setPendingStatus("pending"); onPageReset(); }}
              className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center"
              style={{ borderColor: currentTheme.borderColor }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Rent Type</label>
            <select value={filterPropertyType} onChange={(e) => { setFilterPropertyType(e.target.value); onPageReset(); }} className={selectClass} style={sharedStyle}>
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
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); onPageReset(); }} className={selectClass} style={sharedStyle}>
              <option value="All">All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Pets Allowed</label>
            <select value={petsAllowed} onChange={(e) => { setPetsAllowed(e.target.value); onPageReset(); }} className={selectClass} style={sharedStyle}>
              <option value="All">Any</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Furnished</label>
            <select value={furnished} onChange={(e) => { setFurnished(e.target.value); onPageReset(); }} className={selectClass} style={sharedStyle}>
              <option value="All">Any</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Min Rent</label>
            <input type="number" placeholder="Any" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); onPageReset(); }} className={inputClass} style={sharedStyle} />
          </div>

          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Max Rent</label>
            <input type="number" placeholder="Any" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); onPageReset(); }} className={inputClass} style={sharedStyle} />
          </div>

          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Min Beds</label>
            <input type="number" placeholder="Any" value={beds} onChange={(e) => { setBeds(e.target.value); onPageReset(); }} className={inputClass} style={sharedStyle} />
          </div>

          <div className="space-y-3">
            <label className={labelClass} style={{ color: currentTheme.textColor }}>Min Baths</label>
            <input type="number" placeholder="Any" value={baths} onChange={(e) => { setBaths(e.target.value); onPageReset(); }} className={inputClass} style={sharedStyle} />
          </div>

          <div className="flex items-end">
            <button
              onClick={onResetFilters}
              className="h-10 px-5 w-full rounded-lg text-xs font-bold uppercase tracking-wide border border-dashed hover:border-solid hover:bg-red-50 text-red-500 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: currentTheme.borderColor }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}