/* ======================
    Login API Call
   ====================== */
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
        // Call the local Next.js route — it forwards to backend and sets HTTP-only cookies
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const body: any = await res.json();

        if (!res.ok) {
            throw body;
        }

        // Store non-sensitive user/subscription data in localStorage for UI
        if (typeof window !== "undefined") {
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

        return body as LoginResponse;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        throw axiosError.response?.data || error;
    }
};
