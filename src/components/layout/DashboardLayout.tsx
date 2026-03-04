"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { MdNotifications, MdMail, MdMenu, MdSearch } from "react-icons/md";
import { useRouter } from 'next/navigation';
import { useTheme } from "@/providers/ThemeProvider"; // Importing useTheme
import { useAuth } from "@/providers/AuthProvider";
import TypewriterGreeting from "./TypewriterGreeting";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { currentTheme } = useTheme(); // Getting current theme
    const { user, logout, isAuthenticated } = useAuth(); // Get user from AuthContext
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    // Protect Dashboard - Redirect to login if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };





    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
            router.replace('/login');
        }
    };

    const displayUser = mounted ? user : null;

    const getDisplayName = () => {
        const fullName = `${displayUser?.first_name ?? ""} ${displayUser?.last_name ?? ""}`.trim();
        return displayUser?.name || fullName || displayUser?.username || "A";
    };

    const initials = getDisplayName().charAt(0).toUpperCase() || "A";
    const rawProfileImage =
        (displayUser as { profile_image?: string; profileImage?: string } | null)?.profile_image ||
        (displayUser as { profile_image?: string; profileImage?: string } | null)?.profileImage ||
        displayUser?.avatar ||
        "";
    const profileImageSrc = rawProfileImage.startsWith("/")
        ? `http://localhost:4000${rawProfileImage}`
        : rawProfileImage;
    const [profileImageFailed, setProfileImageFailed] = useState(false);

    React.useEffect(() => {
        setProfileImageFailed(false);
    }, [profileImageSrc]);

    return (
        <div
            className="flex h-screen overflow-hidden font-sans"
            style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.textColor
            }}
        >
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <main className="flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 relative">

                {/* Header */}
                <div className="sticky top-0 z-40 px-6 pt-4 pb-2">
                    <header
                        className="h-[72px] px-6 rounded-2xl backdrop-blur-md border shadow-sm flex items-center justify-between transition-all duration-300 relative"
                        style={{
                            backgroundColor: currentTheme.cardBg + 'E6', // Adding opacity
                            borderColor: currentTheme.borderColor
                        }}
                    >

                        {/* Left Section: Menu & Greeting */}
                        <div className="flex items-center gap-4 z-10">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="md:hidden hover:opacity-80"
                                style={{ color: currentTheme.textColor }}
                            >
                                <MdMenu size={24} />
                            </button>

                            <div className="hidden sm:block">
                                <TypewriterGreeting userName={displayUser?.username || "Admin"} />
                            </div>
                        </div>

                        {/* Center Section: Search - Absolutely Positioned */}
                        {/* Center Section: Search - Absolutely Positioned */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center border rounded-lg px-4 py-2 w-80 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400"
                            style={{
                                backgroundColor: currentTheme.background,
                                borderColor: currentTheme.borderColor
                            }}
                        >
                            <MdSearch className="text-lg opacity-50" style={{ color: currentTheme.textColor }} />
                            <input
                                type="text"
                                placeholder="Search system (Properties, Campaigns)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium placeholder-opacity-50 placeholder-[var(--placeholder-color)]"
                                style={{
                                    color: currentTheme.textColor,
                                    '--placeholder-color': currentTheme.textColor
                                } as React.CSSProperties}
                            />
                        </div>

                        {/* Right Section: Actions */}
                        <div className="flex items-center gap-3 z-10">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors" style={{ color: currentTheme.textColor }}>
                                <MdMail size={20} />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors relative" style={{ color: currentTheme.textColor }}>
                                <MdNotifications size={20} />
                                <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                            </button>
                            <div className="h-8 w-px mx-1 bg-black/10"></div>
                            <div
                                onClick={() => router.push("/settings#admin-profile")}
                                className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-md cursor-pointer hover:brightness-110"
                                style={{ backgroundColor: currentTheme.primary }}
                                title="Go to Admin Profile"
                            >
                                {profileImageSrc && !profileImageFailed ? (
                                    <img
                                        src={profileImageSrc}
                                        alt=""
                                        className="w-9 h-9 rounded-lg object-cover"
                                        onError={() => setProfileImageFailed(true)}
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>
                    </header>
                </div>

                {/* Page Content - with dynamic scrollbar color if possible or just standard content */}
                <div className="flex-1 min-h-0 px-6 py-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>


        </div >
    );
};

export default DashboardLayout;
