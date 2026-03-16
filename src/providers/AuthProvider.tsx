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

        if (!hasDashboardAccess(user)) {
            console.warn("Unauthorized Session Detected: Logging out due to missing permissions.");
            setUser(null);
            if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                localStorage.removeItem("subscription");
            }
            // Clear HTTP-only cookies via server route
            fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        }
    }, [user]);

    const login = (userData: User) => {
        setUser(userData);
        if (typeof window !== "undefined" && userData) {
            localStorage.setItem("user", JSON.stringify(userData));
        }
    };

    const logout = async () => {
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            localStorage.removeItem("subscription");
        }
        // Clear HTTP-only accessToken and refreshToken cookies
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Continue even if the request fails
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
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
