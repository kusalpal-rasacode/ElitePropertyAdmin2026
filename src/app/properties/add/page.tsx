"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropertyForm from "@/components/common/Propertiesform";
import { propertiesService } from "@/services/properties.service";
import { getInitialFormData } from "@/utils/propertyFormUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  return fallback;
};

export default function AddPropertyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialData = useMemo(() => ({ ...getInitialFormData(), listing_type: "Sale" as const }), []);

  const { mutate: addProperty, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      formData.append("listing_date", new Date().toISOString().split("T")[0]);
      return propertiesService(formData);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Property added successfully.");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      router.replace("/properties");
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
