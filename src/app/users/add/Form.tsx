"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import { createUserService } from "@/services/user.service";
import { toast } from "react-hot-toast";

export default function AddUserForm() {
    const { currentTheme } = useTheme();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        role: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await createUserService(formData);
            toast.success("User created successfully");
            router.push("/users");
        } catch (err: any) {
            const msg = err?.message ?? err?.detail ?? "Failed to create user. Please try again.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none focus:ring-2 text-sm";
    const inputStyle = {
        borderColor: currentTheme.borderColor,
        color: currentTheme.headingColor,
        // @ts-ignore
        "--tw-ring-color": currentTheme.primary + "40",
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Back */}
            <div>
                <button
                    onClick={() => router.push("/users")}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity font-bold text-sm"
                    style={{ color: currentTheme.textColor }}
                >
                    <MdArrowBack size={20} />
                    Back to Users
                </button>
            </div>

            {/* Title */}
            <div>
                <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: currentTheme.headingColor }}
                >
                    Add New User
                </h1>
                <p className="text-sm font-medium mt-1" style={{ color: currentTheme.textColor }}>
                    Fill in the details below to create a new user account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className="rounded-xl border p-6 space-y-5"
                    style={{
                        backgroundColor: currentTheme.cardBg,
                        borderColor: currentTheme.borderColor,
                    }}
                >
                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label
                                className="block text-sm font-bold mb-1.5"
                                style={{ color: currentTheme.textColor }}
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                placeholder="John"
                                className={inputClass}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label
                                className="block text-sm font-bold mb-1.5"
                                style={{ color: currentTheme.textColor }}
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                placeholder="Doe"
                                className={inputClass}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-1.5"
                            style={{ color: currentTheme.textColor }}
                        >
                            Username / Email
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="newuser@example.com"
                            className={inputClass}
                            style={inputStyle}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-1.5"
                            style={{ color: currentTheme.textColor }}
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className={inputClass + " pr-11"}
                                style={inputStyle}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                                style={{ color: currentTheme.textColor }}
                            >
                                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-1.5"
                            style={{ color: currentTheme.textColor }}
                        >
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                            placeholder="+919876543210"
                            className={inputClass}
                            style={inputStyle}
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label
                            className="block text-sm font-bold mb-1.5"
                            style={{ color: currentTheme.textColor }}
                        >
                            Role
                        </label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            placeholder="e.g. buyer"
                            className={inputClass}
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm font-medium text-red-500">{error}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => router.push("/users")}
                        className="px-5 py-2.5 rounded-lg border font-bold text-sm transition-colors hover:bg-black/5"
                        style={{
                            borderColor: currentTheme.borderColor,
                            color: currentTheme.textColor,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-lg text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: currentTheme.primary }}
                    >
                        {submitting ? "Creating…" : "Create User"}
                    </button>
                </div>
            </form>
        </div>
    );
}
