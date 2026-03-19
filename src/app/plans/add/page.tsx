"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdAdd, MdClose } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { createPlanService } from "@/services/plans.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

export default function AddPlanPage() {
  return (
    <PermissionGuard module="plan" action="add">
      <AddPlanContent />
    </PermissionGuard>
  );
}

function AddPlanContent() {
  const { currentTheme } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    display_name: "",
    description: "",
    price: 0,
    billing_cycle: "monthly",
    plan_type: "BASIC",
    role_id: 1,
    organization_id: 1,
    is_active: true,
    features: [] as string[],
  });
  const [featureInput, setFeatureInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    set("features", [...form.features, v]);
    setFeatureInput("");
  };

  const removeFeature = (i: number) =>
    set("features", form.features.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createPlanService(form);
      showSuccessToast(res?.message || "Plan created successfully.");
      router.replace("/plans");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create plan.");
      setError(msg);
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none focus:ring-2 text-sm";
  const inputStyle = {
    borderColor: currentTheme.borderColor,
    color: currentTheme.headingColor,
    // @ts-ignore
    "--tw-ring-color": currentTheme.primary + "40",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back */}
      <button
        onClick={() => router.push("/plans")}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity font-bold text-sm"
        style={{ color: currentTheme.textColor }}
      >
        <MdArrowBack size={20} />
        Back to Plans
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>
          Add New Plan
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: currentTheme.textColor }}>
          Fill in the details below to create a new subscription plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-xl border p-6 space-y-5"
          style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}
        >
          {/* Name + Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="basic_plan"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => set("display_name", e.target.value)}
                required
                placeholder="Basic Plan"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Perfect for getting started"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Price + Billing Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                min={0}
                step={0.01}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                required
                placeholder="9.99"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Billing Cycle
              </label>
              <select
                value={form.billing_cycle}
                onChange={(e) => set("billing_cycle", e.target.value)}
                className={inputClass}
                style={{ ...inputStyle, backgroundColor: currentTheme.cardBg }}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Plan Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Plan Type
              </label>
              <select
                value={form.plan_type}
                onChange={(e) => set("plan_type", e.target.value)}
                className={inputClass}
                style={{ ...inputStyle, backgroundColor: currentTheme.cardBg }}
              >
                <option value="FREE">Free</option>
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Status
              </label>
              <select
                value={form.is_active ? "true" : "false"}
                onChange={(e) => set("is_active", e.target.value === "true")}
                className={inputClass}
                style={{ ...inputStyle, backgroundColor: currentTheme.cardBg }}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Role ID + Org ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Role ID
              </label>
              <input
                type="number"
                value={form.role_id}
                min={1}
                onChange={(e) => set("role_id", parseInt(e.target.value) || 1)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
                Organization ID
              </label>
              <input
                type="number"
                value={form.organization_id}
                min={1}
                onChange={(e) => set("organization_id", parseInt(e.target.value) || 1)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: currentTheme.textColor }}>
              Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="Add a feature and press Enter"
                className={inputClass}
                style={inputStyle}
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
            {form.features.length > 0 && (
              <ul className="space-y-1.5">
                {form.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 border"
                    style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg ?? "#f9fafb" }}
                  >
                    <span className="text-sm" style={{ color: currentTheme.textColor }}>{f}</span>
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

        {/* Error */}
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push("/plans")}
            className="px-5 py-2.5 rounded-lg border font-bold text-sm transition-colors hover:bg-black/5"
            style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {submitting ? "Creating…" : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}