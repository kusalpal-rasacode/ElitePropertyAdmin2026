"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdOutlineBedroomParent, MdOutlineBathroom, MdSquareFoot, MdLocationOn, MdArrowBack, MdCheckCircle, MdCalendarToday, MdHouse, MdConstruction, MdAirlineSeatReclineNormal, MdPets, MdAttachMoney, MdSmokeFree, MdWater, MdPool, MdLocalParking, MdWifi, MdSecurity, MdFitnessCenter, MdElevator, MdBalcony, MdKitchen, MdAcUnit, MdLocalLaundryService, MdCheck, MdClose } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PropertyData } from "@/types/properties.types";
import { approveRentalService, rejectRentalService, getRentalByIdService, getPendingRentalByIdService } from "@/services/rentals.service";
import { getRentalImageCandidates, mapRentalToPropertyData } from "@/utils/rentalMapper";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        const msg = (error as { message?: unknown }).message;
        if (typeof msg === "string") return msg;
    }
    return fallback;
};

type CreatorInfo = {
    fullName: string;
    username: string;
    profileImage: string;
    phoneNumber: string;
};

export default function RentReviewPropertyPage() {
    const { currentTheme } = useTheme();
    const params = useParams(); // To get property ID from URL
    const router = useRouter();
    const searchParams = useSearchParams();
    const source = searchParams.get("source");

    const [property, setProperty] = useState<PropertyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isPendingProperty, setIsPendingProperty] = useState(false);
    const [creator, setCreator] = useState<CreatorInfo | null>(null);
    const [failedImageMap, setFailedImageMap] = useState<Record<string, boolean>>({});
    const fetchedRentalIdRef = useRef<string | null>(null);

    useEffect(() => {
        const rawId = params.id;
        const rentalId = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!rentalId) return;
        if (fetchedRentalIdRef.current === rentalId) return;
        fetchedRentalIdRef.current = rentalId;

        const fetchProperty = async () => {
            setLoading(true);
            try {
                let rental: Record<string, unknown> | null = null;
                let pendingRental = false;

                if (source === "pending") {
                    try {
                        rental = await getPendingRentalByIdService(rentalId);
                        pendingRental = true;
                    } catch {
                        rental = await getRentalByIdService(rentalId);
                        pendingRental = false;
                    }
                } else {
                    try {
                        rental = await getRentalByIdService(rentalId);
                        pendingRental = false;
                    } catch {
                        rental = await getPendingRentalByIdService(rentalId);
                        pendingRental = true;
                    }
                }

                if (rental) {
                    const mapped = mapRentalToPropertyData(rental);
                    setProperty(mapped);
                    setIsPendingProperty(pendingRental);
                    setFailedImageMap({});
                    if (mapped.images && mapped.images.length > 0) {
                        setSelectedImage(mapped.images[0]);
                    }
                    const raw = rental as Record<string, unknown>;
                    const creatorRaw = raw.creator as Record<string, unknown> | undefined;
                    if (creatorRaw && typeof creatorRaw === "object") {
                        const first = typeof creatorRaw.first_name === "string" ? creatorRaw.first_name : "";
                        const last = typeof creatorRaw.last_name === "string" ? creatorRaw.last_name : "";
                        const username = typeof creatorRaw.username === "string" ? creatorRaw.username : "";
                        const fullName = `${first} ${last}`.trim();
                        const profileImageRaw = typeof creatorRaw.profile_image === "string" ? creatorRaw.profile_image : "";
                        const phoneNumber = typeof creatorRaw.phone_number === "string" ? creatorRaw.phone_number : "";
                        const profileImage = getRentalImageCandidates(profileImageRaw)[0] || profileImageRaw;
                        setCreator({
                            fullName: fullName || username || "Listing Agent",
                            username: username || "",
                            profileImage: profileImage || "",
                            phoneNumber: phoneNumber || "",
                        });
                    }
                } else {
                    setError("Property not found");
                }
            } catch (err: unknown) {
                console.error("Failed to fetch property:", err);
                setError(getErrorMessage(err, "Failed to load property details"));
                fetchedRentalIdRef.current = null;
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [params.id, source]);

    const handleApproveClick = () => {
        setPendingAction('approve');
        setIsActionModalOpen(true);
    };

    const handleRejectClick = () => {
        setPendingAction('reject');
        setIsActionModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!property || !pendingAction) return;
        setActionLoading(true);
        try {
            if (pendingAction === 'approve') {
                await approveRentalService(property.id);
                showSuccessToast("Property Approved Successfully!");
            } else {
                await rejectRentalService(property.id);
                showSuccessToast("Property Rejected.");
            }
            router.push("/rent");
        } catch (err: unknown) {
            showErrorToast(getErrorMessage(err, `Failed to ${pendingAction} property.`));
        } finally {
            setActionLoading(false);
            setIsActionModalOpen(false);
            setPendingAction(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="text-red-500 text-xl font-bold">{error || "Property not found"}</div>
                <Link href="/rent">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Back to Rent Listings
                    </button>
                </Link>
            </div>
        );
    }

    const displayImage = selectedImage || (property.images && property.images.length > 0
        ? property.images[0]
        : "");
    const resolveImageSrc = (raw: string) => getRentalImageCandidates(raw)[0] || raw || "";

    const handleDetailImageError = (raw: string) => {
        setFailedImageMap((prev) => ({ ...prev, [raw]: true }));
    };

    return (
        <div className="mx-auto space-y-8 pb-20">

            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href="/rent" className="flex items-center gap-2 hover:opacity-70 transition-opacity" style={{ color: currentTheme.textColor }}>
                    <MdArrowBack size={20} />
                    <span className="font-bold">Back to Rent Listings</span>
                </Link>
                {isPendingProperty && (
                    <div className="flex gap-3">
                        {String(property?.status).toLowerCase() !== "rejected" && (
                            <button
                                onClick={handleRejectClick}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-2"
                            >
                                <MdClose size={18} />
                                Reject Property
                            </button>
                        )}
                        <button
                            onClick={handleApproveClick}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                            style={{ backgroundColor: currentTheme.primary }}
                        >
                            <MdCheck size={18} />
                            Approve Property
                        </button>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                onConfirm={handleConfirmAction}
                title={pendingAction === 'approve' ? "Approve Property" : "Reject Property"}
                message={pendingAction === 'approve'
                    ? "Are you sure you want to approve this property? It will become active immediately."
                    : "Are you sure you want to reject this property? This action cannot be undone."}
                confirmLabel={pendingAction === 'approve' ? "Approve" : "Reject"}
                isLoading={actionLoading}
                confirmButtonColor={pendingAction === 'approve' ? currentTheme.primary : '#ef4444'}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Main Image */}
                    <div className="aspect-video w-full rounded-2xl relative shadow-sm overflow-hidden group bg-gray-100">
                        {displayImage && !failedImageMap[displayImage] && resolveImageSrc(displayImage) ? (
                            <img
                                src={resolveImageSrc(displayImage)}
                                alt={property.street_address}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                onError={() => handleDetailImageError(displayImage)}
                            />
                        ) : (
                            <div className="rent-detail-fallback w-full h-full flex items-center justify-center bg-slate-100">
                                <span className="text-sm font-semibold text-slate-500">No image uploaded from API</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                        <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm" style={{ color: currentTheme.headingColor }}>
                                {property.listing_type || "Rent"}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${property.status === 'Pending' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                                {property.status === 'Pending' ? 'Pending' : 'Active'}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    {property.images && property.images.length > 1 && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                            {property.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === img ? 'ring-2 ring-offset-1 ring-blue-500 border-transparent scale-95' : 'border-transparent hover:opacity-80'}`}
                                    style={{ borderColor: selectedImage === img ? currentTheme.primary : 'transparent' }}
                                >
                                    {!failedImageMap[img] && resolveImageSrc(img) ? (
                                        <img
                                            src={resolveImageSrc(img)}
                                            alt={`Gallery ${idx}`}
                                            className="w-full h-full object-cover"
                                            onError={() => handleDetailImageError(img)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                            <span className="text-[10px] font-semibold text-slate-500">No image</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Details Sections */}
                    <div className="space-y-6">

                        {/* Description */}
                        <div className="rounded-3xl border shadow-sm transition-all hover:shadow-md overflow-hidden relative"
                            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>
                            <div className="p-8">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                                    About this Property
                                </h2>
                                <p className="leading-relaxed whitespace-pre-line text-lg opacity-90" style={{ color: currentTheme.textColor }}>
                                    {property.property_description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        {/* Rental Specifications */}
                        <div className="rounded-3xl border shadow-sm p-8"
                            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                                    <MdCheckCircle size={20} />
                                </div>
                                Rental Specifications
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-sm">
                                {[
                                    { label: "Property Type", value: property.property_type },
                                    { label: "Year Built", value: property.year_built },
                                    { label: "Rent Price", value: property.rent_price ? `$${property.rent_price.toLocaleString()}/${property.rent_frequency === 'Monthly' ? 'mo' : 'yr'}` : null },
                                    { label: "Security Deposit", value: property.security_deposit ? `$${property.security_deposit.toLocaleString()}` : null },
                                    { label: "Available From", value: property.available_from ? new Date(property.available_from).toLocaleDateString() : "Now" },
                                    { label: "Lease Duration", value: property.lease_duration ? `${property.lease_duration} Months` : null },
                                    { label: "Application Fee", value: property.application_fee ? `$${property.application_fee.toLocaleString()}` : "None" },
                                    { label: "Move-in Fees", value: property.move_in_fees ? `$${property.move_in_fees.toLocaleString()}` : "None" },
                                    { label: "Smoking Policy", value: property.smoking_policy || "Not Specified" },
                                    { label: "Furnished", value: property.is_furnished ? "Yes" : "No" },
                                    { label: "Pets Allowed", value: property.pets_allowed ? "Yes" : "No" },
                                    { label: "Garage Spaces", value: property.garage_spaces || "None" },
                                    { label: "Parking Spaces", value: property.parking_spaces || "None" },
                                    { label: "County", value: property.county },
                                    { label: "Listing ID", value: `#${property.id}` },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1 pb-2 border-b border-dashed"
                                        style={{ borderColor: currentTheme.borderColor }}>
                                        <span className="opacity-60 font-medium text-xs uppercase tracking-wide" style={{ color: currentTheme.textColor }}>{item.label}</span>
                                        <span className="font-bold text-base" style={{ color: currentTheme.headingColor }}>{item.value || "N/A"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Utilities Included */}
                        {property.utilities_included && property.utilities_included.length > 0 && (
                            <div className="rounded-3xl border shadow-sm p-8"
                                style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <MdWater size={20} />
                                    </div>
                                    Utilities Included
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {property.utilities_included.map((utility, idx) => (
                                        <span key={idx} className="px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2"
                                            style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}>
                                            <MdCheckCircle className="text-blue-500" size={16} />
                                            {utility}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="rounded-3xl border shadow-sm p-8"
                                style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <MdFitnessCenter size={20} />
                                    </div>
                                    Amenities
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {property.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border bg-opacity-30"
                                            style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                                            <div className="p-1 rounded-full bg-purple-500/10 text-purple-500">
                                                <MdCheckCircle size={16} />
                                            </div>
                                            <span className="font-bold text-sm" style={{ color: currentTheme.headingColor }}>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conditions & Additional Info */}
                        <div className="rounded-3xl border shadow-sm p-8"
                            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <MdConstruction size={20} />
                                </div>
                                Condition & Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-opacity-30" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                                    <div className="p-1 rounded-full bg-blue-500/10 text-blue-500"><MdHouse size={16} /></div>
                                    <span className="font-bold text-sm" style={{ color: currentTheme.headingColor }}>{property.interior_condition || "Standard"} Condition</span>
                                </div>
                                {property.is_furnished && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-opacity-30" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                                        <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-500"><MdAirlineSeatReclineNormal size={16} /></div>
                                        <span className="font-bold text-sm" style={{ color: currentTheme.headingColor }}>Furnished</span>
                                    </div>
                                )}
                                {property.pets_allowed && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-opacity-30" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                                        <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500"><MdPets size={16} /></div>
                                        <span className="font-bold text-sm" style={{ color: currentTheme.headingColor }}>Pets Allowed</span>
                                    </div>
                                )}
                                {property.smoking_policy === "Not Allowed" && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-opacity-30" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                                        <div className="p-1 rounded-full bg-red-500/10 text-red-500"><MdSmokeFree size={16} /></div>
                                        <span className="font-bold text-sm" style={{ color: currentTheme.headingColor }}>No Smoking</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seller/Landlord Notes */}
                        {property.seller_notes && (
                            <div className="rounded-3xl border shadow-sm p-6"
                                style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color: currentTheme.headingColor }}>
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <MdCalendarToday size={20} />
                                    </div>
                                    Landlord Notes
                                </h3>
                                <p className="leading-relaxed opacity-90 whitespace-pre-line" style={{ color: currentTheme.textColor }}>
                                    {property.seller_notes}
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Right Column - Key Info */}
                <div className="space-y-6 self-start" style={{ position: "sticky", top: "1.5rem" }}>

                    {/* Key Specs Card */}
                    <div className="p-6 rounded-2xl border shadow-sm space-y-6"
                        style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>

                        <div>
                            <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: currentTheme.headingColor }}>{property.street_address}</h1>
                            <div className="flex items-center gap-1 opacity-70" style={{ color: currentTheme.textColor }}>
                                <MdLocationOn />
                                <span className="text-sm font-medium">{property.city}, {property.state} {property.zip_code}</span>
                            </div>
                        </div>

                        <div className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
                            ${(property.rent_price || 0).toLocaleString()}
                            <span className="text-lg text-gray-400 font-normal ml-1">/mo</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-4 border-y" style={{ borderColor: currentTheme.borderColor }}>
                            <div className="text-center">
                                <div className="text-2xl font-bold mb-1" style={{ color: currentTheme.headingColor }}>{property.bedrooms}</div>
                                <div className="text-xs font-bold uppercase opacity-60 flex justify-center items-center gap-1" style={{ color: currentTheme.textColor }}>
                                    <MdOutlineBedroomParent /> Beds
                                </div>
                            </div>
                            <div className="text-center border-l" style={{ borderColor: currentTheme.borderColor }}>
                                <div className="text-2xl font-bold mb-1" style={{ color: currentTheme.headingColor }}>{property.bathrooms}</div>
                                <div className="text-xs font-bold uppercase opacity-60 flex justify-center items-center gap-1" style={{ color: currentTheme.textColor }}>
                                    <MdOutlineBathroom /> Baths
                                </div>
                            </div>
                            <div className="text-center border-l" style={{ borderColor: currentTheme.borderColor }}>
                                <div className="text-2xl font-bold mb-1" style={{ color: currentTheme.headingColor }}>{property.square_feet}</div>
                                <div className="text-xs font-bold uppercase opacity-60 flex justify-center items-center gap-1" style={{ color: currentTheme.textColor }}>
                                    <MdSquareFoot /> Sqft
                                </div>
                            </div>
                        </div>

                        {/* Security Deposit & Lease */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between text-sm">
                                <span className="opacity-70" style={{ color: currentTheme.textColor }}>Security Deposit</span>
                                <span className="font-bold" style={{ color: currentTheme.headingColor }}>${(property.security_deposit || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="opacity-70" style={{ color: currentTheme.textColor }}>Lease Duration</span>
                                <span className="font-bold" style={{ color: currentTheme.headingColor }}>{property.lease_duration || 12} Months</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="opacity-70" style={{ color: currentTheme.textColor }}>Available From</span>
                                <span className="font-bold" style={{ color: currentTheme.headingColor }}>{property.available_from ? new Date(property.available_from).toLocaleDateString() : "Now"}</span>
                            </div>
                        </div>

                        {/* Agent */}
                        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: currentTheme.borderColor }}>
                            {creator?.profileImage ? (
                                <img
                                    src={creator.profileImage}
                                    alt={creator.fullName || "Listing Agent"}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-slate-200 text-slate-700">
                                    {creator?.fullName?.slice(0, 1) || "A"}
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-sm" style={{ color: currentTheme.headingColor }}>
                                    {creator?.fullName || "Listing Agent"}
                                </div>

                                {creator?.username && (
                                    <div className="text-[11px] opacity-60" style={{ color: currentTheme.textColor }}>
                                        {creator.username}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
