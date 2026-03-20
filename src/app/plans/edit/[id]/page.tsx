"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import PlanForm from "@/components/plans/Planform";
import { getPlanByIdService, updatePlanService } from "@/services/plans.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import {
  PlanFormValues,
  normalizePlanToForm,
  normalizePlanToPayload,
  getErrorMessage,
} from "@/utils/planFormUtils";

export default function EditPlanPage() {
  return (
    <PermissionGuard module="plan" action="edit">
      <EditPlanContent />
    </PermissionGuard>
  );
}

function EditPlanContent() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const queryClient = useQueryClient();

  // ── Fetch plan ──────────────────────────────────────────────────────────────
  const { data: plan, isLoading: isFetching } = useQuery({
    queryKey: ["plans", id],
    queryFn: () => getPlanByIdService(id),
    enabled: !!id,
  });

  // ── Update plan ─────────────────────────────────────────────────────────────
  const { mutate: updatePlan, isPending } = useMutation({
    mutationFn: (data: PlanFormValues) => {
      const payload = normalizePlanToPayload(data);
      return updatePlanService(id, payload);
    },
    onSuccess: (response) => {
      showSuccessToast(response?.message || "Plan updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["plans", id] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      router.replace("/plans");
    },
    onError: (error: unknown) => {
      showErrorToast(getErrorMessage(error, "Failed to update plan."));
    },
  });

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-gray-400 animate-pulse">Loading plan details…</p>
      </div>
    );
  }

  // Normalize API Plan shape → PlanFormValues for the form
  const initialData = plan ? normalizePlanToForm(plan) : undefined;

  return (
    <PlanForm
      key={id}
      mode="edit"
      initialData={initialData}
      onSubmit={(data) => updatePlan(data)}
      loading={isPending}
      backUrl="/plans"
    />
  );
}