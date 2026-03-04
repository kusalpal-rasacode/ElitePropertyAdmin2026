import {
  PropertiesPayload,
  PropertiesResponse,
  PropertyData,
} from "../types/properties.types";
import { api, privetApi } from "./axios";

// Add Property
export const propertiesService = async (formData: FormData) => {
  try {
    const { data } = await privetApi.post("/properties", formData);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// GET ALL (WITH PAGINATION + SEARCH)
export const getProperties = async (
  params?: PropertiesPayload,
): Promise<PropertiesResponse> => {
  try {
    const response = await privetApi.get<PropertiesResponse>("/properties", {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// GET PENDING PROPERTIES
export const getPendingProperties = async (
  params?: PropertiesPayload,
): Promise<PropertiesResponse> => {
  try {
    const response = await privetApi.get<PropertiesResponse>(
      "/properties/pending",
      {
        params,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// GET PENDING PROPERTY BY ID
export const getPendingPropertyByIdService = async (
  id: number | string,
): Promise<PropertyData | null> => {
  try {
    const response = await privetApi.get<any>(`/properties/pending/${id}`);

    const rawBody = response.data;

    // Standardize response handling same as active properties
    if (rawBody && typeof rawBody === "object" && "data" in rawBody) {
      const innerData = rawBody.data;
      if (Array.isArray(innerData)) {
        return innerData.length > 0 ? innerData[0] : null;
      }
      return innerData;
    }
    if (Array.isArray(rawBody)) {
      return rawBody.length > 0 ? rawBody[0] : null;
    }
    return rawBody as PropertyData;
  } catch (error: any) {
    console.error("[Service Error Pending]", error);
    throw error.response?.data || error;
  }
};

// GET BY ID
export const getPropertyByIdService = async (
  id: number | string,
): Promise<PropertyData | null> => {
  try {
    // console.log(`[Service] Fetching property details for ID: ${id}`);
    const response = await privetApi.get<any>(`/properties/${id}`);
    // console.log("[Service] Raw API Response:", response);

    const rawBody = response.data;

    // Scenario 1: Response has a 'data' field (Standard Wrapper)
    if (rawBody && typeof rawBody === "object" && "data" in rawBody) {
      const innerData = rawBody.data;

      // Case 1a: innerData is an array (e.g. [ { property } ])
      if (Array.isArray(innerData)) {
        return innerData.length > 0 ? innerData[0] : null;
      }

      // Case 1b: innerData is the object itself
      return innerData;
    }

    // Scenario 2: Response IS the array (e.g. [ { property } ])
    if (Array.isArray(rawBody)) {
      return rawBody.length > 0 ? rawBody[0] : null;
    }

    // Scenario 3: Response IS the object directly
    return rawBody as PropertyData;
  } catch (error: any) {
    console.error("[Service Error]", error);
    throw error.response?.data || error;
  }
};

// UPDATE PROPERTY
export const putPropertyByIdService = async (
  id: string | number,
  formData: FormData,
) => {
  try {
    const { data } = await privetApi.put(`/properties/pending/${id}`, formData);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// DELETE PROPERTY - Fixed to use privetApi consistently
export const deletePropertyByIdService = async (id: string) => {
  try {
    const { data } = await privetApi.delete(`/properties/${id}`);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
// APPROVE PROPERTY
export const approveProperty = async (id: string | number) => {
  try {
    console.log(`[Service] Approving property ID: ${id}`);
    const { data } = await privetApi.post(`/properties/pending/${id}/approve`, {});
    return data;
  } catch (error: any) {
    console.error("[Service Error] Approve failed:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// REJECT PROPERTY
export const rejectProperty = async (id: string | number, rejection_reason?: string) => {
  try {
    console.log(`[Service] Rejecting property ID: ${id}`);
    const payload = rejection_reason ? { rejection_reason } : {};
    const { data } = await privetApi.post(`/properties/pending/${id}/reject`, payload);
    return data;
  } catch (error: any) {
    console.error("[Service Error] Reject failed:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const activeProperty = async (id: string | number) => {
  try {
    console.log(`[Service] Activate property ID: ${id}`);
    const { data } = await privetApi.post(`/properties/${id}/activate`, {});
    return data;
  } catch (error: any) {
    console.error("[Service Error] Reject failed:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deactiveProperty = async (id: string | number) => {
  try {
    console.log(`[Service] Deactivate property ID: ${id}`);
    const { data } = await privetApi.post(`/properties/${id}/deactivate`, {});
    return data;
  } catch (error: any) {
    console.error("[Service Error] Reject failed:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};