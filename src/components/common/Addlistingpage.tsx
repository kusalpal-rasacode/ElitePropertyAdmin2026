"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RiHomeLine, RiKeyLine } from "react-icons/ri";
import { useTheme } from "@/providers/ThemeProvider";

import PropertyForm from "@/components/common/Propertiesform";
import RentForm from "@/components/common/Rentform";
import { propertiesService } from "@/services/properties.service";
import { createRentalService } from "@/services/rentals.service";
import { getInitialFormData } from "@/utils/propertyFormUtils";
import { mapPropertyFormToRentalPayload } from "@/utils/rentalMapper";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveMode = "property" | "rental";

type Props = {
  /**
   * Pre-select a tab on mount.
   * - `/properties/add`  →  defaultMode="property"
   * - `/rent/add`        →  defaultMode="rental"
   * Toggle is always visible so users can freely switch.
   */
  defaultMode?: ActiveMode;
};

// ─── Error helper ─────────────────────────────────────────────────────────────

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  return fallback;
};

// ─── Inner content — re-keyed on mode so form state resets on tab switch ──────

function AddPropertyContent({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const initialData = useMemo(
    () => ({ ...getInitialFormData(), listing_type: "Sale" as const }),
    [],
  );

  const { mutate: addProperty, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0];
      
      formData.set("listing_date", today);
      

      return propertiesService(formData);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Property added successfully.");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      onSuccess();
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to add property."));
    },
  });

  return (
    <PropertyForm
      mode="add"
      initialData={initialData}
      onSubmit={(formData) => addProperty(formData)}
      loading={isPending}
      backUrl="/properties"
    />
  );
}

function AddRentalContent({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const initialData = useMemo(
    () => ({ ...getInitialFormData(), listing_type: "Rent" as const }),
    [],
  );

  const { mutate: addRental, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      formData.append("is_for_rent", "true");
      const rentalPayload = mapPropertyFormToRentalPayload(formData);
      return createRentalService(rentalPayload);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Rental created successfully.");
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      onSuccess();
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to create rental."));
    },
  });

  return (
    <RentForm
      mode="add"
      initialData={initialData}
      onSubmit={(formData) => addRental(formData)}
      loading={isPending}
      backUrl="/rent"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddListingPage({ defaultMode = "property" }: Props) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [activeMode, setActiveMode] = useState<ActiveMode>(defaultMode);
  const isProperty = activeMode === "property";

  const handleSuccess = () =>
    router.replace(isProperty ? "/properties" : "/rent");

  return (
    <PermissionGuard module={isProperty ? "properties" : "rent"} action="add">
      <div className="max-w-7xl mx-auto px-6 pb-20">

        {/* ── Hero Banner with Toggle ──────────────────────────────────── */}
        <div
          className="mb-8 relative overflow-hidden rounded-3xl p-8 shadow-xl"
          style={{ background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.primary}cc)` }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {isProperty ? "Add Property for Investment" : "Add Rental Listing"}
              </h1>
              <p className="mt-1 font-medium text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
                {isProperty
                  ? "Complete the form below to list your investment property"
                  : "Fill in the details to list your rental property"}
              </p>
            </div>

            {/* ── Mode Toggle — always visible, theme-aware ──────────── */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-2xl p-1 border border-white/30 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMode("property")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={
                  activeMode === "property"
                    ? {
                        backgroundColor: "#ffffff",
                        color: currentTheme.primary,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }
                    : { color: "#ffffff" }
                }
              >
                <RiHomeLine className="text-base" /> Property
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("rental")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={
                  activeMode === "rental"
                    ? {
                        backgroundColor: "#ffffff",
                        color: currentTheme.primary,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }
                    : { color: "#ffffff" }
                }
              >
                <RiKeyLine className="text-base" /> For Rent
              </button>
            </div>
          </div>
        </div>

        {/* ── Form — key forces full remount on tab switch ─────────────── */}
        {isProperty ? (
          <AddPropertyContent key="property" onSuccess={handleSuccess} />
        ) : (
          <AddRentalContent key="rental" onSuccess={handleSuccess} />
        )}

      </div>
    </PermissionGuard>
  );
}