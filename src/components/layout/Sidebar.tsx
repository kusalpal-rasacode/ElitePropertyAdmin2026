"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  MdDashboard,
  MdSecurity,
  MdAdminPanelSettings,
  MdSettings,
  MdChevronRight,
  MdChevronLeft,
  MdLogout,
  MdClose,
  MdBusiness,
  MdPeople,
  MdCampaign,
  MdApartment,
  MdKey,
} from "react-icons/md";
import { ConfirmModal } from "../common/ConfirmModal";
import { isSuperAdmin, isEnterpriseAdmin } from "@/utils/authUtils";
import { getMyPermissions } from "@/services/rbac.service";
import { PermissionsMap, ModuleKey } from "@/types/rbac.type";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  permission?: ModuleKey;
  superAdminOnly?: boolean;
  alwaysShow?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", icon: <MdDashboard />, path: "/dashboard", alwaysShow: true },
  { name: "Organizations", icon: <MdBusiness />, path: "/organizations", superAdminOnly: true },
  { name: "Properties", icon: <MdApartment />, path: "/properties", permission: "properties" },
  { name: "Rentals", icon: <MdApartment />, path: "/rent", permission: "properties" },
  { name: "Users & Agents", icon: <MdPeople />, path: "/users", permission: "user_management" },
  { name: "Campaigns", icon: <MdCampaign />, path: "/campaigns", permission: "campaign" },
  { name: "Access Roles", icon: <MdKey />, path: "/roles", superAdminOnly: true },
  { name: "Permissions", icon: <MdSecurity />, path: "/permissions", superAdminOnly: true },
  { name: "Settings", icon: <MdSettings />, path: "/settings", alwaysShow: true },
];

const MANAGEMENT_PATHS = ["/organizations", "/properties", "/rent", "/users", "/campaigns"];
const SYSTEM_PATHS = ["/roles", "/permissions", "/settings"];

