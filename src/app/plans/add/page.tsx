"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import PlanForm from "@/components/plans/Planform";
import { createPlanService } from "@/services/plans.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import {
  PlanFormValues,
  normalizePlanToPayload,
  getErrorMessage,
} from "@/utils/planFormUtils";

export default function AddPlanPage() {
  return (
    <PermissionGuard module="plan" action="add">
      <AddPlanContent />
    </PermissionGuard>
  );
}

function AddPlanContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: addPlan, isPending } = useMutation({
    mutationFn: (data: PlanFormValues) => {
      const payload = normalizePlanToPayload(data);
      return createPlanService(payload);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Plan created successfully.");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      router.replace("/plans");
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to create plan."));
    },
  });

  return (
    <PlanForm
      mode="add"
      onSubmit={(data) => addPlan(data)}
      loading={isPending}
      backUrl="/plans"
    />
  );
}