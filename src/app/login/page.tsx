"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
  MdCheckCircle,
  MdCopyright,
} from "react-icons/md";

// Internal imports
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { loginSchema, LoginFormData, loginDefaultValues } from "./utility";
import { loginService } from "@/services/auth.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { hasDashboardAccess } from "@/utils/authUtils";

export default function LoginPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { login: authLogin, isAuthenticated } = useAuth(); // Renamed to avoid naming conflict

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Fade-in effect on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: loginDefaultValues,
  });

  // Login Mutation
  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) =>
      loginService({
        username: data.username.trim(),
        password: data.password,
      }),
    onSuccess: (data: any) => {
      const user = data?.data?.user;

      // Access Control Logic - Use centralized utility function
      // if (hasDashboardAccess(user)) {
        console.log("Login success:", data);
        showSuccessToast(data.message || "Login successful!");

        if (user) {
          authLogin(user);
        }

        setTimeout(() => {
          router.replace("/dashboard");
        }, 1000);
      // } 
      // else {
      //   console.warn("Access Denied: User is not authorized", user);
      //   showErrorToast(
      //     "Access Denied: Only Super Admin or authorized users can login.",
      //   );

      //   // Clear any stored session data immediately
      //   if (typeof window !== "undefined") {
      //     localStorage.removeItem("accessToken");
      //     localStorage.removeItem("refreshToken");
      //     localStorage.removeItem("user");
      //     localStorage.removeItem("subscription");
      //   }
      // }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      const backendMessage =
        error?.message ||
        error?.error ||
        error?.details?.[0]?.message ||
        (Array.isArray(error?.message) ? error.message.join(", ") : "");

      showErrorToast(backendMessage || "Login failed. Please try again.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <div
      className="h-screen w-full flex relative overflow-hidden font-sans"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.textColor,
      }}
    >
      {/* Left Side - Visual & Branding */}
      <div
        className={`
                    hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white transition-colors duration-500
                `}
        style={{ backgroundColor: currentTheme.sidebarBg }}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/signIn.avif"
            alt="Modern Real Estate"
            className="w-full h-full object-cover transition-transform duration-10000 hover:scale-110 ease-linear"
          />
          {/* Dark Base Overlay */}
          <div className="absolute inset-0 bg-black/70" />
          {/* Theme Color Tint */}
          <div
            className="absolute inset-0 opacity-70 mix-blend-multiply"
            style={{ backgroundColor: currentTheme.primary }}
          />
        </div>

        {/* Logo & Brand */}
        <div className="relative z-10 animate-fade-in-down">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl backdrop-blur-sm border border-white/20"
              style={{ backgroundColor: currentTheme.primary }}
            >
              R
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Rasacode Admin
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg mb-12">
          <h1
            className="text-5xl font-bold leading-tight mb-6 tracking-tight"
            style={{ color: "#ffffff" }}
          >
            Manage Your Property <br />
            <span
              style={{ color: currentTheme.primary }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
            >
              Portfolio with Ease.
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Streamline your real estate operations with our advanced admin
            dashboard. Track listings, manage agents, and analyze performance in
            one place.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              "Real-time Analytics & Reporting",
              "Seamless Property Management",
              "Secure Agent & User Access",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-200">
                <MdCheckCircle
                  className="text-emerald-400 flex-shrink-0"
                  size={20}
                />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Copyright */}
        <div className="relative z-10 text-xs text-slate-400">
          <MdCopyright className="inline size-4" /> 2026 Rasacode Admin. All
          rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20 backdrop-blur-sm transition-colors duration-500"
        style={{ backgroundColor: currentTheme.background }}
      >
        <div
          className={`
                        w-full max-w-md p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border transition-all duration-700 transform
                        ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
                    `}
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.borderColor,
          }}
        >
          <div className="text-center mb-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                style={{ backgroundColor: currentTheme.primary }}
              >
                B
              </div>
            </div>

            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: currentTheme.headingColor }}
            >
              Welcome Back
            </h2>
            <p className="text-sm" style={{ color: currentTheme.textColor }}>
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email / Username Field */}
            <div className="space-y-1.5 group">
              <label
                className="text-xs font-semibold uppercase tracking-wide ml-1"
                style={{ color: currentTheme.textColor }}
              >
                Username
              </label>
              <div className="relative transition-all duration-300">
                <div
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors"
                  style={{
                    color:
                      focusedField === "username"
                        ? currentTheme.primary
                        : currentTheme.textColor,
                  }}
                >
                  <MdEmail size={20} />
                </div>
                <input
                  type="text" // Changed to text to allow username or email
                  {...register("username")}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl placeholder-inherit focus:outline-none focus:ring-1 transition-all duration-300 text-sm font-medium ${errors.username ? "border-red-500" : ""
                    }`}
                  style={
                    {
                      backgroundColor: currentTheme.background,
                      borderColor: errors.username
                        ? "#ef4444"
                        : focusedField === "username"
                          ? currentTheme.primary
                          : currentTheme.borderColor,
                      color: currentTheme.textColor,
                      "--tw-ring-color": currentTheme.primary,
                    } as React.CSSProperties
                  }
                  placeholder="Enter your username or email"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 group">
              <label
                className="text-xs font-semibold uppercase tracking-wide ml-1"
                style={{ color: currentTheme.textColor }}
              >
                Password
              </label>

              <div className="relative transition-all duration-300">
                <div
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  style={{ color: currentTheme.textColor }}
                >
                  <MdLock size={20} />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full pl-11 pr-11 py-3.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-1 transition-all duration-300 ${errors.password ? "border-red-500" : ""
                    }`}
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: errors.password
                      ? "#ef4444"
                      : focusedField === "password"
                        ? currentTheme.primary
                        : currentTheme.borderColor,
                    color: currentTheme.textColor,
                    "--tw-ring-color": currentTheme.primary,
                  } as React.CSSProperties}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  style={{ color: currentTheme.textColor }}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.password.message}
                </p>
              )}

              {/* Forgot Password below field */}
              <div className="text-right">
                <Link
                  href="#"
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: currentTheme.primary }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              style={
                {
                  backgroundColor: currentTheme.primary,
                  color: "#ffffff",
                  "--tw-ring-color": currentTheme.primary,
                } as React.CSSProperties
              }
            >
              {isSubmitting || mutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <MdArrowForward size={18} />
                </span>
              )}
            </button>

            {/* <div className="relative flex py-2 items-center">
              <div
                className="flex-grow border-t"
                style={{ borderColor: currentTheme.borderColor }}
              ></div>
              <span
                className="flex-shrink-0 mx-4 text-xs font-medium"
                style={{ color: currentTheme.textColor }}
              >
                Or continue with
              </span>
              <div
                className="flex-grow border-t"
                style={{ borderColor: currentTheme.borderColor }}
              ></div>
            </div>

            {/* Social Buttons /}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                }}
              >
                <RiGoogleFill className="w-5 h-5 text-red-500" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.borderColor,
                  color: currentTheme.textColor,
                }}
              >
                <RiAppleFill
                  className="w-5 h-5"
                  style={{ color: currentTheme.textColor }}
                />
                Apple
              </button>
            </div> */}
          </form>

          {/* Sign Up Link */}
          {/* <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: currentTheme.textColor }}>
              Don't have an account?{" "}
              <Link
                href="#"
                className="font-semibold hover:text-blue-700 transition-colors"
                style={{ color: currentTheme.primary }}
              >
                Create an account
              </Link>
            </p>
          </div> */}
        </div>
      </div>

      {/* Custom Animations Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
