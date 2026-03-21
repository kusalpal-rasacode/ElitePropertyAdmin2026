"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  MdSave, MdAdd, MdClose,
  MdTitle, MdDescription, MdAttachMoney, MdRepeat,
  MdCategory, MdToggleOn, MdBusiness, MdSecurity, MdStar
} from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { showErrorToast } from "@/utils/toast";
import { PageHeader } from "@/components/common/Pageheader";
import { SectionCard } from "@/components/common/Sectioncard";
import { InputField } from "@/components/common/InputField";
import { TextInput } from "@/components/common/Textinput";
import { TextArea } from "@/components/common/Textarea";
import { SelectInput } from "@/components/common/Selectinput";
import {
  PLAN_TYPES,
  BILLING_CYCLES,
  PlanFormValues,
  planSchema,
  getInitialPlanFormData,
  getErrorMessage,
} from "@/utils/planFormUtils";
import { getOrganizations } from "@/services/organization.service";
import { getAllRoles } from "@/services/rbac.service";
import type { Organization } from "@/types/organization.types";
import type { RbacRole } from "@/types/rbac.type";

// ─── Props ────────────────────────────────────────────────────────────────────
interface PlanFormProps {
  mode: "add" | "edit";
  initialData?: Partial<PlanFormValues>;
  onSubmit: (data: PlanFormValues) => Promise<void> | void;
  loading?: boolean;
  backUrl?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlanForm({
  mode,
  initialData,
  onSubmit,
  loading = false,
  backUrl = "/plans",
}: PlanFormProps) {
  const { currentTheme } = useTheme();
  const isEditMode = mode === "edit";

  // ── React Hook Form ─────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: yupResolver(planSchema) as any,
    defaultValues: initialData ?? getInitialPlanFormData(),
  });

  // ── Dropdown data ───────────────────────────────────────────────────────────
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [orgRes, rolesRes] = await Promise.all([
          getOrganizations(),
          getAllRoles(),
        ]);
        const orgList: Organization[] = Array.isArray(orgRes)
          ? orgRes
          : (orgRes as { data?: Organization[] }).data ?? [];
        setOrganizations(orgList);
        setRoles(rolesRes);
      } catch (err) {
        showErrorToast(getErrorMessage(err, "Failed to load organizations or roles."));
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);

  // ── Reset form AFTER both initialData AND dropdowns are ready ───────────────
  // This prevents the race condition where options don't exist yet when reset()
  // sets the value, causing the <select> to show nothing selected in edit mode.
  useEffect(() => {
    if (initialData && !loadingDropdowns) {
      reset({ ...getInitialPlanFormData(), ...initialData });
    }
  }, [initialData, loadingDropdowns, reset]);

  // ── Features ─────────────────────────────────────────────────────────────────
  const features = watch("features") ?? [];
  const [featureInput, setFeatureInput] = useState("");

  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    setValue("features", [...features, v], { shouldValidate: true });
    setFeatureInput("");
  };

  const removeFeature = (i: number) =>
    setValue(
      "features",
      features.filter((_, idx) => idx !== i),
      { shouldValidate: true }
    );

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submitForm = async (data: PlanFormValues) => {
    try {
      await onSubmit(data);
    } catch (err) {
      showErrorToast(
        getErrorMessage(err, `Failed to ${isEditMode ? "update" : "create"} plan.`)
      );
    }
  };

  const onInvalid = (errs: any) => {
    const firstKey = Object.keys(errs)[0];
    if (firstKey) {
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Build select options
  const planTypeOptions = PLAN_TYPES.map((t) => ({
    label: t.charAt(0).toUpperCase() + t.slice(1),
    value: t,
  }));

  const billingCycleOptions = BILLING_CYCLES.map((c) => ({
    label: c.charAt(0).toUpperCase() + c.slice(1),
    value: c,
  }));

  const statusOptions = [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const orgOptions = organizations.map((o) => ({ label: o.name, value: String(o.id) }));
  const roleOptions = roles.map((r) => ({
    label: r.role_title || r.role || r.name || "",
    value: String(r.id),
  }));

  const isBusy = isSubmitting || loading;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1600px] mx-auto pb-20 fade-in-up">

      {/* Page Header — same as Campaigns */}
      <PageHeader
        backLink={backUrl}
        title={isEditMode ? "Edit Plan" : "Add New Plan"}
        subtitle={
          isEditMode
            ? "Update the details below to modify this plan."
            : "Fill in the details below to create a new subscription plan."
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => history.back()}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-black/5 whitespace-nowrap transition-all"
              style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(submitForm, onInvalid)}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow-md hover:brightness-110 flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: currentTheme.primary }}
              disabled={isBusy || loadingDropdowns}
            >
              <MdSave size={18} />
              <span>
                {isBusy
                  ? isEditMode ? "Updating..." : "Creating..."
                  : isEditMode ? "Update Plan" : "Create Plan"}
              </span>
            </button>
          </>
        }
      />

      <form onSubmit={handleSubmit(submitForm, onInvalid)} className="space-y-6" noValidate>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ── Section 1: Basic Info ─────────────────────────── */}
          <SectionCard stepNumber={1} title="Basic Information" bgColor="bg-blue-50" textColor="text-blue-600">
            <div className="space-y-5">

              <InputField label="Plan Name" required icon={<MdTitle size={16} />} error={errors.name?.message}>
                <TextInput
                  {...register("name")}
                  placeholder="basic_plan"
                />
              </InputField>

              <InputField label="Display Name" icon={<MdTitle size={16} />} error={errors.display_name?.message}>
                <TextInput
                  {...register("display_name")}
                  placeholder="Basic Plan"
                />
              </InputField>

              {/* Description — textarea, no left-icon padding needed */}
              <div>
                <label
                  className="block text-xs font-extrabold uppercase tracking-wide mb-1.5 opacity-90"
                  style={{ color: currentTheme.headingColor }}
                >
                  <span className="inline-flex items-center gap-1">
                    <MdDescription size={14} className="opacity-60" />
                    Description
                  </span>
                </label>
                <TextArea
                  {...register("description")}
                  rows={3}
                  placeholder="Perfect for getting started"
                />
              </div>

            </div>
          </SectionCard>

          {/* ── Section 2: Pricing & Type ─────────────────────── */}
          <SectionCard stepNumber={2} title="Pricing & Type" bgColor="bg-violet-50" textColor="text-violet-600">
            <div className="space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Price ($)" required icon={<MdAttachMoney size={16} />} error={errors.price?.message}>
                  <TextInput
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="9.99"
                    {...register("price", { valueAsNumber: true })}
                  />
                </InputField>

                <InputField label="Billing Cycle" required icon={<MdRepeat size={16} />} error={errors.billing_cycle?.message}>
                  <SelectInput
                    {...register("billing_cycle")}
                    placeholder="Select cycle"
                    options={billingCycleOptions}
                  />
                </InputField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Plan Type" required icon={<MdCategory size={16} />} error={errors.plan_type?.message}>
                  <SelectInput
                    {...register("plan_type")}
                    placeholder="Select type"
                    options={planTypeOptions}
                  />
                </InputField>

                <InputField label="Status" icon={<MdToggleOn size={16} />} error={errors.is_active?.message}>
                  <SelectInput
                    {...register("is_active")}
                    placeholder="Select status"
                    options={statusOptions}
                  />
                </InputField>
              </div>

            </div>
          </SectionCard>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ── Section 3: Organization & Role ───────────────────── */}
          <SectionCard stepNumber={3} title="Organization & Role" bgColor="bg-emerald-50" textColor="text-emerald-600">
            <div className="space-y-5">

              <InputField label="Organization" required icon={<MdBusiness size={16} />} error={errors.organization_id?.message}>
                <SelectInput
                  {...register("organization_id")}
                  placeholder={loadingDropdowns ? "Loading…" : "Select organization"}
                  options={orgOptions}
                  disabled={loadingDropdowns}
                />
              </InputField>

              <InputField label="Role" required icon={<MdSecurity size={16} />} error={errors.role_id?.message}>
                <SelectInput
                  {...register("role_id")}
                  placeholder={loadingDropdowns ? "Loading…" : "Select role"}
                  options={roleOptions}
                  disabled={loadingDropdowns}
                />
              </InputField>

            </div>
          </SectionCard>

          {/* ── Section 4: Features ──────────────────────────────── */}
          <SectionCard stepNumber={4} title="Features" bgColor="bg-orange-50" textColor="text-orange-600">
            <div className="space-y-4">

              {/* Add feature row — label shown above */}
              <p className="block text-xs font-extrabold uppercase tracking-wide opacity-90 flex items-center gap-1.5" style={{ color: 'inherit' }}>
                <MdStar size={14} className="opacity-60" /> Features
              </p>
              {/* Add feature row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Type a feature and press Enter or +"
                  className="flex-1 h-[42px] rounded-lg border px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.textColor,
                  }}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-3 py-2.5 rounded-lg text-white font-bold flex-shrink-0 hover:brightness-110 transition-all"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <MdAdd size={18} />
                </button>
              </div>

              {/* Feature list */}
              {features.length > 0 ? (
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 border"
                      style={{
                        borderColor: currentTheme.borderColor,
                        backgroundColor: currentTheme.background,
                      }}
                    >
                      <span className="text-sm font-medium" style={{ color: currentTheme.headingColor }}>
                        {f}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <MdClose size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-center py-4 opacity-50" style={{ color: currentTheme.textColor }}>
                  No features added yet. Type above and press + to add.
                </p>
              )}

            </div>
          </SectionCard>

        </div>

      </form>
    </div>
  );
}