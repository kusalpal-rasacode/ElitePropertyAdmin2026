import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json({ message: "No refresh token" }, { status: 401 });
        }

        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await res.json();

        if (!res.ok) {
            const response = NextResponse.json(data, { status: res.status });
            response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
            response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
            return response;
        }

        const newAccessToken =
            data?.data?.tokens?.accessToken ??
            data?.data?.tokens?.access_token ??
            data?.data?.accessToken ??
            data?.data?.access_token ??
            data?.tokens?.accessToken ??
            data?.tokens?.access_token ??
            data?.accessToken ??
            data?.access_token;

        if (!newAccessToken) {
            return NextResponse.json(
                { message: "Token refresh failed" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({ accessToken: newAccessToken });

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15, // 15 minutes
        });

        return response;
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
