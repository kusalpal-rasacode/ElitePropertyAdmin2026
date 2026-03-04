"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MdTimer, MdWarningAmber } from "react-icons/md";

import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";

const IDLE_TIMEOUT_MS = 15* 60 * 1000;
const WARNING_WINDOW_MS = 60 * 1000;

export default function IdleLogoutGuard() {
    const router = useRouter();
    const pathname = usePathname();
    const { logout, isAuthenticated } = useAuth();
    const { currentTheme } = useTheme();

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const lastActivityRef = useRef<number>(0);
    const isLoggingOutRef = useRef(false);

    const resetActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        setCountdown(60);
    }, []);

    const executeLogout = useCallback(() => {
        if (isLoggingOutRef.current) return;

        isLoggingOutRef.current = true;
        logout();
        router.replace("/login");
    }, [logout, router]);

    useEffect(() => {
        if (!isAuthenticated || pathname === "/login") return;
        if (lastActivityRef.current === 0) {
            lastActivityRef.current = Date.now();
        }

        const activityEvents: Array<keyof WindowEventMap> = [
            // "mousemove",
            // "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        const handleActivity = () => {
            if (!isLoggingOutRef.current) {
                resetActivity();
            }
        };

        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, handleActivity, { passive: true });
        });

        const intervalId = window.setInterval(() => {
            const elapsed = Date.now() - lastActivityRef.current;
            const remaining = IDLE_TIMEOUT_MS - elapsed;

            if (remaining <= 0) {
                setShowWarning(false);
                executeLogout();
                return;
            }

            if (remaining <= WARNING_WINDOW_MS) {
                setShowWarning(true);
                setCountdown(Math.ceil(remaining / 1000));
                return;
            }

            setShowWarning(false);
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, handleActivity);
            });
        };
    }, [executeLogout, isAuthenticated, pathname, resetActivity]);

    useEffect(() => {
        if (!isAuthenticated) {
            isLoggingOutRef.current = false;
            lastActivityRef.current = 0;
            const timeoutId = window.setTimeout(() => {
                setShowWarning(false);
                setCountdown(60);
            }, 0);

            return () => {
                window.clearTimeout(timeoutId);
            };
        }
    }, [isAuthenticated]);

    if (!isAuthenticated || pathname === "/login") return null;

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-black/40" />

                    <motion.div
                        className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6"
                        style={{
                            backgroundColor: currentTheme.cardBg,
                            borderColor: currentTheme.borderColor,
                            color: currentTheme.textColor,
                        }}
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 12 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: currentTheme.primary + "22" }}
                            >
                                <MdWarningAmber size={22} style={{ color: currentTheme.primary }} />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold">Session Timeout Warning</h3>
                                <p className="text-sm mt-1 opacity-80">
                                    You will be logged out due to inactivity.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl px-4 py-3 border flex items-center justify-between"
                            style={{ borderColor: currentTheme.borderColor }}
                        >
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <MdTimer size={18} />
                                Auto logout in
                            </span>
                            <span className="text-2xl font-bold tabular-nums" style={{ color: currentTheme.primary }}>
                                {countdown}s
                            </span>
                        </div>

                        <div className="mt-5 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={executeLogout}
                                className="px-4 py-2 rounded-lg text-sm font-semibold border"
                                style={{
                                    borderColor: currentTheme.borderColor,
                                    color: currentTheme.textColor,
                                    backgroundColor: currentTheme.background,
                                }}
                            >
                                Logout now
                            </button>
                            <button
                                type="button"
                                onClick={resetActivity}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                                style={{ backgroundColor: currentTheme.primary }}
                            >
                                Stay logged in
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
