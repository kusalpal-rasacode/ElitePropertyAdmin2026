import { CampaignsPayload, CampaignsResponse, CampaignData } from "../types/campaigns.types";
import { privetApi } from "./axios";

const findCampaignArray = (input: any, depth = 0): CampaignData[] | null => {
    if (depth > 4 || input == null) return null;

    if (Array.isArray(input)) {
        if (input.length === 0) return input as CampaignData[];
        if (input.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
            return input as CampaignData[];
        }
        return null;
    }

    if (typeof input !== "object") return null;

    const priorityKeys = ["data", "campaigns", "items", "results", "rows", "records"];
    for (const key of priorityKeys) {
        if (key in input) {
            const found = findCampaignArray(input[key], depth + 1);
            if (found) return found;
        }
    }

    for (const value of Object.values(input)) {
        const found = findCampaignArray(value, depth + 1);
        if (found) return found;
    }

    return null;
};

// GET ALL CAMPAIGNS
export const getCampaignsService = async (
    params?: CampaignsPayload
): Promise<CampaignsResponse> => {
    try {
        const { data } = await privetApi.get<any>("/Campaign", {
            params,
        });
        const normalizedData = findCampaignArray(data) ?? [];

        return {
            is_success: data?.is_success ?? data?.success ?? true,
            message: data?.message ?? "",
            data: normalizedData,
            pagination: data?.pagination ?? data?.data?.pagination,
        };
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

// GET CAMPAIGN BY ID
export const getCampaignByIdService = async (id: number): Promise<CampaignData> => {
    try {
        const { data } = await privetApi.get<{ data: CampaignData }>(`/Campaign/${id}`);
        return data.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

// CREATE CAMPAIGN
export const createCampaignService = async (campaignData: Partial<CampaignData>) => {
    try {
        const { data } = await privetApi.post("/Campaign", campaignData);
        return data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

// UPDATE CAMPAIGN
export const updateCampaignService = async (id: number, campaignData: Partial<CampaignData>) => {
    try {
        const { data } = await privetApi.put(`/Campaign/${id}`, campaignData);
        return data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

// DELETE CAMPAIGN
export const deleteCampaignService = async (id: number) => {
    try {
        const { data } = await privetApi.delete(`/Campaign/${id}`);
        return data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};
