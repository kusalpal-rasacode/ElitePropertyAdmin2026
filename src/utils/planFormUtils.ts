import * as Yup from "yup";
import type { Plan, PlanFeatures } from "@/types/plans.types";

// ─── Constants ────────────────────────────────────────────────────────────────
export const PLAN_TYPES = ["basic", "pro", "professional"] as const;
export const BILLING_CYCLES = ["monthly", "yearly", "weekly"] as const;

export type PlanType = (typeof PLAN_TYPES)[number];
export type BillingCycle = (typeof BILLING_CYCLES)[number];

// ─── Form Values ──────────────────────────────────────────────────────────────
export interface PlanFormValues {
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: BillingCycle | "";
  plan_type: PlanType | "";
  role_id: number;
  organization_id: number;
  is_active: "true" | "false" | ""; 
  features: string[];               
}

// ─── API Payload (what we send on create / update) ───────────────────────────
export interface PlanApiPayload {
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: string;
  plan_type: string;
  role_id: number;
  organization_id: number;
  is_active: boolean;
  features: string[];
}

// ─── Normalize Plan → PlanFormValues (for edit pre-fill) ─────────────────────
export const normalizePlanToForm = (plan: Plan): PlanFormValues => {
  // features: PlanFeatures is a dict — flatten to string[] for the form chips
  let features: string[] = [];
  if (Array.isArray(plan.features)) {
    features = plan.features as string[];
  } else if (plan.features && typeof plan.features === "object") {
    features = Object.entries(plan.features as PlanFeatures).map(
      ([k, v]) => `${k}: ${v}`
    );
  }

  // billing_cycle / plan_type: API returns plain string — cast to our union if
  // it matches, otherwise fall back to "" so the placeholder shows.
  const billing_cycle = (BILLING_CYCLES as readonly string[]).includes(plan.billing_cycle)
    ? (plan.billing_cycle as BillingCycle)
    : ("" as const);

  const plan_type = (PLAN_TYPES as readonly string[]).includes(plan.plan_type)
    ? (plan.plan_type as PlanType)
    : ("" as const);

  return {
    name: plan.name ?? "",
    display_name: plan.display_name ?? "",
    description: plan.description ?? "",
    price: plan.price ?? 0,
    billing_cycle,
    plan_type,
    role_id: plan.role_id ?? 0,
    organization_id: plan.organization_id ?? 0,
    is_active: plan.is_active != null
      ? (String(plan.is_active) as "true" | "false")
      : "",
    features,
  };
};

// ─── Normalize PlanFormValues → API payload ───────────────────────────────────
export const normalizePlanToPayload = (data: PlanFormValues): PlanApiPayload => ({
  name: data.name,
  display_name: data.display_name,
  description: data.description,
  price: data.price,
  billing_cycle: data.billing_cycle,
  plan_type: data.plan_type,
  role_id: data.role_id,
  organization_id: data.organization_id,
  is_active: data.is_active === "true",
  features: data.features,
});

// ─── Default form state ───────────────────────────────────────────────────────
export const getInitialPlanFormData = (): PlanFormValues => ({
  name: "",
  display_name: "",
  description: "",
  price: 0,
  billing_cycle: "",
  plan_type: "",
  role_id: 0,
  organization_id: 0,
  is_active: "",
  features: [],
});

// ─── Yup Schema ───────────────────────────────────────────────────────────────
export const planSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[a-z0-9_]+$/, "Name must be lowercase letters, numbers, or underscores only")
    .min(2, "Name must be at least 2 characters"),

  display_name: Yup.string().optional(),

  description: Yup.string().optional(),

  price: Yup.number()
    .required("Price is required")
    .min(0, "Price cannot be negative")
    .typeError("Price must be a valid number"),

  billing_cycle: Yup.string()
    .required("Billing cycle is required")
    .oneOf([...BILLING_CYCLES], "Please select a billing cycle"),

  plan_type: Yup.string()
    .required("Plan type is required")
    .oneOf([...PLAN_TYPES], "Please select a plan type"),

  role_id: Yup.number()
    .required("Role is required")
    .min(1, "Please select a role")
    .typeError("Please select a role"),

  organization_id: Yup.number()
    .required("Organization is required")
    .min(1, "Please select an organization")
    .typeError("Please select an organization"),

  is_active: Yup.string()
    .optional()
    .oneOf(["true", "false", ""], "Please select a status"),

  features: Yup.array().of(Yup.string().required()).optional(),
});

// ─── Error helper ─────────────────────────────────────────────────────────────
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
    if (typeof err.error === "string") return err.error;
    if (typeof err.detail === "string") return err.detail;
    if (err.data && typeof err.data === "object") {
      const data = err.data as Record<string, unknown>;
      if (typeof data.message === "string") return data.message;
    }
  }
  return fallback;
};