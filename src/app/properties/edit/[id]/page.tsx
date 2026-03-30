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

import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function EditPropertyPage() {
  return (
    <PermissionGuard module="properties" action="edit">
      <EditPropertyContent />
    </PermissionGuard>
  );
}

function EditPropertyContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: property, isLoading: isFetching } = useQuery({
    queryKey: ["properties", id],
    queryFn: () => getPropertyByIdService(id), // Changed from getPendingPropertyByIdService
    enabled: !!id, // Kept enabled check
  });

  const { mutate: updateProperty, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      

      return putPropertyByIdService(id, formData);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Property updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["properties", id] }); // Invalidate specific property
      queryClient.invalidateQueries({ queryKey: ["properties"] }); // Invalidate all properties
      router.replace("/properties");
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to update property."));
    },
  });

  if (isFetching) return <div className="p-8 text-center text-slate-500">Loading property details...</div>;
  // Removed isError check as per snippet, assuming error handling is implicit or less critical for display

  // Re-added original logic for initialData and existingImages based on 'property'
  const initialData = property ? { ...propertyToFormData(property), listing_type: "Sale" as const } : undefined;
  const existingImages = property?.images || [];

  return (
    <PropertyForm
      mode="edit"
      initialData={initialData}
      existingImages={existingImages}
      onSubmit={(formData) => updateProperty(formData)}
      loading={isPending}
      backUrl="/properties"
    />
  );
}
