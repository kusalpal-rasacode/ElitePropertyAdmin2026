"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MdSearch,
  MdAdd,
  MdFilterList,
  MdMoreVert,
  MdDeleteOutline,
  MdEdit,
  MdVisibility,
  MdCheck,
} from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Pagination } from "@/components/common/Pagination";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePlans } from "@/hooks/usePlans";
import type { Plan } from "@/types/plans.types";

const CYCLE_LABEL: Record<string, string> = {
  monthly: "/ mo",
  yearly: "/ yr",
  weekly: "/ wk",
};

// Theme-aware badge styles — work in both dark and light mode
const PLAN_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  professional: { bg: "rgba(147,51,234,0.12)",  text: "#a855f7", border: "rgba(147,51,234,0.25)" },
  pro:          { bg: "rgba(99,102,241,0.12)",   text: "#818cf8", border: "rgba(99,102,241,0.25)" },
  basic:        { bg: "rgba(59,130,246,0.12)",   text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  free:         { bg: "rgba(100,116,139,0.12)",  text: "#94a3b8", border: "rgba(100,116,139,0.25)" },
  enterprise:   { bg: "rgba(168,85,247,0.12)",   text: "#c084fc", border: "rgba(168,85,247,0.25)" },
};

const getPlanTypeStyle = (planType?: string) => {
  const key = planType?.toLowerCase() ?? "";
  return PLAN_TYPE_COLORS[key] ?? { bg: "rgba(107,114,128,0.1)", text: "#9ca3af", border: "rgba(107,114,128,0.2)" };
};

