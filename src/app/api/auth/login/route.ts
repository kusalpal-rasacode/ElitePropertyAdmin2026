import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        const accessToken =
            data?.data?.tokens?.accessToken ??
            data?.data?.tokens?.access_token ??
            data?.tokens?.accessToken ??
            data?.tokens?.access_token ??
            data?.accessToken ??
            data?.access_token;

        const refreshToken =
            data?.data?.tokens?.refreshToken ??
            data?.data?.tokens?.refresh_token ??
            data?.tokens?.refreshToken ??
            data?.tokens?.refresh_token ??
            data?.refreshToken ??
            data?.refresh_token;

        const response = NextResponse.json(data);

        if (accessToken) {
            response.cookies.set("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 15, // 15 minutes
            });
        }

        if (refreshToken) {
            response.cookies.set("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
        }

        return response;
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
