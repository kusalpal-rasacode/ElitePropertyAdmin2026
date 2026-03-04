import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyPermissions } from "@/services/rbac.service";
import { useAuth } from "@/providers/AuthProvider";
import { isEnterpriseAdmin, isSuperAdmin } from "@/utils/authUtils";
import type { ActionKey, ModuleKey, PermissionsMap } from "@/types/rbac.type";

const resolveModuleKey = (module: ModuleKey | "users" | "property"): ModuleKey => {
  if (module === "users") return "user_management";
  if (module === "property") return "properties";
  return module;
};

export function useModulePermission(module: ModuleKey | "users" | "property") {
  const { user } = useAuth();
  const normalizedModule = resolveModuleKey(module);
  const superAdmin = isSuperAdmin(user);
  const enterpriseAdmin = isEnterpriseAdmin(user);
  const [permissions, setPermissions] = useState<PermissionsMap | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (superAdmin || !enterpriseAdmin) return;

    let cancelled = false;
    getMyPermissions()
      .then((res) => {
        if (!cancelled) {
          setPermissions(res.permissions ?? null);
          setResolved(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPermissions(null);
          setResolved(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [superAdmin, enterpriseAdmin, user]);

  const can = useCallback(
    (action: ActionKey): boolean => {
      if (superAdmin) return true;
      if (!enterpriseAdmin) return false;
      if (!permissions) return false;

      const modulePermissions = permissions[normalizedModule];
      if (!modulePermissions) return false;
      if (action === "view") return modulePermissions.view === true;
      if (modulePermissions.view !== true) return false;
      return modulePermissions[action] === true;
    },
    [enterpriseAdmin, normalizedModule, permissions, superAdmin],
  );

  const permissionReady = useMemo(
    () => superAdmin || !enterpriseAdmin || resolved,
    [enterpriseAdmin, resolved, superAdmin],
  );
  return { permissionReady, can };
}
