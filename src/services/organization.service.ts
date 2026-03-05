import { privetApi } from "./axios";
import {
    CreateOrganizationDto,
    UpdateOrganizationDto,
    OrganizationParams,
    OrganizationResponse,
    Organization,
    AddUserToOrganizationDto
} from "../types/organization.types";

export const getOrganizations = async (params?: OrganizationParams): Promise<OrganizationResponse> => {
    try {
        const response = await privetApi.get<OrganizationResponse>("/organizations", { params });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const getOrganizationById = async (id: number): Promise<Organization> => {
    try {
        const response = await privetApi.get<Organization>(`/organizations/${id}`);
        // Adjust based on actual API response structure if it's nested in data
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const createOrganization = async (data: CreateOrganizationDto) => {
    try {
        const response = await privetApi.post("/organizations", data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const updateOrganization = async (id: number, data: UpdateOrganizationDto) => {
    try {
        const response = await privetApi.put(`/organizations/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const deleteOrganization = async (id: number) => {
    try {
        const response = await privetApi.delete(`/organizations/${id}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const addUserToOrganization = async (orgId: number, data: AddUserToOrganizationDto) => {
    try {
        const response = await privetApi.post(`/organizations/${orgId}/users`, data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const removeUserFromOrganization = async (orgId: number, userId: number) => {
    try {
        const response = await privetApi.delete(`/organizations/${orgId}/users/${userId}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const getOrganizationUsers = async (orgId: number) => {
    try {
        const response = await privetApi.get(`/organizations/${orgId}/users`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const getOrganizationRoles = async (orgId: number) => {
    try {
        const response = await privetApi.get(`/organizations/${orgId}/roles`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
}

export const getOrganizationPlans = async (orgId: number) => {
    try {
        const response = await privetApi.get(`/organizations/${orgId}/plans`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
}

export const removeOrganizationPlan = async (orgId: number, planId: number) => {
    try {
        const response = await privetApi.delete(`/organizations/${orgId}/plans/${planId}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
}
