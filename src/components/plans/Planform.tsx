"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdAdd, MdClose, MdSave } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { showErrorToast } from "@/utils/toast";
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
  const router = useRouter();
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

  // When initialData arrives asynchronously (edit mode), call reset() so that
  // ALL fields — including <select> elements — re-render with the correct value.
  // setValue() alone does not update the browser's selected option for selects
  // that were already mounted with a different value.
  useEffect(() => {
    if (initialData) {
      reset({ ...getInitialPlanFormData(), ...initialData });
    }
  }, [initialData, reset]);

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

  // ── Features (array — managed via watch + setValue) ─────────────────────────
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

  // ── Style helpers ───────────────────────────────────────────────────────────
  const getInputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none focus:ring-2 text-sm${
      hasError ? " border-red-400 focus:ring-red-300" : ""
    }`;

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    borderColor: hasError ? undefined : currentTheme.borderColor,
    color: currentTheme.headingColor,
    ["--tw-ring-color" as string]:
      (hasError ? "#f87171" : currentTheme.primary) + "40",
  });

  const selectStyle = (hasError: boolean): React.CSSProperties => ({
    ...inputStyle(hasError),
    backgroundColor: currentTheme.cardBg,
  });

  const labelClass = "block text-sm font-bold mb-1.5";

  const ErrorMsg = ({ field }: { field: keyof PlanFormValues }) =>
    errors[field] ? (
      <p className="text-xs text-red-500 mt-1 font-medium">
        {errors[field]?.message as string}
      </p>
    ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push(backUrl)}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity font-bold text-sm"
        style={{ color: currentTheme.textColor }}
      >
        <MdArrowBack size={20} />
        Back to Plans
      </button>

      {/* Title */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: currentTheme.headingColor }}
        >
          {isEditMode ? "Edit Plan" : "Add New Plan"}
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: currentTheme.textColor }}>
          {isEditMode
            ? "Update the details below to modify this plan."
            : "Fill in the details below to create a new subscription plan."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(submitForm, onInvalid)}
        className="space-y-6"
        noValidate
      >
        <div
          className="rounded-xl border p-6 space-y-5"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.borderColor,
          }}
        >
          {/* Name + Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} style={{ color: currentTheme.textColor }}>
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="basic_plan"
                {...register("name")}
                className={getInputClass(!!errors.name)}
                style={inputStyle(!!errors.name)}
              />
              <ErrorMsg field="name" />
            </div>
            <div>
              <label className={labelClass} style={{ color: currentTheme.textColor }}>
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Basic Plan"
                {...register("display_name")}
                className={getInputClass(!!errors.display_name)}
                style={inputStyle(!!errors.display_name)}
              />
              <ErrorMsg field="display_name" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              Description
            </label>
            <input
              type="text"
              placeholder="Perfect for getting started"
              {...register("description")}
              className={getInputClass(false)}
              style={inputStyle(false)}
            />
          </div>

          {/* Price + Billing Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} style={{ color: currentTheme.textColor }}>
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="9.99"
                {...register("price", { valueAsNumber: true })}
                className={getInputClass(!!errors.price)}
                style={inputStyle(!!errors.price)}
              />
              <ErrorMsg field="price" />
            </div>
            <div>
              <label className={labelClass} style={{ color: currentTheme.textColor }}>
                Billing Cycle <span className="text-red-400">*</span>
              </label>
              <select
                {...register("billing_cycle")}
                className={getInputClass(!!errors.billing_cycle)}
                style={selectStyle(!!errors.billing_cycle)}
              >
                <option value="" disabled>Select billing cycle</option>
                {BILLING_CYCLES.map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </option>
                ))}
              </select>
              <ErrorMsg field="billing_cycle" />
            </div>
          </div>

          {/* Plan Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} style={{ color: currentTheme.textColor }}>
                Plan Type <span className="text-red-400">*</span>
              </label>
              <select
                {...register("plan_type")}
                className={getInputClass(!!errors.plan_type)}
                style={selectStyle(!!errors.plan_type)}
              >
                <option value="" disabled>Select plan type</option>
                {PLAN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <ErrorMsg field="plan_type" />
            </div>
            <div>
              <label className={labelClass} style={{ color: currentTheme.textColor }}>
                Status <span className="text-red-400">*</span>
              </label>
              <select
                {...register("is_active")}
                className={getInputClass(!!errors.is_active)}
                style={selectStyle(!!errors.is_active)}
              >
                <option value="" disabled>Select status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <ErrorMsg field="is_active" />
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              Organization <span className="text-red-400">*</span>
            </label>
            <select
              {...register("organization_id", { valueAsNumber: true })}
              disabled={loadingDropdowns}
              className={getInputClass(!!errors.organization_id)}
              style={selectStyle(!!errors.organization_id)}
            >
              <option value={0} disabled>
                {loadingDropdowns ? "Loading…" : "Select organization"}
              </option>
              {!loadingDropdowns && organizations.length === 0 && (
                <option value={0} disabled>No organizations found</option>
              )}
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <ErrorMsg field="organization_id" />
          </div>

          {/* Role */}
          <div>
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              Role <span className="text-red-400">*</span>
            </label>
            <select
              {...register("role_id", { valueAsNumber: true })}
              disabled={loadingDropdowns}
              className={getInputClass(!!errors.role_id)}
              style={selectStyle(!!errors.role_id)}
            >
              <option value={0} disabled>
                {loadingDropdowns ? "Loading…" : "Select role"}
              </option>
              {!loadingDropdowns && roles.length === 0 && (
                <option value={0} disabled>No roles found</option>
              )}
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_title || role.role || role.name}
                </option>
              ))}
            </select>
            <ErrorMsg field="role_id" />
          </div>

          {/* Features */}
          <div>
            <label className={labelClass} style={{ color: currentTheme.textColor }}>
              Features
            </label>
            <div className="flex gap-2 mb-2">
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
                placeholder="Add a feature and press Enter"
                className={getInputClass(false)}
                style={inputStyle(false)}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-2.5 rounded-lg text-white text-sm font-bold flex-shrink-0 hover:brightness-110 transition-all"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <MdAdd size={18} />
              </button>
            </div>
            {features.length > 0 && (
              <ul className="space-y-1.5">
                {features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 border"
                    style={{
                      borderColor: currentTheme.borderColor,
                      backgroundColor: currentTheme.cardBg ?? "#f9fafb",
                    }}
                  >
                    <span className="text-sm" style={{ color: currentTheme.textColor }}>
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
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push(backUrl)}
            className="px-5 py-2.5 rounded-lg border font-bold text-sm transition-colors hover:bg-black/5"
            style={{
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading || loadingDropdowns}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <MdSave size={16} />
            {isSubmitting || loading
              ? isEditMode ? "Updating…" : "Creating…"
              : isEditMode ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}