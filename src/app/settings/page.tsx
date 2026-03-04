"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { MdCheck, MdColorLens, MdPalette, MdSave, MdUndo, MdPerson, MdMail, MdLock, MdNotifications } from "react-icons/md";
import { useAuth } from "@/providers/AuthProvider";
import { getUserByIdService, updateUserByIdService } from "@/services/user.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function SettingsPage() {
    const { currentTheme, savedTheme, setPreviewTheme, saveTheme, cancelPreview, setCustomColor, presets } = useTheme();
    const { user, login: authLogin } = useAuth();
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [profileForm, setProfileForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        gender: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        country: "",
        zip_code: "",
    });
    const [profileMeta, setProfileMeta] = useState<any>(null);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImageRemoved, setProfileImageRemoved] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [isProfileEditing, setIsProfileEditing] = useState(false);

    const hasChanges = JSON.stringify(currentTheme) !== JSON.stringify(savedTheme);
    const safeUser = mounted ? user : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    const normalizeImageUrl = (value?: string | null) => {
        const raw = String(value ?? "").trim();
        if (!raw) return "";
        if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
        if (raw.startsWith("/")) return `http://localhost:4000${raw}`;
        return `http://localhost:4000/uploads/users/${raw}`;
    };

    const applyUserToForm = (source: any) => {
        setProfileMeta(source || null);
        setProfileForm({
            username: source?.username ?? "",
            first_name: source?.first_name ?? "",
            last_name: source?.last_name ?? "",
            email: source?.email ?? source?.username ?? "",
            phone_number: source?.phone_number ?? "",
            date_of_birth: source?.date_of_birth ? String(source.date_of_birth).slice(0, 10) : "",
            gender: source?.gender ?? "",
            address_line_1: source?.address_line_1 ?? "",
            address_line_2: source?.address_line_2 ?? "",
            city: source?.city ?? "",
            state: source?.state ?? "",
            country: source?.country ?? "",
            zip_code: source?.zip_code ?? "",
        });
        setProfileImageUrl(
            normalizeImageUrl(source?.profile_image || source?.profileImage || source?.avatar),
        );
        setProfileImageRemoved(false);
    };

    useEffect(() => {
        if (!safeUser?.id) {
            applyUserToForm(safeUser);
            return;
        }

        applyUserToForm(safeUser);

        let active = true;
        const loadProfile = async () => {
            setProfileLoading(true);
            try {
                const response = await getUserByIdService(String(safeUser.id));
                const latest = response?.data || response;
                if (!active || !latest) return;
                applyUserToForm(latest);
                authLogin({ ...(safeUser as any), ...latest });
            } catch {
                // fallback to local user data if fetch fails
            } finally {
                if (active) setProfileLoading(false);
            }
        };

        loadProfile();
        return () => {
            active = false;
        };
    }, [safeUser?.id, mounted]);

    const profileInitials = useMemo(() => {
        const first = profileForm.first_name?.trim().charAt(0) ?? "";
        const last = profileForm.last_name?.trim().charAt(0) ?? "";
        return (first + last || safeUser?.username?.charAt(0) || "A").toUpperCase();
    }, [profileForm.first_name, profileForm.last_name, safeUser?.username]);

    const displayName = useMemo(() => {
        const full = `${profileForm.first_name} ${profileForm.last_name}`.trim();
        return full || safeUser?.username || "Admin";
    }, [profileForm.first_name, profileForm.last_name, safeUser?.username]);

    const displayRole = useMemo(() => {
        const firstRole = profileMeta?.roles?.[0] ?? (safeUser as any)?.roles?.[0];
        if (typeof firstRole === "string") return firstRole.replace(/_/g, " ");
        return firstRole?.role_title || firstRole?.Name || firstRole?.name || "Admin";
    }, [profileMeta, safeUser]);

    const onProfileInputChange =
        (field:
            | "first_name"
            | "last_name"
            | "email"
            | "phone_number"
            | "date_of_birth"
            | "gender"
            | "address_line_1"
            | "address_line_2"
            | "city"
            | "state"
            | "country"
            | "zip_code") =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setProfileForm((prev) => ({ ...prev, [field]: value }));
            };

    const onProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfileImageFile(file);
        setProfileImageUrl(URL.createObjectURL(file));
        setProfileImageRemoved(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveProfilePhoto = () => {
        if (!isProfileEditing) setIsProfileEditing(true);
        setProfileImageFile(null);
        setProfileImageUrl("");
        setProfileImageRemoved(true);
    };

    const handleChangeProfilePhoto = () => {
        if (!isProfileEditing) setIsProfileEditing(true);
        fileInputRef.current?.click();
    };

    const handleStartEditProfile = () => {
        setIsProfileEditing(true);
    };

    const handleCancelEditProfile = () => {
        applyUserToForm(profileMeta || user);
        setProfileImageFile(null);
        setProfileImageRemoved(false);
        setIsProfileEditing(false);
    };

    const handleSaveProfile = async () => {
        if (!safeUser?.id) return;
        setProfileSaving(true);
        try {
            const payload = new FormData();
            const appendIfNonEmpty = (key: string, value: string) => {
                const normalized = String(value ?? "").trim();
                if (normalized) payload.append(key, normalized);
            };

            appendIfNonEmpty("first_name", profileForm.first_name);
            appendIfNonEmpty("last_name", profileForm.last_name);
            appendIfNonEmpty("phone_number", profileForm.phone_number);
            appendIfNonEmpty("email", profileForm.email);
            appendIfNonEmpty("gender", profileForm.gender);
            appendIfNonEmpty("address_line_1", profileForm.address_line_1);
            appendIfNonEmpty("address_line_2", profileForm.address_line_2);
            appendIfNonEmpty("city", profileForm.city);
            appendIfNonEmpty("state", profileForm.state);
            appendIfNonEmpty("country", profileForm.country);
            appendIfNonEmpty("zip_code", profileForm.zip_code);

            // Backend expects valid date format when provided.
            if (profileForm.date_of_birth?.trim()) {
                payload.append("date_of_birth", profileForm.date_of_birth.trim());
            }

            if (profileImageFile) {
                payload.append("profile_image", profileImageFile);
            }

            const response = await updateUserByIdService(String(safeUser.id), payload);
            const updated = response?.data || {};
            const mergedUser = profileImageRemoved
                ? { ...(safeUser as any), ...updated, profile_image: "" }
                : { ...(safeUser as any), ...updated };
            authLogin(mergedUser);
            applyUserToForm(mergedUser);
            setProfileImageFile(null);
            setProfileImageRemoved(false);
            setIsProfileEditing(false);
            showSuccessToast("Profile updated successfully.");
        } catch (err: any) {
            showErrorToast(err?.message || "Failed to update profile.");
        } finally {
            setProfileSaving(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentTheme.headingColor }}>System Settings</h1>
                    <p className="text-sm font-medium opacity-70" style={{ color: currentTheme.textColor }}>Customize application appearance and preferences.</p>
                </div>

                {hasChanges && (
                    <div className="flex gap-3 animate-fade-in">
                        <button
                            onClick={cancelPreview}
                            className="px-5 py-2.5 border rounded-lg hover:brightness-95 font-bold text-sm flex items-center gap-2"
                            style={{
                                backgroundColor: currentTheme.cardBg,
                                borderColor: currentTheme.borderColor,
                                color: currentTheme.textColor
                            }}
                        >
                            <MdUndo size={18} />
                            Discard Changes
                        </button>
                        <button
                            onClick={saveTheme}
                            className="px-6 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center gap-2"
                            style={{ backgroundColor: currentTheme.primary }}
                        >
                            <MdSave size={20} />
                            Save Theme
                        </button>
                    </div>
                )}
            </div>

            {/* THEME & APPEARANCE SECTION */}
            <div
                className="p-6 rounded-2xl border shadow-sm space-y-6 backdrop-blur-md"
                style={{
                    backgroundColor: currentTheme.cardBg + 'E6',
                    borderColor: currentTheme.borderColor
                }}
            >
                <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: currentTheme.borderColor }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentTheme.background, color: currentTheme.primary }}>
                        <MdColorLens size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: currentTheme.headingColor }}>Visual Theme</h2>
                        <p className="text-xs opacity-60" style={{ color: currentTheme.textColor }}>Pick a preset or customize colors. Changes are previewed instantly.</p>
                    </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {presets.map((theme) => (
                        <button
                            key={theme.name}
                            onClick={() => setPreviewTheme(theme)}
                            className={`
                                relative group p-1 rounded-xl border-2 transition-all text-left flex flex-col gap-2 hover:-translate-y-1 overflow-hidden
                                ${currentTheme.name === theme.name
                                    ? "shadow-md"
                                    : "border-transparent hover:shadow-sm"}
                            `}
                            style={{
                                borderColor: currentTheme.name === theme.name ? currentTheme.primary : 'transparent'
                            }}
                        >
                            <div className="h-16 w-full rounded-lg flex overflow-hidden shadow-sm border border-slate-200/50">
                                <div className="w-1/3 h-full flex items-center justify-center" style={{ background: theme.sidebarBg }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                </div>
                                <div className="w-2/3 h-full bg-slate-50 relative p-2" style={{ background: theme.background }}>
                                    <div className="w-8 h-2 rounded-[2px] mb-1 opacity-20" style={{ background: theme.primary }}></div>
                                    <div className="w-full h-8 rounded-[4px] bg-white shadow-sm border border-slate-100"></div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-center w-full block py-1" style={{ color: currentTheme.textColor }}>{theme.name}</span>
                            {currentTheme.name === theme.name && (
                                <div className="absolute top-2 right-2 text-white rounded-full p-0.5 shadow-sm z-10" style={{ backgroundColor: currentTheme.primary }}>
                                    <MdCheck size={12} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom Color Pickers */}
                <div className="pt-4 border-t" style={{ borderColor: currentTheme.borderColor }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Advanced Customization</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: currentTheme.textColor }}>Primary Accent</label>
                            <div className="flex items-center gap-3 p-2 rounded-lg border group" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                <input
                                    type="color"
                                    value={currentTheme.primary}
                                    onChange={(e) => setCustomColor("primary", e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                                />
                                <span className="text-xs font-mono uppercase" style={{ color: currentTheme.textColor }}>{currentTheme.primary}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: currentTheme.textColor }}>Sidebar Background</label>
                            <div className="flex items-center gap-3 p-2 rounded-lg border group" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                <input
                                    type="color"
                                    value={currentTheme.sidebarBg}
                                    onChange={(e) => setCustomColor("sidebarBg", e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                                />
                                <span className="text-xs font-mono uppercase" style={{ color: currentTheme.textColor }}>{currentTheme.sidebarBg}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: currentTheme.textColor }}>Main Background</label>
                            <div className="flex items-center gap-3 p-2 rounded-lg border group" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                <input
                                    type="color"
                                    value={currentTheme.background}
                                    onChange={(e) => setCustomColor("background", e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                                />
                                <span className="text-xs font-mono uppercase" style={{ color: currentTheme.textColor }}>{currentTheme.background}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STANDARD SETTINGS (Rest of the page) */}
            <div className="space-y-8">
                {/* Profile Settings (Full Width) */}
                <div
                    id="admin-profile"
                    className="p-6 rounded-2xl border shadow-sm space-y-6 backdrop-blur-md"
                    style={{
                        backgroundColor: currentTheme.cardBg + 'E6',
                        borderColor: currentTheme.borderColor
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentTheme.background, color: currentTheme.primary }}>
                            <MdPerson size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold" style={{ color: currentTheme.headingColor }}>Admin Profile</h2>
                            <p className="text-xs opacity-60" style={{ color: currentTheme.textColor }}>Manage your personal details and contact information.</p>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Profile Header Card */}
                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 p-6 rounded-xl border transition-all" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 shadow-sm overflow-hidden shrink-0" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor, color: currentTheme.textColor }}>
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={() => setProfileImageUrl("")}
                                    />
                                ) : (
                                    profileInitials
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-1">
                                <h3 className="text-2xl font-bold" style={{ color: currentTheme.primary }}>{displayName}</h3>
                                <p className="text-sm font-medium opacity-80" style={{ color: currentTheme.textColor }}>{displayRole}</p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={onProfileFileChange}
                                />

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                                    <button
                                        onClick={handleChangeProfilePhoto}
                                        className="text-xs font-bold px-4 py-2 rounded-lg border hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor, color: currentTheme.primary }}
                                        type="button"
                                        disabled={!isProfileEditing}
                                    >
                                        Change Photo
                                    </button>
                                    <button
                                        onClick={handleRemoveProfilePhoto}
                                        className="text-xs font-bold px-4 py-2 rounded-lg border hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor, color: "#ef4444" }}
                                        type="button"
                                        disabled={!isProfileEditing}
                                    >
                                        Remove Photo
                                    </button>
                                </div>
                            </div>

                            {!isProfileEditing && (
                                <button
                                    onClick={handleStartEditProfile}
                                    className="md:absolute top-6 right-6 px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 text-white w-full md:w-auto mt-4 md:mt-0"
                                    style={{ backgroundColor: currentTheme.primary }}
                                >
                                    <MdPerson size={18} />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <fieldset disabled={!isProfileEditing} className="space-y-8 disabled:opacity-95">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: currentTheme.textColor }}>
                                    <MdPerson className="opacity-70" size={16} /> Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 rounded-xl border" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Username</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium outline-none opacity-60 cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor
                                            }}
                                            value={profileForm.username}
                                            disabled
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>First Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.first_name}
                                            onChange={onProfileInputChange("first_name")}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.last_name}
                                            onChange={onProfileInputChange("last_name")}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Gender</label>
                                        <select
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.gender}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({ ...prev, gender: e.target.value }))
                                            }
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.date_of_birth}
                                            onChange={onProfileInputChange("date_of_birth")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: currentTheme.textColor }}>
                                    <MdMail className="opacity-70" size={16} /> Contact Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl border" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.email}
                                            onChange={onProfileInputChange("email")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.phone_number}
                                            onChange={onProfileInputChange("phone_number")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: currentTheme.textColor }}>
                                    <MdCheck className="opacity-70" size={16} /> Address Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl border" style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.borderColor }}>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Address Line 1</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.address_line_1}
                                            onChange={onProfileInputChange("address_line_1")}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Address Line 2</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.address_line_2}
                                            onChange={onProfileInputChange("address_line_2")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>City</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.city}
                                            onChange={onProfileInputChange("city")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>State</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.state}
                                            onChange={onProfileInputChange("state")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Country</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.country}
                                            onChange={onProfileInputChange("country")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.textColor, opacity: 0.7 }}>Zip Code</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: currentTheme.cardBg,
                                                borderColor: currentTheme.borderColor,
                                                color: currentTheme.headingColor,
                                                '--tw-ring-color': currentTheme.primary + '40'
                                            } as React.CSSProperties}
                                            value={profileForm.zip_code}
                                            onChange={onProfileInputChange("zip_code")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isProfileEditing && (
                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t" style={{ borderColor: currentTheme.borderColor }}>
                                    <button
                                        type="button"
                                        onClick={handleCancelEditProfile}
                                        className="px-6 py-2.5 border rounded-lg font-bold text-sm transition-all shadow-sm order-2 sm:order-1"
                                        style={{
                                            backgroundColor: currentTheme.background,
                                            borderColor: currentTheme.borderColor,
                                            color: currentTheme.textColor
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={profileSaving || profileLoading || !safeUser?.id}
                                        className="px-8 py-2.5 text-white rounded-lg shadow-sm hover:brightness-110 transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2"
                                        style={{ backgroundColor: currentTheme.primary }}
                                    >
                                        <MdSave size={18} />
                                        {profileSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </fieldset>
                    </div>
                </div>

                {/* Security & Notifications (Same Row) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        className="p-6 rounded-2xl border shadow-sm space-y-6 backdrop-blur-md"
                        style={{
                            backgroundColor: currentTheme.cardBg + 'E6',
                            borderColor: currentTheme.borderColor
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentTheme.background, color: currentTheme.primary }}>
                                <MdLock size={22} />
                            </div>
                            <h2 className="text-lg font-bold" style={{ color: currentTheme.headingColor }}>Security</h2>
                        </div>

                        <div className="space-y-4">
                            <button
                                className="w-full py-2.5 border rounded-lg font-bold text-sm hover:brightness-95 transition-colors"
                                style={{
                                    backgroundColor: currentTheme.background,
                                    borderColor: currentTheme.borderColor,
                                    color: currentTheme.textColor
                                }}
                            >
                                Change Password
                            </button>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium" style={{ color: currentTheme.headingColor }}>Two-Factor Authentication</span>
                                <div className="w-10 h-5 rounded-full cursor-pointer relative" style={{ backgroundColor: currentTheme.borderColor }}>
                                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl border shadow-sm space-y-6 backdrop-blur-md"
                        style={{
                            backgroundColor: currentTheme.cardBg + 'E6',
                            borderColor: currentTheme.borderColor
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentTheme.background, color: currentTheme.primary }}>
                                <MdNotifications size={22} />
                            </div>
                            <h2 className="text-lg font-bold" style={{ color: currentTheme.headingColor }}>Notifications</h2>
                        </div>

                        <div className="space-y-3">
                            {['Email Alerts', 'Push Notifications', 'Weekly Digest'].map((item) => (
                                <div key={item} className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: currentTheme.headingColor }}>{item}</span>
                                    <input type="checkbox" defaultChecked className="form-checkbox rounded" style={{ color: currentTheme.primary }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
