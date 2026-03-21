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
  MdLocalOffer,
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

const formatDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// ─── Small helpers ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  const { currentTheme } = useTheme();
  return (
    <div className="flex items-start justify-between py-2.5 border-b last:border-0 border-dashed" style={{ borderColor: currentTheme.borderColor }}>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-60 w-36 flex-shrink-0" style={{ color: currentTheme.textColor }}>
        {label}
      </span>
      <span className="text-sm font-bold text-right" style={{ color: currentTheme.headingColor }}>
        {value || "—"}
      </span>
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
  const [activeTab, setActiveTab] = useState<"details" | "permissions">("details");
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
    <div className="max-w-[1600px] mx-auto min-h-screen pb-20">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between xl:mb-2">
        <Link
          href="/plans"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          style={{ color: currentTheme.textColor }}
        >
          <MdArrowBack size={20} />
          <span className="font-bold">Back to Plans</span>
        </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* LEFT COLUMN - Sticky Profile & Actions */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-6 space-y-6">
          <div
            className="rounded-2xl border shadow-sm overflow-hidden relative group"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.borderColor,
            }}
          >
            {/* Decorative Top Banner */}
            <div
              className="h-24 w-full relative"
              style={{ background: plan.is_active ? `linear-gradient(135deg, ${currentTheme.primary}40, ${currentTheme.primary}10)` : 'linear-gradient(135deg, #cbd5e140, #cbd5e110)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
            </div>

            <div className="px-6 pb-6 -mt-10 relative">
              {/* Icon / Avatar */}
              <div
                className="h-20 w-20 rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold uppercase overflow-hidden border-4 mb-4"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.cardBg,
                  color: plan.is_active ? currentTheme.primary : "#94a3b8",
                }}
              >
                <MdLocalOffer size={40} />
              </div>

              {/* Status Badges */}
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

              {/* Info */}
              <div className="mb-6">
                <h1
                  className="text-2xl font-bold leading-tight mb-2 break-words"
                  style={{ color: currentTheme.headingColor }}
                >
                  {plan.display_name}
                </h1>
                <div
                  className="flex items-center gap-1.5 text-sm opacity-80 mb-5"
                  style={{ color: currentTheme.textColor }}
                >
                  <MdBusiness size={14} />
                  <span className="truncate">{plan.organization?.name || "Global / System Plan"}</span>
                </div>
                
                {/* Price block */}
                <div className="p-4 rounded-xl border bg-black/5" style={{ borderColor: currentTheme.borderColor }}>
                  <div className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                    {plan.price > 0 && (
                      <span className="text-base text-gray-400 font-normal ml-1">
                        {BILLING_LABEL[plan.billing_cycle] ?? ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs capitalize font-medium opacity-60 mt-1" style={{ color: currentTheme.textColor }}>
                    Billed {plan.billing_cycle}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <PermissionGuard module="plan" action="edit">
                  <Link href={`/plans/edit/${plan.id}`} className="block">
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-black/5 flex items-center justify-center gap-2"
                      style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                    >
                      <MdEdit size={16} /> Edit Plan
                    </button>
                  </Link>
                </PermissionGuard>
                
                <PermissionGuard module="plan" action="delete">
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors hover:bg-rose-50 text-rose-600 border-rose-200"
                  >
                    <MdDelete size={16} /> Delete Plan
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Tabs & Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div
            className="rounded-2xl border shadow-sm p-6 space-y-6"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.borderColor,
            }}
          >
            {/* Header / Breadcrumbs Area */}
            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: currentTheme.borderColor }}
            >
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60"
                style={{ color: currentTheme.textColor }}
              >
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push("/plans")}
                >
                  Plans
                </span>
                <span>/</span>
                <span className="truncate max-w-[150px] sm:max-w-xs">{plan.display_name}</span>
                <span>/</span>
                <span className="text-blue-500">{activeTab}</span>
              </div>
            </div>

            {/* Secondary Navigation (Tabs) */}
            <div>
              <div
                className="flex items-center gap-1 border-b overflow-x-auto hide-scrollbar"
                style={{ borderColor: currentTheme.borderColor }}
              >
                {[
                  { id: "details", label: "Plan Details", icon: MdLocalOffer },
                  { id: "permissions", label: "Permissions Matrix", icon: MdSecurity },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`relative px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                      activeTab === item.id
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-100 hover:bg-black/5"
                    }`}
                    style={{
                      color:
                        activeTab === item.id
                          ? currentTheme.primary
                          : currentTheme.textColor,
                    }}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                    {activeTab === item.id && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: currentTheme.primary }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="animate-in fade-in zoom-in-95 duration-200 min-h-[500px]">
              {activeTab === "details" && (
                <div className="space-y-8">
                  {/* Descriptions */}
                  <div className="p-4 rounded-xl border bg-black/[0.02]" style={{ borderColor: currentTheme.borderColor }}>
                    <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                      <MdAttachMoney className="text-emerald-500" size={18} /> Plan Description
                    </h3>
                    <p className="leading-relaxed opacity-90 text-sm md:text-base" style={{ color: currentTheme.textColor }}>{plan.description || "No description provided."}</p>
                  </div>

                  {/* Grid for basics */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="rounded-xl border p-6 hover:shadow-md transition-shadow" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                      <h3 className="font-bold flex items-center gap-2 mb-5 text-base" style={{ color: currentTheme.headingColor }}>
                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500"><MdLocalOffer size={16} /></div>
                        Basic Information
                      </h3>
                      <div className="space-y-1">
                        <InfoRow label="Internal Name" value={plan.name} />
                        <InfoRow label="Created On" value={formatDate(plan.created_at)} />
                        <InfoRow label="Last Updated" value={formatDate(plan.updated_at)} />
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="rounded-xl border p-6 hover:shadow-md transition-shadow" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                      <h3 className="font-bold flex items-center gap-2 mb-5 text-base" style={{ color: currentTheme.headingColor }}>
                        <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500"><MdStar size={16} /></div>
                        Included Features
                      </h3>
                      {featureList.length > 0 ? (
                        <ul className="space-y-3">
                          {featureList.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-medium" style={{ color: currentTheme.textColor }}>
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MdCheck size={12} />
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm opacity-60 font-medium" style={{ color: currentTheme.textColor }}>No features listed for this plan.</span>
                      )}
                    </div>

                    {/* Organization card */}
                    {plan.organization && (
                      <div className="rounded-xl border p-6 hover:shadow-md transition-shadow" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                        <h3 className="font-bold flex items-center gap-2 mb-5 text-base" style={{ color: currentTheme.headingColor }}>
                          <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500"><MdBusiness size={16} /></div>
                          Organization Scope
                        </h3>
                        <div className="space-y-1">
                          <InfoRow label="Name" value={plan.organization?.name} />
                          <InfoRow label="Industry" value={plan.organization?.industry || "—"} />
                          <InfoRow label="Size" value={plan.organization?.size ?? "—"} />
                          <InfoRow label="Founded / Created" value={formatDate(plan.organization?.created_at)} />
                        </div>
                      </div>
                    )}

                    {/* Role card */}
                    <div className="rounded-xl border p-6 hover:shadow-md transition-shadow" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                      <h3 className="font-bold flex items-center gap-2 mb-5 text-base" style={{ color: currentTheme.headingColor }}>
                        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600"><MdPerson size={16} /></div>
                        Role Assignment
                      </h3>
                      <div className="space-y-1">
                        <InfoRow label="Role ID" value={plan.role?.Id} />
                        <InfoRow label="Role Name" value={plan.role?.Name} />
                        <InfoRow label="Permissions Title" value={plan.role?.role_title} />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === "permissions" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: currentTheme.headingColor }}>
                      <MdSecurity className="text-blue-500" />
                      Role Permissions Matrix
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                      Assigned Role: {plan.role?.Name || "None"}
                    </span>
                  </div>
                  
                  {Object.keys(permissionsMap).length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ borderColor: currentTheme.borderColor }}>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-black/[0.03]" style={{ borderColor: currentTheme.borderColor }}>
                            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: currentTheme.textColor }}>
                              Module
                            </th>
                            {ACTION_KEYS.map((a) => (
                              <th key={a} className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider opacity-60 capitalize" style={{ color: currentTheme.textColor }}>
                                {a}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(permissionsMap).map(([module, perms], index) => (
                            <tr key={module} className={`border-b last:border-0 hover:bg-black/5 transition-colors ${index % 2 === 0 ? "bg-transparent" : "bg-black/[0.01]"}`} style={{ borderColor: currentTheme.borderColor }}>
                              <td className="py-4 px-6">
                                <span className="text-sm font-bold capitalize" style={{ color: currentTheme.headingColor }}>
                                  {module.replace(/_/g, " ")}
                                </span>
                              </td>
                              {ACTION_KEYS.map((a) => (
                                <td key={a} className="py-4 px-4">
                                  <div className="flex justify-center">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-transform hover:scale-110 ${perms[a] ? "bg-emerald-100 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                                      {perms[a] ? <MdCheck size={16} /> : <MdClose size={16} />}
                                    </span>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
                       <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                         <MdSecurity size={24} />
                       </div>
                       <span className="opacity-60 font-medium" style={{ color: currentTheme.textColor }}>No permissions matrix found for this role.</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}