"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdCheck,
  MdClose,
  MdBusiness,
  MdPerson,
  MdSecurity,
  MdStar,
  MdCalendarToday,
  MdAttachMoney,
} from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPlanByIdService, deletePlanService } from "@/services/plans.service";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import type { Plan, PlanPermission } from "@/types/plans.types";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

const ACTION_KEYS: (keyof PlanPermission)[] = ["view", "add", "edit", "delete"];

const BILLING_LABEL: Record<string, string> = {
  monthly: "/ mo",
  yearly: "/ yr",
  weekly: "/ wk",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// ─── Small helpers ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  const { currentTheme } = useTheme();
  return (
    <div className="flex items-start justify-between py-2.5 border-b last:border-0" style={{ borderColor: currentTheme.borderColor }}>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-60 w-36 flex-shrink-0" style={{ color: currentTheme.textColor }}>
        {label}
      </span>
      <span className="text-sm font-bold text-right" style={{ color: currentTheme.headingColor }}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const { currentTheme } = useTheme();
  return (
    <div className="rounded-3xl border shadow-sm transition-all hover:shadow-md overflow-hidden"
      style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="p-6">
        <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">{icon}</div>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PlanDetailPage() {
  return (
    <PermissionGuard module="plan" action="view">
      <PlanDetailContent />
    </PermissionGuard>
  );
}

function PlanDetailContent() {
  const { currentTheme } = useTheme();
  const params = useParams();
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const rawId = params.id;
    const planId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!planId) return;
    if (fetchedIdRef.current === planId) return;
    fetchedIdRef.current = planId;

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const data = await getPlanByIdService(planId);
        setPlan(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load plan details"));
        fetchedIdRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [params.id]);

  const handleDelete = async () => {
    if (!plan) return;
    setDeleteLoading(true);
    try {
      await deletePlanService(plan.id);
      showSuccessToast("Plan deleted successfully.");
      router.push("/plans");
    } catch (err: unknown) {
      showErrorToast(getErrorMessage(err, "Failed to delete plan."));
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-red-500 text-xl font-bold">{error || "Plan not found"}</div>
        <Link href="/plans">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Back to Plans
          </button>
        </Link>
      </div>
    );
  }

  const permissionsMap = plan.role?.permissions?.[0]?.permissions ?? {};
  const featureList = Array.isArray(plan.features)
    ? plan.features.map(String)
    : Object.entries(plan.features).map(([k, v]) => `${k}: ${v}`);

  return (
    <div className="mx-auto space-y-8 pb-20">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/plans"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          style={{ color: currentTheme.textColor }}
        >
          <MdArrowBack size={20} />
          <span className="font-bold">Back to Plans</span>
        </Link>

        <div className="flex gap-3">
          <PermissionGuard module="plan" action="edit">
            <Link href={`/plans/edit/${plan.id}`}>
              <button
                className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition-colors hover:bg-blue-50 text-blue-600 border-blue-200"
              >
                <MdEdit size={18} />
                Edit Plan
              </button>
            </Link>
          </PermissionGuard>
          <PermissionGuard module="plan" action="delete">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition-colors hover:bg-rose-50 text-rose-600 border-rose-200"
            >
              <MdClose size={18} />
              Delete Plan
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── Delete modal ── */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        confirmLabel="Delete Plan"
        isLoading={deleteLoading}
        confirmButtonColor="#ef4444"
      />

      {/* ── Hero ── */}
      <div
        className="rounded-3xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: plan.is_active
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : "linear-gradient(90deg, #9ca3af, #d1d5db)",
          }}
        />
        <div className="p-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider"
                style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor, backgroundColor: currentTheme.cardBg ?? "#f1f5f9" }}
              >
                {plan.plan_type}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${plan.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {plan.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-xs font-mono opacity-40 ml-1" style={{ color: currentTheme.textColor }}>
                ID #{plan.id}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2" style={{ color: currentTheme.headingColor }}>
              {plan.display_name}
            </h1>
            <p className="text-base leading-relaxed opacity-80" style={{ color: currentTheme.textColor }}>
              {plan.description}
            </p>
            <p className="text-xs font-mono opacity-40 mt-2" style={{ color: currentTheme.textColor }}>
              {plan.name}
            </p>
          </div>

          {/* Right — price */}
          <div className="flex-shrink-0 text-right">
            <div className="text-4xl font-bold" style={{ color: currentTheme.primary }}>
              {plan.price === 0 ? "Free" : `$${plan.price}`}
              {plan.price > 0 && (
                <span className="text-lg text-gray-400 font-normal ml-1">
                  {BILLING_LABEL[plan.billing_cycle] ?? ""}
                </span>
              )}
            </div>
            <p className="text-sm capitalize opacity-60 mt-1" style={{ color: currentTheme.textColor }}>
              Billed {plan.billing_cycle}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left col — details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Plan Info */}
          <SectionCard title="Plan Info" icon={<MdAttachMoney size={20} />}>
            <InfoRow label="Name" value={plan.name} />
            <InfoRow label="Display Name" value={plan.display_name} />
            <InfoRow label="Plan Type" value={plan.plan_type} />
            <InfoRow label="Billing Cycle" value={<span className="capitalize">{plan.billing_cycle}</span>} />
            <InfoRow label="Price" value={plan.price === 0 ? "Free" : `$${plan.price}`} />
            <InfoRow label="Created" value={formatDate(plan.created_at)} />
            <InfoRow label="Updated" value={formatDate(plan.updated_at)} />
          </SectionCard>

          {/* Permissions matrix */}
          {Object.keys(permissionsMap).length > 0 && (
            <SectionCard title="Role Permissions" icon={<MdSecurity size={20} />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-2 pr-6 text-xs font-bold uppercase tracking-wider opacity-50 w-40" style={{ color: currentTheme.textColor }}>
                        Module
                      </th>
                      {ACTION_KEYS.map((a) => (
                        <th key={a} className="text-center py-2 px-4 text-xs font-bold uppercase tracking-wider opacity-50 capitalize" style={{ color: currentTheme.textColor }}>
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(permissionsMap).map(([module, perms]) => (
                      <tr key={module} className="border-t hover:bg-black/5 transition-colors" style={{ borderColor: currentTheme.borderColor }}>
                        <td className="py-3 pr-6">
                          <span className="text-sm font-bold capitalize" style={{ color: currentTheme.headingColor }}>
                            {module.replace(/_/g, " ")}
                          </span>
                        </td>
                        {ACTION_KEYS.map((a) => (
                          <td key={a} className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${perms[a] ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-300"}`}>
                              {perms[a] ? <MdCheck size={13} /> : <MdClose size={13} />}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right col — sticky sidebar */}
        <div className="space-y-6 self-start" style={{ position: "sticky", top: "1.5rem" }}>

          {/* Role card */}
          <div
            className="p-6 rounded-2xl border shadow-sm space-y-4"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
          >
            <h3 className="font-bold flex items-center gap-2 text-base" style={{ color: currentTheme.headingColor }}>
              <MdPerson size={20} className="text-blue-500" />
              Role
            </h3>
            <div className="space-y-1">
              <InfoRow label="ID" value={plan.role?.Id} />
              <InfoRow label="Name" value={plan.role?.Name} />
              <InfoRow label="Title" value={plan.role?.role_title} />
            </div>
          </div>

          {/* Organization card */}
          <div
            className="p-6 rounded-2xl border shadow-sm space-y-4"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
          >
            <h3 className="font-bold flex items-center gap-2 text-base" style={{ color: currentTheme.headingColor }}>
              <MdBusiness size={20} className="text-violet-500" />
              Organization
            </h3>
            <div className="space-y-1">
              <InfoRow label="Name" value={plan.organization?.name} />
              <InfoRow label="Industry" value={plan.organization?.industry} />
              <InfoRow label="Size" value={plan.organization?.size ?? "—"} />
              <InfoRow label="Created" value={formatDate(plan.organization?.created_at)} />
            </div>
          </div>

          {/* Features card */}
          {featureList.length > 0 && (
            <div
              className="p-6 rounded-2xl border shadow-sm space-y-4"
              style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
            >
              <h3 className="font-bold flex items-center gap-2 text-base" style={{ color: currentTheme.headingColor }}>
                <MdStar size={20} className="text-amber-500" />
                Features
              </h3>
              <ul className="space-y-2.5">
                {featureList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: currentTheme.textColor }}>
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MdCheck size={12} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}