// ─── Per-row action menu (self-contained, ref-based) ──────────────────────────
function PlanActionMenu({
  plan,
  onDelete,
}: {
  plan: Plan;
  onDelete: (id: number) => void;
}) {
  const { currentTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-500/10 transition-colors"
        style={{ color: currentTheme.textColor }}
        title="Actions"
      >
        <MdMoreVert size={20} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl py-1 z-50"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.borderColor,
          }}
        >
          <Link
            href={`/plans/review/${plan.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-gray-500/5 transition-colors w-full"
            style={{ color: currentTheme.textColor }}
          >
            <MdVisibility size={16} />
            View Plan
          </Link>

          <Link
            href={`/plans/edit/${plan.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-gray-500/5 transition-colors w-full"
            style={{ color: currentTheme.textColor }}
          >
            <MdEdit size={16} />
            Edit Plan
          </Link>

          <div
            className="h-px mx-4 my-1"
            style={{ backgroundColor: currentTheme.borderColor }}
          />

          <button
            onClick={() => {
              setOpen(false);
              onDelete(plan.id);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50/20 transition-colors w-full"
          >
            <MdDeleteOutline size={16} />
            Delete Plan
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function PlansContent() {
  const { currentTheme } = useTheme();
  const state = usePlans();

  return (
    <PermissionGuard module="plan" action="view">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20">

        {/* Delete confirmation modal */}
        <ConfirmModal
          isOpen={!!state.deleteId}
          onClose={() => !state.isDeleteLoading && state.cancelDelete()}
          onConfirm={state.confirmDelete}
          title="Delete Plan"
          message="Are you sure you want to delete this plan? This action cannot be undone."
          confirmLabel="Delete Plan"
          isLoading={state.isDeleteLoading}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: currentTheme.headingColor }}
            >
              Plans Management
            </h1>
            <p className="text-sm font-medium mt-0.5" style={{ color: currentTheme.textColor }}>
              Manage subscription plans, pricing and features.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <MdSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: currentTheme.textColor }}
              />
              <input
                type="text"
                placeholder="Search plans..."
                value={state.searchQuery}
                onChange={(e) => state.setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-lg border text-sm font-medium outline-none focus:ring-2 w-60 transition-all bg-transparent"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                  // @ts-ignore
                  "--tw-ring-color": currentTheme.primary + "40",
                }}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={state.refetch}
              className="px-4 py-2.5 border rounded-lg font-bold text-sm flex items-center gap-2 transition-all hover:brightness-95"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.borderColor,
                color: currentTheme.headingColor,
              }}
            >
              <MdFilterList size={18} />
              Refresh
            </button>

            {/* Add Plan */}
            <PermissionGuard module="plan" action="add">
              <Link href="/plans/add">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <MdAdd size={18} />
                  Add Plan
                </button>
              </Link>
            </PermissionGuard>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border shadow-sm overflow-hidden backdrop-blur-md"
          style={{
            backgroundColor: currentTheme.cardBg + "E6",
            borderColor: currentTheme.borderColor,
          }}
        >
          <table className="w-full text-left">
            <thead
              className="border-b"
              style={{
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.borderColor,
              }}
            >
              <tr>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase"
                  style={{ color: currentTheme.textColor }}
                >
                  Plan Info
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase"
                  style={{ color: currentTheme.textColor }}
                >
                  Pricing
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase"
                  style={{ color: currentTheme.textColor }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase hidden sm:table-cell"
                  style={{ color: currentTheme.textColor }}
                >
                  Features
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-bold uppercase"
                  style={{ color: currentTheme.textColor }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {state.loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                      <span style={{ color: currentTheme.textColor }}>Loading plans...</span>
                    </div>
                  </td>
                </tr>
              ) : state.error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-red-500 font-bold mb-2">Failed to load plans</p>
                    <p className="text-sm mb-4" style={{ color: currentTheme.textColor }}>
                      {state.error}
                    </p>
                    <button
                      onClick={state.refetch}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : state.plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-50">
                      <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <MdSearch size={40} className="text-gray-400" />
                      </div>
                      <h3
                        className="font-bold text-lg mb-1"
                        style={{ color: currentTheme.headingColor }}
                      >
                        No Plans Found
                      </h3>
                      <p className="text-sm" style={{ color: currentTheme.textColor }}>
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.plans.map((plan) => {
                  const featureList = Array.isArray(plan.features)
                    ? plan.features
                    : Object.entries(plan.features).map(([k, v]) => `${k}: ${v}`);

                  return (
                    <tr
                      key={plan.id}
                      className="border-b last:border-0 hover:bg-gray-500/5 transition-colors"
                      style={{ borderColor: currentTheme.borderColor }}
                    >
                      {/* Plan Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <p
                            className="font-bold text-sm"
                            style={{ color: currentTheme.headingColor }}
                          >
                            {plan.display_name}
                          </p>
                          {(() => {
                            const s = getPlanTypeStyle(plan.plan_type);
                            return (
                              <span
                                className="inline-flex items-center w-max px-2.5 py-0.5 rounded-md text-[10px] font-bold border"
                                style={{
                                  backgroundColor: s.bg,
                                  color: s.text,
                                  borderColor: s.border,
                                }}
                              >
                                {plan.plan_type?.toUpperCase()}
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4">
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-sm font-bold"
                            style={{ color: currentTheme.headingColor }}
                          >
                            {plan.price === 0 ? "Free" : `$${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-xs" style={{ color: currentTheme.textColor }}>
                              {CYCLE_LABEL[plan.billing_cycle] ?? ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-bold border"
                          style={{
                            backgroundColor: plan.is_active
                              ? "rgba(16,185,129,0.12)"
                              : "rgba(100,116,139,0.10)",
                            color: plan.is_active ? "#10b981" : "#94a3b8",
                            borderColor: plan.is_active
                              ? "rgba(16,185,129,0.25)"
                              : "rgba(100,116,139,0.20)",
                          }}
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Features */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {featureList.length > 0 ? (
                          <ul className="space-y-1 max-w-[220px]">
                            {featureList.slice(0, 2).map((f, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-1.5 text-xs"
                                style={{ color: currentTheme.textColor }}
                              >
                                <MdCheck className="text-emerald-500 flex-shrink-0" size={12} />
                                <span className="truncate">{String(f)}</span>
                              </li>
                            ))}
                            {featureList.length > 2 && (
                              <li
                                className="text-[10px] opacity-60 pl-4"
                                style={{ color: currentTheme.textColor }}
                              >
                                +{featureList.length - 2} more
                              </li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-xs" style={{ color: currentTheme.textColor }}>
                            No features
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <PlanActionMenu plan={plan} onDelete={state.initiateDelete} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {state.plans.length > 0 && !state.loading && (
          <Pagination
            pagination={state.pagination}
            onPageChange={state.handleSetPage}
            entryLabel="plans"
          />
        )}

      </div>
    </PermissionGuard>
  );
}

export default function PlansPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <PlansContent />
    </React.Suspense>
  );
}