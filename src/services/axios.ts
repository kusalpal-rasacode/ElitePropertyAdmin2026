import axios, { InternalAxiosRequestConfig } from "axios";

// Since we're in the admin project, let's keep the base URL consistent 
// or update to what Admin normally uses if different. 
// Assuming it connects to same backend for now or user can adjust.
const BASE_URL = "http://localhost:4000";

// ===================
// PUBLIC API
// ===================
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===================
// PRIVATE API
// ===================
export const privetApi = axios.create({
  baseURL: BASE_URL,
});

// ===================
// REQUEST INTERCEPTOR
// ===================
const attachToken = (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

    // let browser set multipart boundary
    if (config.data instanceof FormData) {
        if (config.headers) {
            delete config.headers["Content-Type"];
        }
    }

  return config;
};

// Casting to any to avoid strict type mismatch if definitions vary slightly
api.interceptors.request.use(attachToken as any, Promise.reject);
privetApi.interceptors.request.use(attachToken as any, Promise.reject);

// RESPONSE INTERCEPTOR
const handleResponseError = async (error: any) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest =
        requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh");

    if (
        error.response?.status === 401 &&
        !originalRequest?._retry &&
        !isAuthRequest
    ) {
        originalRequest._retry = true;

        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                return Promise.reject(error);
            }

            const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken,
            });

            const refreshBody: any = res.data;
            const newAccessToken =
                refreshBody?.data?.tokens?.accessToken ??
                refreshBody?.data?.tokens?.access_token ??
                refreshBody?.data?.accessToken ??
                refreshBody?.data?.access_token ??
                refreshBody?.tokens?.accessToken ??
                refreshBody?.tokens?.access_token ??
                refreshBody?.accessToken ??
                refreshBody?.access_token;

            if (!newAccessToken) {
                throw new Error("Refresh token response did not include access token");
            }

            localStorage.setItem("accessToken", newAccessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return privetApi(originalRequest); // retry original request with same client
        } catch (err) {
            // refresh token expired (7 days)
            if (typeof window !== "undefined") {
                localStorage.clear();
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
            return Promise.reject(err);
        }
    }

  // Do not intercept login errors
  if (originalRequest.url?.includes("/auth/login")) {
    return Promise.reject(error);
  }

  if (error.response?.status === 401) {
    // token invalid or expired
    localStorage.clear();
    window.location.href = "/login";
  }

  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleResponseError);

privetApi.interceptors.response.use(
  (response) => response,
  handleResponseError,
);