// ─── Hydration-safe NavLink ───────────────────────────────────────────────────
const NavLink = ({
  name,
  icon,
  path,
  collapsed,
  mobileOpen,
  currentTheme,
}: {
  name: string;
  icon: React.ReactNode;
  path: string;
  collapsed: boolean;
  mobileOpen: boolean;
  currentTheme: any;
}) => {
  const pathname = usePathname();
  // Defer active computation to client only → prevents hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && pathname === path;

  return (
    <Link
      href={path}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 group relative
        ${active
          ? "text-white shadow-md"
          : "hover:bg-white/10"
        }
      `}
      style={{
        backgroundColor: active ? currentTheme.primary : undefined,
        color: active ? "#fff" : currentTheme.sidebarText,
      }}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      {(!collapsed || mobileOpen) && (
        <span className="truncate">{name}</span>
      )}
      {/* Tooltip when collapsed */}
      {collapsed && !mobileOpen && (
        <span
          className="
            absolute left-full ml-3 px-2 py-1 rounded-md text-xs font-medium
            opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-150 whitespace-nowrap z-50 shadow-lg
          "
          style={{
            backgroundColor: currentTheme.sidebarBg,
            color: currentTheme.sidebarText,
            border: `1px solid ${currentTheme.sidebarText}22`,
          }}
        >
          {name}
        </span>
      )}
    </Link>
  );
};

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({
  label,
  collapsed,
  mobileOpen,
  currentTheme,
}: {
  label: string;
  collapsed: boolean;
  mobileOpen: boolean;
  currentTheme: any;
}) =>
  !collapsed || mobileOpen ? (
    <p
      className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1 mt-4"
      style={{ color: `${currentTheme.sidebarText}66` }}
    >
      {label}
    </p>
  ) : (
    <div
      className="mx-auto my-3 h-px w-6 rounded"
      style={{ backgroundColor: `${currentTheme.sidebarText}33` }}
    />
  );

// ─── User footer (fully client-only to avoid hydration mismatch) ──────────────
const UserFooter = ({
  collapsed,
  mobileOpen,
  currentTheme,
  user,
  onLogout,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  currentTheme: any;
  user: any;
  onLogout: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayUser = mounted ? user : null;
  const rawProfileImage =
    displayUser?.profile_image ||
    displayUser?.profileImage ||
    displayUser?.avatar ||
    "";
  const profileImageSrc =
    typeof rawProfileImage === "string" && rawProfileImage.startsWith("/")
      ? `http://localhost:4000${rawProfileImage}`
      : rawProfileImage;

  useEffect(() => {
    setImageFailed(false);
  }, [profileImageSrc]);

  const getInitials = () => {
    if (!displayUser) return "A";
    const first = displayUser.first_name?.[0] ?? "";
    const last = displayUser.last_name?.[0] ?? "";
    const fallback = displayUser.username?.[0] ?? "A";
    return (first + last || fallback).toUpperCase();
  };

  const formatRole = (roles?: any[]) => {
    if (!mounted || !roles || roles.length === 0) return "";
    const r = roles[0];
    const name = typeof r === "string" ? r : r?.Name ?? r?.name ?? r?.role ?? "";
    return name
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl mt-auto"
      style={{ backgroundColor: `${currentTheme.sidebarText}0d` }}
      suppressHydrationWarning
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md overflow-hidden"
        style={{
          backgroundColor: currentTheme.primary,
          color: "#fff",
        }}
        suppressHydrationWarning
      >
        {profileImageSrc && !imageFailed ? (
          <img
            src={profileImageSrc}
            alt=""
            className="w-9 h-9 rounded-lg object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          getInitials()
        )}
      </div>

      {(!collapsed || mobileOpen) && (
        <>
          <div className="flex-1 min-w-0" suppressHydrationWarning>
            <p
              className="text-sm font-semibold truncate leading-tight"
              style={{ color: currentTheme.sidebarText }}
              suppressHydrationWarning
            >
              {mounted ? displayUser?.first_name : ""}
            </p>
            <p
              className="text-xs truncate leading-tight mt-0.5"
              style={{ color: `${currentTheme.sidebarText}88` }}
              suppressHydrationWarning
            >
              {mounted ? formatRole(displayUser?.roles) : ""}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="text-white/40 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
            title="Logout"
          >
            <MdLogout className="text-lg" />
          </button>
        </>
      )}
    </div>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { user, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [myPermissions, setMyPermissions] = useState<PermissionsMap | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch permissions for enterprise_role users
  useEffect(() => {
    if (mounted && user && isEnterpriseAdmin(user)) {
      getMyPermissions()
        .then((res) => {
          setMyPermissions(res.permissions ?? null);
        })
        .catch(console.error);
    }
  }, [mounted, user]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const handleLogoutConfirm = () => {
    logout();
    router.push("/login");
    setIsLogoutModalOpen(false);
  };

  const isVisible = (item: NavItem): boolean => {
    // Always show non-auth items — safe to render on server too
    if (item.alwaysShow) return true;
    // Auth-dependent: defer until client is mounted to avoid hydration mismatch
    if (!mounted) return false;
    if (isSuperAdmin(user)) return true;
    if (item.superAdminOnly) return false;
    if (item.permission) {
      return myPermissions?.[item.permission]?.view === true;
    }
    return false;
  };

  const visibleManagement = NAV_ITEMS.filter(
    (i) => MANAGEMENT_PATHS.includes(i.path) && isVisible(i),
  );
  const visibleSystem = NAV_ITEMS.filter(
    (i) => SYSTEM_PATHS.includes(i.path) && isVisible(i),
  );
  const dashboardItem = NAV_ITEMS.find((i) => i.path === "/dashboard")!;

  // ─── Shared sidebar content ────────────────────────────────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 relative">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primary}cc)`,
          }}
        >
          R
        </div>
        {(!collapsed || mobileOpen) && (
          <div>
            <p
              className="font-bold text-sm leading-tight"
              style={{ color: currentTheme.sidebarText }}
            >
              Rasacode
            </p>
            <p
              className="text-[10px] leading-tight"
              style={{ color: `${currentTheme.sidebarText}66` }}
            >
              Admin Portal
            </p>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: currentTheme.sidebarText }}
        >
          <MdClose className="text-xl" />
        </button>
      </div>

      {/* Divider */}
      <div
        className="mx-4 mb-2 h-px"
        style={{ backgroundColor: `${currentTheme.sidebarText}1a` }}
      />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin">

        {/* Dashboard — always first */}
        <NavLink
          {...dashboardItem}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          currentTheme={currentTheme}
        />

        {/* Management section */}
        {visibleManagement.length > 0 && (
          <>
            <SectionLabel
              label="Management"
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              currentTheme={currentTheme}
            />
            {visibleManagement.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                currentTheme={currentTheme}
              />
            ))}
          </>
        )}

        {/* System section */}
        {visibleSystem.length > 0 && (
          <>
            <SectionLabel
              label="System"
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              currentTheme={currentTheme}
            />
            {visibleSystem.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                currentTheme={currentTheme}
              />
            ))}
          </>
        )}
      </nav>

      {/* Divider */}
      <div
        className="mx-4 mt-2 mb-3 h-px"
        style={{ backgroundColor: `${currentTheme.sidebarText}1a` }}
      />

      {/* User footer */}
      <div className="px-3 pb-4">
        <UserFooter
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          currentTheme={currentTheme}
          user={user}
          onLogout={() => setIsLogoutModalOpen(true)}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: currentTheme.sidebarBg }}
      >
        {sidebarContent}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col relative flex-shrink-0
          transition-all duration-300 ease-in-out h-screen sticky top-0
          ${collapsed ? "w-[70px]" : "w-64"}
        `}
        style={{ backgroundColor: currentTheme.sidebarBg }}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-24 w-6 h-6 border rounded-full
            flex items-center justify-center shadow-lg
            hover:scale-110 transition-all z-50
          "
          style={{
            backgroundColor: currentTheme.sidebarBg,
            borderColor: `${currentTheme.sidebarText}44`,
            color: currentTheme.sidebarText,
          }}
        >
          {collapsed ? (
            <MdChevronRight className="text-sm" />
          ) : (
            <MdChevronLeft className="text-sm" />
          )}
        </button>
      </aside>

      {/* ── Logout confirm modal ── */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of the admin portal?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
      />
    </>
  );
};

export default Sidebar;
