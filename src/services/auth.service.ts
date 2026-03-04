/* ======================
    Login API Call
   ====================== */
import { api } from "./axios";
import { AxiosError } from "axios";

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    is_success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            phone_number: string;
            roles: Role[];
        };
        subscription: Subscription;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
}

export interface Role {
    Id: number;
    Name: string;
    role_title: string;
    permissions: RolePermission[];
}

export interface RolePermission {
    id: number;
    permissions: {
        campaign: CrudPermissions;
        properties: CrudPermissions;
    };
}

export interface CrudPermissions {
    add: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
}

export interface Subscription {
    id: number;
    status: string;
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    plan: Plan;
}

export interface Plan {
    id: number;
    name: string;
    display_name: string;
    plan_type: string;
    price: number;
    billing_cycle: string;
    features: string[];
}

export const loginService = async (
    payload: LoginPayload,
): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>("/auth/login", payload);
        const body: any = response.data;

        const accessToken =
            body?.data?.tokens?.accessToken ??
            body?.data?.tokens?.access_token ??
            body?.tokens?.accessToken ??
            body?.tokens?.access_token ??
            body?.accessToken ??
            body?.access_token;

        const refreshToken =
            body?.data?.tokens?.refreshToken ??
            body?.data?.tokens?.refresh_token ??
            body?.tokens?.refreshToken ??
            body?.tokens?.refresh_token ??
            body?.refreshToken ??
            body?.refresh_token;

        // Save tokens (client-side only)
        if (typeof window !== "undefined") {
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }
            if (body?.data?.user) {
                localStorage.setItem("user", JSON.stringify(body.data.user));
            }
            if (body?.data?.subscription) {
                localStorage.setItem(
                    "subscription",
                    JSON.stringify(body.data.subscription),
                );
            }
        }

        return response.data;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        throw axiosError.response?.data || error;
    }
};
