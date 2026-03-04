"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PropertyForm from "@/components/common/Propertiesform";
import { getPropertyByIdService, putPropertyByIdService, getPendingPropertyByIdService } from "@/services/properties.service";
import { propertyToFormData } from "@/utils/propertyFormUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: rawProperty, isLoading, isError, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getPendingPropertyByIdService(id),
    enabled: !!id,
  });

  const { mutate: updateProperty, isPending: isUpdating } = useMutation({
    mutationFn: (formData: FormData) => putPropertyByIdService(id, formData),
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Property updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      router.replace("/properties");
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to update property."));
    },
  });

  if (isLoading) return <div className="py-20 text-center">Loading property...</div>;
  if (isError) return <div className="py-20 text-center text-red-500">{getErrorMessage(error, "Failed to load property.")}</div>;

  const initialData = rawProperty ? { ...propertyToFormData(rawProperty), listing_type: "Sale" as const } : undefined;
  const existingImages = rawProperty?.images || [];

  return (
    <PropertyForm
      mode="edit"
      initialData={initialData}
      existingImages={existingImages}
      onSubmit={(formData) => updateProperty(formData)}
      loading={isUpdating}
      backUrl="/properties"
    />
  );
}
