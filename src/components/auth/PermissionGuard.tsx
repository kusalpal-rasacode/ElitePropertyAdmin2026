"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModulePermission } from "@/hooks/useModulePermission";
import { useTheme } from "@/providers/ThemeProvider";
import type { ActionKey, ModuleKey } from "@/types/rbac.type";
import { useAuth } from "@/providers/AuthProvider";
import { isSuperAdmin } from "@/utils/authUtils";

interface PermissionGuardProps {
  children: React.ReactNode;
  module?: ModuleKey | "users" | "property" | "rent";
  action?: ActionKey;
  requireSuperAdmin?: boolean;
  fallbackPath?: string;
  showError?: boolean;
}

export function PermissionGuard({
  children,
  module,
  action = "view",
  requireSuperAdmin = false,
  fallbackPath = "/dashboard",
  showError = true,
}: PermissionGuardProps) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  
  // If no module is provided but requireSuperAdmin is true, we only check super admin status
  const { permissionReady: moduleReady, can } = useModulePermission(module || "campaign");
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If we require super admin, check that first
    if (requireSuperAdmin) {
      if (user) {
        const authorized = isSuperAdmin(user);
        setIsAuthorized(authorized);
        if (!authorized) {
          const delay = showError ? 3000 : 0;
          const timer = setTimeout(() => router.replace(fallbackPath), delay);
          return () => clearTimeout(timer);
        }
      } else if (user === null) {
          // User is explicitly not logged in, DashboardLayout usually handles this but we guard here too
          setIsAuthorized(false);
          router.replace("/login");
      }
      return;
    }

    // Otherwise check module-specific permission
    if (module && moduleReady) {
      const authorized = can(action);
      setIsAuthorized(authorized);

      if (!authorized) {
        const delay = showError ? 3000 : 0;
        const timer = setTimeout(() => {
          router.replace(fallbackPath);
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [module, moduleReady, can, action, requireSuperAdmin, user, router, fallbackPath, showError]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div 
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
          style={{ borderTopColor: currentTheme.primary }}
        />
      </div>
    );
  }

  // Unauthorized state
  if (isAuthorized === false) {
    if (!showError) return null;
    return (
      <div className="max-w-[1600px] mx-auto py-10 px-6">
        <div
          className="rounded-xl border p-8 text-center shadow-sm backdrop-blur-md"
          style={{ 
            backgroundColor: currentTheme.cardBg + "E6",
            borderColor: currentTheme.borderColor,
            color: currentTheme.textColor 
          }}
        >
          <div className="text-rose-500 mb-4 font-bold text-xl">Access Denied</div>
          <p className="mb-6 font-medium">
            {requireSuperAdmin 
              ? "This page is restricted to Super Administrators only."
              : `You do not have permission to access the ${module} module.`}
          </p>
          <p className="text-sm opacity-70">
            Redirecting to dashboard in a few seconds...
          </p>
          <button
            onClick={() => router.replace(fallbackPath)}
            className="mt-6 px-6 py-2 rounded-lg text-white font-bold transition-all hover:brightness-110"
            style={{ backgroundColor: currentTheme.primary }}
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
