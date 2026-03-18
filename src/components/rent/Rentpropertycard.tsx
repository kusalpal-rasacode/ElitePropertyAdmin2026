"use client";
import {
  MdOutlineBedroomParent,
  MdOutlineBathroom,
  MdSquareFoot,
  MdLocationOn,
  MdMoreHoriz,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { PropertyData } from "@/types/properties.types";
import { getRentalImageCandidates } from "@/utils/rentalMapper";
import { CreatorAvatar } from "./Creatoravatar";

type CreatorPreview = {
  username: string;
  phoneNumber: string;
  profileImage: string;
};

type RentPropertyCardProps = {
  property: PropertyData;
  activeTab: "all" | "pending";
  isRejectedPendingList: boolean;
  canViewRentals: boolean;
  canEditRentals: boolean;
  canDeleteRentals: boolean;
  creatorInfo?: CreatorPreview;
  listingImage: string;
  listingImageFailed: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onDelete: (id: number | string) => void;
  onApprove: (id: number | string) => void;
  onReject: (id: number | string) => void;
  onToggleStatus: (property: PropertyData) => void;
  onListingImageError: (key: string) => void;
};

export function RentPropertyCard({
  property,
  activeTab,
  isRejectedPendingList,
  canViewRentals,
  canEditRentals,
  canDeleteRentals,
  creatorInfo,
  listingImage,
  listingImageFailed,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  onDelete,
  onApprove,
  onReject,
  onToggleStatus,
  onListingImageError,
}: RentPropertyCardProps) {
  const { currentTheme } = useTheme();
  const router = useRouter();

  const listingImageKey = `${String(property.id)}:${listingImage}`;
  const showListingImage = Boolean(listingImage) && !listingImageFailed;
  const creatorInitial = (creatorInfo?.username || "N").trim().charAt(0).toUpperCase();

  const handleCardClick = () => {
    router.push(`/rent/review/${property.id}${activeTab === "pending" ? "?source=pending" : ""}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col h-full rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md"
      style={{ backgroundColor: currentTheme.cardBg + "E6", borderColor: currentTheme.borderColor }}
    >
      {/* Image */}
      <div className="h-48 w-full relative overflow-hidden">
        {showListingImage ? (
          <img
            src={getRentalImageCandidates(listingImage)[0] || listingImage}
            alt=""
            aria-label={property.street_address || "Property image"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => onListingImageError(listingImageKey)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="px-3 py-1 rounded-md bg-slate-300 text-slate-700 text-sm font-semibold">
              No Image Available
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* Listing type badge */}
        <div className="absolute top-4 left-4 px-3 py-1 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", color: "#0f172a" }}>
          {property.listing_type || "Rent"}
        </div>

        {/* Status badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${
          property.status === "Pending" ? "bg-orange-500"
          : property.status === "Rejected" ? "bg-rose-500"
          : property.status === "Inactive" ? "bg-slate-500"
          : property.status === "Cancelled" ? "bg-rose-500"
          : "bg-emerald-500"
        }`}>
          {property.status || "Active"}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          {/* Title & Price */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold line-clamp-1" style={{ color: currentTheme.headingColor }}>
              {property.street_address}
            </h3>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: currentTheme.primary }}>
                ${(property.rent_price || property.listing_price)?.toLocaleString()}
                <span className="text-xs font-normal opacity-70 ml-1">/mo</span>
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm mb-4" style={{ color: currentTheme.textColor }}>
            <MdLocationOn size={16} />
            <p>{property.city}, {property.state}</p>
          </div>

          {/* Rejection reason */}
          {String(property.status).toLowerCase() === "rejected" && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100">
              <p className="text-xs font-bold text-rose-600 mb-1 uppercase tracking-wider">Rejection Reason</p>
              <p className="text-sm text-rose-800 font-medium line-clamp-2" title={property.rejection_reason || "No specific reason provided."}>
                {property.rejection_reason || "No specific reason provided by administrator."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto">
          {/* Stats: Beds / Baths / Sqft */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t" style={{ borderColor: currentTheme.borderColor }}>
            {[
              { icon: <MdOutlineBedroomParent />, label: "Beds", value: property.bedrooms },
              { icon: <MdOutlineBathroom />, label: "Baths", value: property.bathrooms },
              { icon: <MdSquareFoot />, label: "Sqft", value: property.square_feet },
            ].map(({ icon, label, value }, i) => (
              <div key={label} className={`flex flex-col items-center ${i > 0 ? "border-l" : ""}`} style={i > 0 ? { borderColor: currentTheme.borderColor } : {}}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                  {icon}
                  <span className="text-xs font-bold">{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Footer: Creator & Actions */}
          <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: currentTheme.borderColor }}>
            <div className="flex items-center gap-2">
              <CreatorAvatar profileImage={creatorInfo?.profileImage} username={creatorInfo?.username} initial={creatorInitial} />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-60 line-clamp-1" style={{ color: currentTheme.textColor }}>
                  {creatorInfo?.username || "N/A"}
                </p>
                <p className="text-[10px] opacity-70 line-clamp-1" style={{ color: currentTheme.textColor }}>
                  {creatorInfo?.phoneNumber || "No phone"}
                </p>
              </div>
            </div>

            {/* Dropdown */}
            <div className="relative">
              {(canViewRentals || canEditRentals || canDeleteRentals) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
                  className="hover:opacity-80 p-1 rounded-full hover:bg-black/5 transition-colors"
                  style={{ color: currentTheme.textColor }}
                >
                  <MdMoreHoriz size={20} />
                </button>
              )}

              {isMenuOpen && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2"
                  style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col py-1">
                    {canViewRentals && (
                      <button
                        onClick={() => router.push(`/rent/review/${property.id}${activeTab === "pending" ? "?source=pending" : ""}`)}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors"
                        style={{ color: currentTheme.headingColor }}
                      >
                        Review Property
                      </button>
                    )}

                    {canEditRentals && property.status === "Pending" && !isRejectedPendingList && (
                      <button
                        onClick={() => router.push(`/rent/edit/${property.id}`)}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors"
                        style={{ color: currentTheme.headingColor }}
                      >
                        Edit Property
                      </button>
                    )}

                    {canEditRentals && (
                      activeTab === "all" ? (
                        <button
                          onClick={() => onToggleStatus(property)}
                          className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          {property.status === "Inactive" ? "Activate" : "Deactivate"}
                        </button>
                      ) : (
                        !isRejectedPendingList && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onApprove(property.id); }}
                            className="px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
                          >
                            Approve
                          </button>
                        )
                      )
                    )}

                    {activeTab !== "all" && canEditRentals && String(property.status).toLowerCase() !== "rejected" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReject(property.id); }}
                        className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors w-full"
                      >
                        Reject Property
                      </button>
                    )}

                    {/* Divider only shown if delete button is visible */}
                    {canDeleteRentals && activeTab !== "pending" && (
                      <div className="h-px bg-black/5 my-1" style={{ backgroundColor: currentTheme.borderColor }} />
                    )}

                    {/* Delete button commented out for pending/rejected as requested */}
                    {canDeleteRentals && activeTab !== "pending" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(property.id); onMenuClose(); }}
                        className="px-4 py-2.5 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
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
    </div>
  );
}