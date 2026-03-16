import axios, { InternalAxiosRequestConfig } from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// ===================
// PUBLIC API
// Calls backend directly — no auth required (login, public routes)
// ===================
export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ===================
// PRIVATE API
// Routes through the Next.js proxy (/api/proxy) which reads the
// HTTP-only accessToken cookie and adds the Authorization header.
// ===================
export const privetApi = axios.create({
    baseURL: "/api/proxy",
});

// Let browser set multipart boundary for FormData
const handleFormData = (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
        if (config.headers) {
            delete config.headers["Content-Type"];
        }
    }
    return config;
};

privetApi.interceptors.request.use(handleFormData as any, Promise.reject);

// RESPONSE INTERCEPTOR
const handleResponseError = async (error: any) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest =
        requestUrl.includes("/api/auth/login") || requestUrl.includes("/api/auth/refresh");

    if (
        error.response?.status === 401 &&
        !originalRequest?._retry &&
        !isAuthRequest
    ) {
        originalRequest._retry = true;

        try {
            // Call the Next.js refresh route — it reads the HTTP-only
            // refreshToken cookie and sets a new accessToken cookie
            await axios.post("/api/auth/refresh");

            // Retry the original request — the proxy will use the new cookie
            return privetApi(originalRequest);
        } catch {
            // Refresh token expired — redirect to login
            if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                localStorage.removeItem("subscription");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
            return Promise.reject(error);
        }
    }

    if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            localStorage.removeItem("subscription");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
    }

    return Promise.reject(error);
};

privetApi.interceptors.response.use((response) => response, handleResponseError);
