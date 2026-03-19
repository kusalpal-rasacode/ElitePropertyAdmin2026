"use client";

import React from "react";
import Link from "next/link";
import { MdEdit, MdDelete, MdVisibility, MdCheck, MdClose } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import type { Plan } from "@/types/plans.types";

const TYPE_ACCENT: Record<string, string> = {
  FREE: "bg-slate-400",
  BASIC: "bg-blue-500",
  PRO: "bg-violet-500",
  ENTERPRISE: "bg-amber-500",
};

const CYCLE_LABEL: Record<string, string> = {
  monthly: "/ mo",
  yearly: "/ yr",
  weekly: "/ wk",
};

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: number) => void;
}

export function PlanCard({ plan, onDelete }: PlanCardProps) {
  const { currentTheme } = useTheme();
  const accent = TYPE_ACCENT[plan.plan_type.toUpperCase()] ?? "bg-gray-400";
  const featureList = Array.isArray(plan.features) ? plan.features : Object.entries(plan.features).map(([k, v]) => `${k}: ${v}`);

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
      style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
    >
      {/* Accent bar */}
      <div className={`h-1 w-full ${accent}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide"
            style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor, backgroundColor: currentTheme.cardBg ?? "#f1f5f9" }}
          >
            {plan.plan_type}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              plan.is_active
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
          >
            {plan.is_active ? "Active" : "Inactive"}
          </span>
          <span className="ml-auto text-[11px] font-mono opacity-40" style={{ color: currentTheme.textColor }}>
            #{plan.id}
          </span>
        </div>

        {/* Title + price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold leading-tight" style={{ color: currentTheme.headingColor }}>
            {plan.display_name}
          </h3>
          <div className="flex items-baseline gap-0.5 flex-shrink-0">
            <span className="text-lg font-bold" style={{ color: currentTheme.headingColor }}>
              {plan.price === 0 ? "Free" : `$${plan.price}`}
            </span>
            {plan.price > 0 && (
              <span className="text-xs" style={{ color: currentTheme.textColor }}>
                {CYCLE_LABEL[plan.billing_cycle] ?? ""}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm mb-4 leading-relaxed opacity-70" style={{ color: currentTheme.textColor }}>
          {plan.description}
        </p>

        {/* Features preview */}
        {featureList.length > 0 && (
          <ul className="space-y-1.5 mb-5 flex-1">
            {featureList.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs" style={{ color: currentTheme.textColor }}>
                <MdCheck className="text-emerald-500 flex-shrink-0" size={14} />
                {String(f)}
              </li>
            ))}
            {featureList.length > 3 && (
              <li className="text-xs opacity-50 pl-5" style={{ color: currentTheme.textColor }}>
                +{featureList.length - 3} more
              </li>
            )}
          </ul>
        )}

        {/* Actions */}
        <div
  className="flex items-center gap-2 pt-4 border-t mt-auto"
  style={{ borderColor: currentTheme.borderColor }}
>
  <Link
    href={`/plans/review/${plan.id}`}
    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-gray-50"
    style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
  >
    <MdVisibility size={14} /> View
  </Link>

  <Link
    href={`/plans/edit/${plan.id}`}
    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-blue-50 text-blue-600 border-blue-200"
  >
    <MdEdit size={14} /> Edit
  </Link>

  <button
    onClick={() => onDelete(plan.id)}
    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-red-50 text-red-500 border-red-200"
  >
    <MdDelete size={14} /> Delete
  </button>
</div>
      </div>
    </div>
  );
}