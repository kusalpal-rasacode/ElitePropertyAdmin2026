"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { hasDashboardAccess } from "@/utils/authUtils";

// Define User Type
type User = {
    id: string | number;
    name?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    roles?: any[];
    avatar?: string;
} | null;

interface AuthContextType {
    user: User;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(() => {
        if (typeof window === "undefined") return null;

        const hasToken = !!localStorage.getItem("accessToken");
        if (!hasToken) {
            localStorage.removeItem("user");
            return null;
        }

        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;

        try {
            return JSON.parse(savedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    // Security Check: Enforce strict access control
    useEffect(() => {
        if (!user) return;

        // Validating Authorization
        if (!hasDashboardAccess(user)) {
            console.warn("Unauthorized Session Detected: Logging out due to missing permissions.");

            // Force logout
            setUser(null);
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("subscription");
            }
        }
    }, [user]);

    const login = (userData: User) => {
        setUser(userData);
        if (typeof window !== "undefined" && userData) {
            localStorage.setItem("user", JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("subscription");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated:
                    !!user &&
                    (typeof window === "undefined"
                        ? true
                        : !!localStorage.getItem("accessToken")),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
