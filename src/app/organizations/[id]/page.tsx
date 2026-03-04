"use client";

import { useTheme } from "@/providers/ThemeProvider";
import {
  getOrganizationById,
  getOrganizationUsers,
  getOrganizationRoles,
  getOrganizationPlans,
  addUserToOrganization,
  removeUserFromOrganization,
  removeOrganizationPlan,
  updateOrganization,
} from "@/services/organization.service";
import { Organization } from "@/types/organization.types";
import { getUsers } from "@/services/user.service";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MdArrowBack,
  MdBusiness,
  MdPersonAdd,
  MdDelete,
  MdEmail,
  MdPhone,
  MdSecurity,
  MdLocalOffer,
  MdWarning,
  MdEdit,
  MdCheck,
  MdClear,
  MdPeople,
} from "react-icons/md";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import RoleTab from "./RoleTab";
import PlanTab from "./PlanTab";
import UserTab from "./UserTab";

export default function OrganizationDetailsPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "plans" | "roles">(
    "users",
  );

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [addingUser, setAddingUser] = useState(false);

  // Remove Confirm State
  const [confirmAction, setConfirmAction] = useState<{
    type: "user" | "plan";
    id: number;
  } | null>(null);
  const [removing, setRemoving] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    industry: "",
    logo_url: "",
  });
  const [updating, setUpdating] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const initialFetchDoneForIdRef = useRef<number | null>(null);

  const fetchData = async () => {
    if (!id || isNaN(id)) return;

    setLoading(true);
    try {
      // 1. Fetch Organization Details (Critical)
      let orgData: any;
      try {
        orgData = await getOrganizationById(id);
        // Handle potential data wrapping
        if (orgData.data) orgData = orgData.data;

        setOrganization(orgData);
        setEditFormData({
          name: orgData.name || "",
          industry: orgData.industry || "",
          logo_url: orgData.logo_url || "",
        });
      } catch (err) {
        console.error("Critical: Failed to fetch organization details", err);
        setOrganization(null);
        return; // Stop if main org fetch fails
      }

      // 2. Fetch Related Data (Non-Critical) - Fail metrics gracefully
      const [usersData, rolesData, plansData] = await Promise.all([
        getOrganizationUsers(id).catch((err) => {
          console.warn("Failed to fetch users", err);
          return [];
        }),
        getOrganizationRoles(id).catch((err) => {
          console.warn("Failed to fetch roles", err);
          return [];
        }),
        getOrganizationPlans(id).catch((err) => {
          console.warn("Failed to fetch plans", err);
          return [];
        }),
      ]);

      setUsers(
        Array.isArray(usersData) ? usersData : (usersData as any).data || [],
      );
      setRoles(
        Array.isArray(rolesData) ? rolesData : (rolesData as any).data || [],
      );
      console.log(
        "Roles Data Debug:",
        Array.isArray(rolesData) ? rolesData : (rolesData as any).data || [],
      );
      setPlans(
        Array.isArray(plansData) ? plansData : (plansData as any).data || [],
      );
    } catch (error) {
      console.error("Unexpected error in fetchData", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || isNaN(id)) return;
    if (initialFetchDoneForIdRef.current === id) return;
    initialFetchDoneForIdRef.current = id;
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!roles.length) {
      setSelectedRoleId("");
      return;
    }

    const hasSelectedRole = roles.some((role) => {
      const roleId = String(role.id || role.Id || role._id || "");
      return roleId === selectedRoleId;
    });

    if (!selectedRoleId || !hasSelectedRole) {
      const firstRoleId = String(
        roles[0]?.id || roles[0]?.Id || roles[0]?._id || "",
      );
      setSelectedRoleId(firstRoleId);
    }
  }, [roles, selectedRoleId]);

  const handleAddUserInit = async () => {
    setIsAddUserModalOpen(true);
    try {
      const res = await getUsers({ limit: 100 }); // Fetch potential users
      const allUsers = Array.isArray(res) ? res : res.data || [];
      // Filter users not already in the organization
      const existingUserIds = new Set(users.map((u) => u.id));
      setAvailableUsers(
        allUsers.filter((u: any) => !existingUserIds.has(u.id)),
      );
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;
    setAddingUser(true);
    try {
      await addUserToOrganization(id, { user_id: Number(selectedUserId) });
      setIsAddUserModalOpen(false);
      setSelectedUserId("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to add user", error);
    } finally {
      setAddingUser(false);
    }
  };

  const handleUpdateOrganization = async () => {
    setUpdating(true);
    try {
      await updateOrganization(id, editFormData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to update organization", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!confirmAction) return;
    setRemoving(true);
    try {
      if (confirmAction.type === "user") {
        await removeUserFromOrganization(id, confirmAction.id);
      } else if (confirmAction.type === "plan") {
        await removeOrganizationPlan(id, confirmAction.id);
      }
      setConfirmAction(null);
      fetchData();
    } catch (error) {
      console.error(`Failed to remove ${confirmAction.type}`, error);
    } finally {
      setRemoving(false);
    }
  };

  const roleModules = [
    { key: "campaign", label: "Campaigns", icon: <MdLocalOffer size={16} /> },
    { key: "properties", label: "Properties", icon: <MdBusiness size={16} /> },
    { key: "users", label: "Users", icon: <MdPeople size={16} /> },
  ];

  const roleActions = [
    { key: "view", label: "View" },
    { key: "create", label: "Create" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  const selectedRole = roles.find((role) => {
    const roleId = String(role.id || role.Id || role._id || "");
    return roleId === selectedRoleId;
  });

  const selectedRoleName =
    selectedRole?.role ||
    selectedRole?.name ||
    selectedRole?.Name ||
    selectedRole?.label ||
    "Unknown Role";
  const selectedRoleDisplayName = String(selectedRoleName)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const selectedRoleDescription =
    selectedRole?.role_title ||
    selectedRole?.description ||
    selectedRole?.title ||
    "Custom defined role with specific permission sets.";

  // Supports both legacy permission strings and map-style permissions from API.
  const checkPermission = (role: any, module: string, action: string) => {
    if (!role || !role.permissions || !Array.isArray(role.permissions)) {
      return false;
    }

    const normalizedAction = action === "create" ? "add" : action;
    const firstEntry = role.permissions[0];
    const mapSource =
      firstEntry && typeof firstEntry === "object"
        ? firstEntry.permissions || firstEntry
        : null;

    // New format: permissions: [{ campaign: { view/add/edit/delete } ... }]
    if (mapSource && typeof mapSource === "object") {
      const moduleKeys =
        module === "users"
          ? ["users", "user_management"]
          : [module];

      return moduleKeys.some((moduleKey) => {
        const modulePerms = (mapSource as any)[moduleKey];
        if (!modulePerms || typeof modulePerms !== "object") return false;
        if (modulePerms.view === false && normalizedAction !== "view") {
          return false;
        }
        return Boolean(modulePerms[normalizedAction]);
      });
    }

    // Legacy format: ["module.action"] or [{ permission_name: "module.action" }]
    return role.permissions.some((p: any) => {
      const permissionString =
        typeof p === "string" ? p : p.permission_name || p.name || "";

      if (permissionString === `${module}.${normalizedAction}`) return true;

      if (permissionString === `${module}.*`) return true;

      if (permissionString === "*") return true;

      return false;
    });
  };

  if (loading && !organization) {
    return (
      <div
        className="flex items-center justify-center min-h-screen text-lg font-bold animate-pulse"
        style={{ color: currentTheme.textColor }}
      >
        Loading Organization Details...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-2xl font-bold text-red-500">
          Organization Not Found
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen pb-20">
      {/* Header / Nav - Matching Property Details */}
      <div className="flex items-center justify-between  mb-2">
        <Link
          href="/organizations"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          style={{ color: currentTheme.textColor }}
        >
          <MdArrowBack size={20} />
          <span className="font-bold">Back to Organizations</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* LEFT COLUMN - Sticky Profile & Actions */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-6 space-y-6">
          {/* Organization Profile Card */}
          <div
            className="rounded-2xl border shadow-sm overflow-hidden relative group"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.borderColor,
            }}
          >
            {/* Decorative Top Banner */}
            <div
              className="h-24 w-full relative"
              style={{ backgroundColor: `${currentTheme.primary}15` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
            </div>

            <div className="px-6 pb-6 -mt-10 relative">
              {/* Logo */}
              <div
                className="h-20 w-20 rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold uppercase overflow-hidden border-4 mb-4"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.cardBg,
                  color: currentTheme.primary,
                }}
              >
                {organization.logo_url ? (
                  <img
                    src={organization.logo_url}
                    alt={organization.name || "Org"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (organization.name || "Org").slice(0, 2)
                )}
              </div>

              {/* Info */}
              <div className="mb-6">
                <h1
                  className="text-xl font-bold leading-tight mb-2"
                  style={{ color: currentTheme.headingColor }}
                >
                  {organization.name}
                </h1>
                <div
                  className="flex items-center gap-1.5 text-sm opacity-80 mb-1"
                  style={{ color: currentTheme.textColor }}
                >
                  <MdBusiness size={14} />
                  <span>{organization.industry || "Unspecified Industry"}</span>
                </div>
              </div>

              {/* Edit Action */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-black/5 flex items-center justify-center gap-2"
                style={{
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.headingColor,
                }}
              >
                <MdEdit size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Tabs & Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div
            className="rounded-2xl border shadow-sm p-6 space-y-6"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.borderColor,
            }}
          >
            {/* Header / Breadcrumbs Area */}
            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: currentTheme.borderColor }}
            >
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60"
                style={{ color: currentTheme.textColor }}
              >
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push("/organizations")}
                >
                  Organizations
                </span>
                <span>/</span>
                <span>{activeTab}</span>
              </div>
            </div>

            {/* Secondary Navigation (Tabs) */}
            <div>
              <div
                className="flex items-center gap-1 border-b"
                style={{ borderColor: currentTheme.borderColor }}
              >
                {[
                  {
                    id: "users",
                    label: "Users",
                    icon: MdPersonAdd,
                    count: users.length,
                  },
                  {
                    id: "plans",
                    label: "Plans",
                    icon: MdLocalOffer,
                    count: plans.length,
                  },
                  // {
                  //   id: "roles",
                  //   label: "Roles",
                  //   icon: MdSecurity,
                  //   count: roles.length,
                  // },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`relative px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all ${
                      activeTab === item.id
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-100 hover:bg-black/5"
                    }`}
                    style={{
                      color:
                        activeTab === item.id
                          ? currentTheme.primary
                          : currentTheme.textColor,
                    }}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                    <span className="bg-black/5 px-1.5 py-0.5 rounded text-[10px] ml-1 opacity-70">
                      {item.count}
                    </span>
                    {activeTab === item.id && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: currentTheme.primary }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="animate-in fade-in zoom-in-95 duration-200 min-h-[500px]">
              {/* USERS - Modern Datatable List */}
              {activeTab === "users" && (
                <UserTab
                  users={users}
                  currentTheme={currentTheme}
                  handleAddUserInit={handleAddUserInit}
                  setConfirmAction={setConfirmAction}
                />
              )}

              {/* PLANS - Pricing Card Style */}
              {activeTab === "plans" && (
                <PlanTab
                  setConfirmAction={setConfirmAction}
                  plans={plans}
                  currentTheme={currentTheme}
                />
              )}

               {/* ROLES - Roles  Style */}
              {/* {activeTab === "roles" && (
                <RoleTab
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  setSelectedRoleId={setSelectedRoleId}
                  currentTheme={currentTheme}
                  roleActions={roleActions}
                  roleModules={roleModules}
                  checkPermission={checkPermission}
                  selectedRole={selectedRole}
                  selectedRoleDisplayName={selectedRoleDisplayName}
                  selectedRoleDescription={selectedRoleDescription}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300"
            style={{ backgroundColor: currentTheme.cardBg }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: currentTheme.headingColor }}
            >
              Add User to Organization
            </h2>

            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 ml-1"
                style={{ color: currentTheme.textColor }}
              >
                Select User
              </label>
              {availableUsers.length > 0 ? (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                  style={{
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                >
                  <option value="" disabled>
                    Select a user...
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} (
                      {user.email || user.username})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl border bg-yellow-50 text-yellow-700 text-sm flex items-center gap-2">
                  <MdWarning /> No available users to add.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold border transition-colors hover:bg-black/5 text-sm"
                style={{
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={addingUser || !selectedUserId}
                className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 text-sm"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {addingUser ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300"
            style={{ backgroundColor: currentTheme.cardBg }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: currentTheme.headingColor }}
            >
              Edit Organization
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-bold mb-1 opacity-80"
                  style={{ color: currentTheme.textColor }}
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                  style={{
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-bold mb-1 opacity-80"
                  style={{ color: currentTheme.textColor }}
                >
                  Industry
                </label>
                <input
                  type="text"
                  value={editFormData.industry}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      industry: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                  style={{
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                  placeholder="e.g. Real Estate"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-bold mb-1 opacity-80"
                  style={{ color: currentTheme.textColor }}
                >
                  Logo URL
                </label>
                <input
                  type="text"
                  value={editFormData.logo_url}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      logo_url: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border bg-transparent outline-none focus:ring-2"
                  style={{
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.headingColor,
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold border transition-colors hover:bg-black/5 text-sm"
                style={{
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrganization}
                disabled={updating || !editFormData.name}
                className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 text-sm"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Removes */}
      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleRemoveConfirm}
        title={`Remove ${confirmAction?.type === "user" ? "User" : "Plan"}`}
        message={`Are you sure you want to remove this ${confirmAction?.type}?`}
        confirmLabel="Remove"
        confirmButtonColor="#ef4444"
        isLoading={removing}
      />
    </div>
  );
}
