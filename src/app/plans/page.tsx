"use client";

import React from "react";
import Link from "next/link";
import { MdSearch, MdAdd } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Pagination } from "@/components/common/Pagination";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePlans } from "@/hooks/usePlans";
import { PlanCard } from "@/components/plans/PlanCard";

function PlansContent() {
  const { currentTheme } = useTheme();
  const state = usePlans();

  return (
    <PermissionGuard module="plan" action="view">
      <div className="max-w-[1600px] mx-auto space-y-6 pb-20">

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>
              Plans
            </h1>
            <p className="text-sm font-medium mt-0.5" style={{ color: currentTheme.textColor }}>
              Manage subscription plans and pricing.
            </p>
          </div>
          <PermissionGuard module="plan" action="add">
            <Link href="/plans/add">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm hover:brightness-110 transition-all"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <MdAdd size={18} />
                Add Plan
              </button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={state.searchQuery}
              onChange={(e) => state.setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 bg-transparent"
              style={{
                borderColor: currentTheme.borderColor,
                color: currentTheme.headingColor,
                // @ts-ignore
                "--tw-ring-color": currentTheme.primary + "40",
              }}
            />
          </div>

          {/* <select
            value={state.filterType}
            onChange={(e) => state.setFilterType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 bg-transparent"
            style={{
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
              backgroundColor: currentTheme.cardBg,
            }}
          >
            <option value="all">All Types</option>
            <option value="FREE">Free</option>
            <option value="BASIC">Basic</option>
            <option value="PRO">Pro</option>
            <option value="PLUS">Plus</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            value={state.filterStatus}
            onChange={(e) => state.setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 bg-transparent"
            style={{
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
              backgroundColor: currentTheme.cardBg,
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select> */}

          

          {/* Limit selector */}
          <select
            value={state.limit}
            onChange={(e) => state.setLimit(Number(e.target.value))}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 bg-transparent"
            style={{
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
              backgroundColor: currentTheme.cardBg,
            }}
          >
            <option value={6}>6 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
            <option value={28}>48 / page</option>
          </select>

          <span className="text-sm font-medium ml-auto" style={{ color: currentTheme.textColor }}>
            {state.pagination.total} plan{state.pagination.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {state.loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : state.error ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-80">
              <div className="text-red-500 mb-2 font-bold text-lg">Network Error</div>
              <p className="text-sm" style={{ color: currentTheme.textColor }}>{state.error}</p>
              <button
                onClick={state.refetch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : state.plans.length > 0 ? (
            state.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={state.initiateDelete}
              />
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-50">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <MdSearch size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: currentTheme.headingColor }}>
                No Plans Found
              </h3>
              <p style={{ color: currentTheme.textColor }}>Try adjusting your search or filters.</p>
              <button
                onClick={state.resetFilters}
                className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination — same as rent page */}
        {state.plans.length > 0 && (
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      }
    >
      <PlansContent />
    </React.Suspense>
  );
}