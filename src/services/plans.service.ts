import { privetApi } from "@/services/axios";
import type { Plan, CreatePlanPayload, UpdatePlanPayload, PaginatedPlansResponse } from "@/types/plans.types";

export interface GetPlansParams {
  page?: number;
  limit?: number;
  search?: string;
  plan_type?: string;
  is_active?: boolean;
}

// GET /plans  — all plans with pagination + server-side search/filter
export const getAllPlansService = async (params: GetPlansParams = {}): Promise<PaginatedPlansResponse> => {
  const { page = 1, limit = 6, search, plan_type, is_active } = params;

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));
  if (search)     query.set("search", search);
  if (plan_type)  query.set("plan_type", plan_type);
  if (is_active !== undefined) query.set("is_active", String(is_active));

  const res = await privetApi.get(`/plans?${query.toString()}`);
  const body = res.data;
  return {
    is_success: body?.is_success ?? true,
    message: body?.message ?? "",
    data: Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [],
    pagination: body?.pagination ?? { total: 0, page: 1, limit, totalPages: 1 },
  };
};

// GET /plans/active  — public, no auth needed
export const getActivePlansService = async (): Promise<Plan[]> => {
  const res = await privetApi.get("/plans/active");
  const body = res.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

// GET /plans/:id
export const getPlanByIdService = async (id: number | string): Promise<Plan> => {
  const res = await privetApi.get(`/plans/${id}`);
  const body = res.data;
  return body?.data ?? body;
};

// POST /plans  — Super Admin only
export const createPlanService = async (payload: CreatePlanPayload): Promise<{ message: string; data: Plan }> => {
  const res = await privetApi.post("/plans", payload);
  return res.data;
};

// PUT /plans/:id  — Super Admin only
export const updatePlanService = async (id: number | string, payload: UpdatePlanPayload): Promise<{ message: string; data: Plan }> => {
  const res = await privetApi.put(`/plans/${id}`, payload);
  return res.data;
};

// DELETE /plans/:id  — Super Admin only
export const deletePlanService = async (id: number | string): Promise<void> => {
  await privetApi.delete(`/plans/${id}`);
};