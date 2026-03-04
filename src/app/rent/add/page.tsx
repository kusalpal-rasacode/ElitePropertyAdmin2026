"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import RentForm from "@/components/common/Rentform";
import { createRentalService } from "@/services/rentals.service";
import { getInitialFormData } from "@/utils/propertyFormUtils";
import { mapPropertyFormToRentalPayload } from "@/utils/rentalMapper";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

export default function AddRentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialData = useMemo(() => ({ ...getInitialFormData(), listing_type: "Rent" as const }), []);

  const { mutate: addRental, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      const rentalPayload = mapPropertyFormToRentalPayload(formData);
      return createRentalService(rentalPayload);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Rental created successfully.");
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      router.replace("/rent");
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to create rental."));
    }
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
