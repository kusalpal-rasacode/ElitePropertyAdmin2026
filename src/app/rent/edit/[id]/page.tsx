"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RentForm from "@/components/common/Rentform";
import { getRentalByIdService, updatePendingRentalService } from "@/services/rentals.service";
import { propertyToFormData, PropertyFormData } from "@/utils/propertyFormUtils";
import { mapPropertyFormToRentalPayload, mapRentalToPropertyData } from "@/utils/rentalMapper";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  return fallback;
};

export default function EditRentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: rawRental, isLoading, isError, error } = useQuery({
    queryKey: ["rental", id],
    queryFn: () => getRentalByIdService(id),
    enabled: !!id,
  });

  const { mutate: updateRental, isPending: isUpdating } = useMutation({
    mutationFn: (formData: FormData) => {
      const rentalPayload = mapPropertyFormToRentalPayload(formData, true);
      return updatePendingRentalService(id, rentalPayload);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Rental updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["rental", id] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      router.replace("/rent");
    },
    onError: (err: unknown) => {
      showErrorToast(getErrorMessage(err, "Failed to update rental."));
    }
  });

  if (isLoading) return <div className="py-20 text-center">Loading rental...</div>;
  if (isError) return <div className="py-20 text-center text-red-500">{getErrorMessage(error, "Failed to load rental.")}</div>;

  let initialData: PropertyFormData | undefined;
  let existingImages: string[] = [];

  if (rawRental) {
    const mapped = mapRentalToPropertyData(rawRental);
    const formData = propertyToFormData(mapped);
    initialData = { ...formData, listing_type: "Rent" as const };
    existingImages = mapped.images || [];
  }

  return (
    <RentForm
      mode="edit"
      initialData={initialData}
      existingImages={existingImages}
      onSubmit={(formData) => updateRental(formData)}
      loading={isUpdating}
      backUrl="/rent"
    />
  );
}
