import { privetApi } from "./axios";

export interface RentalQueryParams {
  status?: "pending" | "active" | "inactive" | "expired" | "cancelled" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
}

export interface RentalListResponse {
  is_success?: boolean;
  message?: string;
  data: Record<string, unknown>[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const getErrorPayload = (error: unknown): unknown => {
  const payload = asRecord(error);
  const response = asRecord(payload.response);
  return response.data ?? error;
};

const inFlightGetRequests = new Map<string, Promise<unknown>>();
const recentGetCache = new Map<string, { timestamp: number; value: unknown }>();
const BURST_CACHE_MS = 500;

const dedupeGet = async <T>(key: string, request: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const cached = recentGetCache.get(key);
  if (cached && now - cached.timestamp < BURST_CACHE_MS) {
    return cached.value as T;
  }

  const existing = inFlightGetRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const pending = request()
    .then((result) => {
      recentGetCache.set(key, { timestamp: Date.now(), value: result });
      return result;
    })
    .finally(() => {
      inFlightGetRequests.delete(key);
    });

  inFlightGetRequests.set(key, pending);
  return pending;
};

const buildUrlWithQuery = (
  path: string,
  params?: RentalQueryParams,
): string => {
  if (!params) return path;
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (typeof params.page === "number") query.set("page", String(params.page));
  if (typeof params.limit === "number") query.set("limit", String(params.limit));
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
};

const normalizeListResponse = (raw: unknown): RentalListResponse => {
  const rawObj = asRecord(raw);
  const rawData = rawObj.data;
  if (Array.isArray(rawData)) {
    return {
      is_success: Boolean(rawObj.is_success),
      message: typeof rawObj.message === "string" ? rawObj.message : undefined,
      data: rawData as Record<string, unknown>[],
      pagination: rawObj.pagination as RentalListResponse["pagination"],
    };
  }

  if (Array.isArray(raw)) {
    return {
      is_success: true,
      message: "Success",
      data: raw as Record<string, unknown>[],
    };
  }

  return {
    is_success: Boolean(rawObj.is_success),
    message: typeof rawObj.message === "string" ? rawObj.message : undefined,
    data: rawData ? [rawData as Record<string, unknown>] : [],
    pagination: rawObj.pagination as RentalListResponse["pagination"],
  };
};

export const getRentals = async (
  params?: RentalQueryParams,
): Promise<RentalListResponse> => {
  try {
    const queryKey = JSON.stringify(params ?? {});
    const url = buildUrlWithQuery("/rentals", params);
    const response = await dedupeGet(`rentals:${queryKey}`, () =>
      privetApi.get(url),
    );
    return normalizeListResponse(response.data);
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getMyRentals = async (
  params?: RentalQueryParams,
): Promise<RentalListResponse> => {
  try {
    const queryKey = JSON.stringify(params ?? {});
    const url = buildUrlWithQuery("/rentals/my-rentals", params);
    const response = await dedupeGet(`my-rentals:${queryKey}`, () =>
      privetApi.get(url),
    );
    return normalizeListResponse(response.data);
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getMyPendingRentals = async (
  params?: RentalQueryParams,
): Promise<RentalListResponse> => {
  try {
    const queryKey = JSON.stringify(params ?? {});
    const url = buildUrlWithQuery("/rentals/my-pending", params);
    const response = await dedupeGet(`my-pending-rentals:${queryKey}`, () =>
      privetApi.get(url),
    );
    return normalizeListResponse(response.data);
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getPendingRentals = async (
  params?: RentalQueryParams,
): Promise<RentalListResponse> => {
  try {
    const queryKey = JSON.stringify(params ?? {});
    const url = buildUrlWithQuery("/rentals/pending", params);
    const response = await dedupeGet(`pending-rentals:${queryKey}`, () =>
      privetApi.get(url),
    );
    return normalizeListResponse(response.data);
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getRentalByIdService = async (id: string | number): Promise<Record<string, unknown> | null> => {
  try {
    const response = await privetApi.get(`/rentals/${id}`);
    const raw = asRecord(response.data);
    if ("data" in raw) {
      const inner = raw.data;
      return (inner as Record<string, unknown>) || null;
    }
    return raw;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getPendingRentalByIdService = async (
  id: string | number,
): Promise<Record<string, unknown> | null> => {
  try {
    const response = await privetApi.get(`/rentals/pending/${id}`);
    const raw = asRecord(response.data);
    if ("data" in raw) {
      const inner = raw.data;
      return (inner as Record<string, unknown>) || null;
    }
    return raw;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const createRentalService = async (formData: FormData) => {
  try {
    const { data } = await privetApi.post("/rentals", formData);
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const updateRentalService = async (id: string | number, formData: FormData) => {
  try {
    const { data } = await privetApi.put(`/rentals/${id}`, formData);
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const updatePendingRentalService = async (id: string | number, formData: FormData) => {
  try {
    const { data } = await privetApi.put(`/rentals/pending/${id}`, formData);
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const deleteRentalService = async (id: string | number) => {
  try {
    const { data } = await privetApi.delete(`/rentals/${id}`);
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const activateRentalService = async (id: string | number) => {
  try {
    const { data } = await privetApi.post(`/rentals/${id}/activate`, {});
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const deactivateRentalService = async (id: string | number) => {
  try {
    const { data } = await privetApi.post(`/rentals/${id}/deactivate`, {});
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const approveRentalService = async (id: string | number) => {
  try {
    const { data } = await privetApi.post(`/rentals/pending/${id}/approve`, {});
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const rejectRentalService = async (
  id: string | number,
  rejection_reason?: string,
) => {
  try {
    const payload = rejection_reason ? { rejection_reason } : {};
    const { data } = await privetApi.post(`/rentals/pending/${id}/reject`, payload);
    return data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};