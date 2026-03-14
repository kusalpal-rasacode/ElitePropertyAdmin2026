"use client";
import React from "react";
import Link from "next/link";
import {
    MdMoreHoriz,
    MdOutlineBedroomParent,
    MdOutlineBathroom,
    MdSquareFoot,
    MdLocationOn,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import type { PropertyData, ActiveTab, PendingStatus } from "@/types/properties.types";

interface PropertyCardProps {
    property: PropertyData;
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
}

export function PropertyCard({
    property,
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
}: PropertyCardProps) {
    const { currentTheme } = useTheme();
    const router = useRouter();

    const listingImage = property.images?.[0] ?? "";
    const imageKey = `${property.id}:${listingImage}`;
    const showListingImage = Boolean(listingImage) && !listingImageFailures[imageKey];
    const isMenuOpen = activeMenuId === property.id;
    const reviewHref = `/properties/review/${property.id}${activeTab === "pending" ? "?source=pending" : ""}`;

    // ─── Status badge logic ───────────────────────────────────────────────────
    const statusBadgeClass =
        activeTab === "pending"
            ? property.status === "approved"
                ? "bg-emerald-500"
                : property.status === "rejected"
                ? "bg-rose-500"
                : "bg-orange-500"
            : property.is_active
            ? "bg-emerald-500"
            : "bg-slate-500";

    const statusLabel =
        activeTab === "pending"
            ? property.status === "approved"
                ? "Approved"
                : property.status === "rejected"
                ? "Rejected"
                : "Pending"
            : property.is_active
            ? "Active"
            : "Inactive";

    // ─── Creator avatar initials ──────────────────────────────────────────────
    const avatarInitials =
        activeTab === "pending" && property.creator
            ? `${property.creator.first_name?.[0] ?? ""}${property.creator.last_name?.[0] ?? ""}`.toUpperCase()
            : "A";

    const creatorName =
        activeTab === "pending" && property.creator
            ? `${property.creator.first_name} ${property.creator.last_name}`
            : "Agent";

    return (
        <div
            onClick={() =>
                router.push(reviewHref)
            }
            className="rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md"
            style={{ backgroundColor: currentTheme.cardBg + "E6", borderColor: currentTheme.borderColor }}
        >
            {/* ─── Image ────────────────────────────────────────────────────── */}
            <PropertyCardImage
                src={listingImage}
                alt={property.street_address}
                show={showListingImage}
                transactionType={property.transaction_type}
                statusBadgeClass={statusBadgeClass}
                statusLabel={statusLabel}
                onError={() => onImageError(imageKey)}
            />

            {/* ─── Body ─────────────────────────────────────────────────────── */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3
                        className="text-lg font-bold line-clamp-1"
                        style={{ color: currentTheme.headingColor }}
                    >
                        {property.street_address}
                    </h3>
                    <p className="text-lg font-bold" style={{ color: currentTheme.primary }}>
                        ${property.listing_price?.toLocaleString()}
                    </p>
                </div>

                <div
                    className="flex items-center gap-1 text-sm mb-4"
                    style={{ color: currentTheme.textColor }}
                >
                    <MdLocationOn size={16} />
                    <p>
                        {property.city}, {property.state}
                    </p>
                </div>

                {/* Rejection reason */}
                {String(property.status).toLowerCase() === "rejected" && property.rejection_reason && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100">
                        <p className="text-xs font-bold text-rose-600 mb-1 uppercase tracking-wider">
                            Rejection Reason
                        </p>
                        <p
                            className="text-sm text-rose-800 font-medium line-clamp-2"
                            title={property.rejection_reason}
                        >
                            {property.rejection_reason}
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div
                    className="grid grid-cols-3 gap-2 py-3 border-t"
                    style={{ borderColor: currentTheme.borderColor }}
                >
                    <StatCell icon={<MdOutlineBedroomParent />} label="Beds" value={property.bedrooms} />
                    <StatCell
                        icon={<MdOutlineBathroom />}
                        label="Baths"
                        value={property.bathrooms}
                        bordered
                    />
                    <StatCell icon={<MdSquareFoot />} label="Sqft" value={property.square_feet} bordered />
                </div>

                {/* Footer */}
                <div
                    className="pt-4 border-t flex items-center justify-between"
                    style={{ borderColor: currentTheme.borderColor }}
                >
                    {/* Creator info */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: currentTheme.primary }}
                        >
                            {avatarInitials}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span
                                className="text-xs font-semibold truncate max-w-[160px]"
                                style={{ color: currentTheme.headingColor }}
                            >
                                {creatorName}
                            </span>
                            {activeTab === "pending" && property.creator && (
                                <span
                                    className="text-[10px] truncate max-w-[160px] opacity-60"
                                    style={{ color: currentTheme.textColor }}
                                >
                                    {property.creator.username}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action menu */}
                    <div className="relative">
                        {(canViewProperties || canEditProperties || canDeleteProperties) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMenuToggle(isMenuOpen ? null : property.id);
                                }}
                                className="hover:opacity-80 p-1 rounded-full hover:bg-black/5 transition-colors"
                                style={{ color: currentTheme.textColor }}
                            >
                                <MdMoreHoriz size={20} />
                            </button>
                        )}

                        {isMenuOpen && (
                            <PropertyCardMenu
                                property={property}
                                activeTab={activeTab}
                                pendingStatus={pendingStatus}
                                isRejectedPendingList={isRejectedPendingList}
                                reviewHref={reviewHref}
                                canViewProperties={canViewProperties}
                                canEditProperties={canEditProperties}
                                canDeleteProperties={canDeleteProperties}
                                onApprove={onApprove}
                                onReject={onReject}
                                onActivate={onActivate}
                                onDeactivate={onDeactivate}
                                onDelete={onDelete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PropertyCardImage({
    src,
    alt,
    show,
    transactionType,
    statusBadgeClass,
    statusLabel,
    onError,
}: {
    src: string;
    alt: string;
    show: boolean;
    transactionType: string;
    statusBadgeClass: string;
    statusLabel: string;
    onError: () => void;
}) {
    return (
        <div className="h-48 w-full relative overflow-hidden">
            {show ? (
                <img
                    src={src}
                    alt=""
                    aria-label={alt || "Property image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={onError}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <div className="px-3 py-1 rounded-md bg-slate-300 text-slate-700 text-sm font-semibold">
                        No Image Available
                    </div>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
            <div
                className="absolute top-4 left-4 px-3 py-1 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#0f172a" }}
            >
                {transactionType}
            </div>
            <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${statusBadgeClass}`}
            >
                {statusLabel}
            </div>
        </div>
    );
}

function StatCell({
    icon,
    label,
    value,
    bordered,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    bordered?: boolean;
}) {
    const { currentTheme } = useTheme();
    return (
        <div
            className={`flex flex-col items-center${bordered ? " border-l" : ""}`}
            style={bordered ? { borderColor: currentTheme.borderColor } : undefined}
        >
            <div
                className="flex items-center gap-1.5 mb-1"
                style={{ color: currentTheme.textColor, opacity: 0.8 }}
            >
                {icon}
                <span className="text-xs font-bold">{label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: currentTheme.headingColor }}>
                {value}
            </span>
        </div>
    );
}

function PropertyCardMenu({
    property,
    activeTab,
    pendingStatus,
    isRejectedPendingList,
    reviewHref,
    canViewProperties,
    canEditProperties,
    canDeleteProperties,
    onApprove,
    onReject,
    onActivate,
    onDeactivate,
    onDelete,
}: {
    property: PropertyData;
    activeTab: ActiveTab;
    pendingStatus: PendingStatus;
    isRejectedPendingList: boolean;
    reviewHref: string;
    canViewProperties: boolean;
    canEditProperties: boolean;
    canDeleteProperties: boolean;
    onApprove: (id: number | string) => void;
    onReject: (id: number | string) => void;
    onActivate: (id: number | string) => void;
    onDeactivate: (id: number | string) => void;
    onDelete: (id: number | string) => void;
}) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col py-1">
                {canViewProperties && (
                    <Link href={reviewHref} className="w-full">
                        <button
                            className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors"
                            style={{ color: currentTheme.headingColor }}
                        >
                            Review Property
                        </button>
                    </Link>
                )}

                {canEditProperties && activeTab === "pending" && pendingStatus !== "rejected" && (
                    <Link href={`/properties/edit/${property.id}`} className="w-full">
                        <button
                            className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 transition-colors"
                            style={{ color: currentTheme.headingColor }}
                        >
                            Edit Property
                        </button>
                    </Link>
                )}

                {canEditProperties && (
                    activeTab === "all" ? (
                        property.is_active ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeactivate(property.id); }}
                                className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors w-full"
                            >
                                Deactivate
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onActivate(property.id); }}
                                className="px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
                            >
                                Activate
                            </button>
                        )
                    ) : (
                        !isRejectedPendingList && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onApprove(property.id); }}
                                className="px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                                Approve
                            </button>
                        )
                    )
                )}

                {activeTab !== "all" && canEditProperties && String(property.status).toLowerCase() !== "rejected" && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onReject(property.id); }}
                        className="px-4 py-2.5 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors w-full"
                    >
                        Reject Property
                    </button>
                )}

                {(canDeleteProperties || (canEditProperties && activeTab !== "all")) && (
                    <div className="h-px my-1" style={{ backgroundColor: currentTheme.borderColor }} />
                )}

                {canDeleteProperties && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                        className="px-4 py-2.5 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        Delete Property
                    </button>
                )}
            </div>
        </div>
    );
}
