import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const accessToken = request.cookies.get("accessToken")?.value;
    const joinedPath = path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/${joinedPath}${searchParams ? `?${searchParams}` : ""}`;

    const headers: Record<string, string> = {};

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const contentType = request.headers.get("content-type") ?? "";
    let body: BodyInit | undefined;

    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
        if (contentType.includes("multipart/form-data")) {
            // Let fetch set the correct multipart boundary automatically
            body = await request.formData();
        } else {
            const text = await request.text();
            if (text) {
                body = text;
                headers["Content-Type"] = contentType || "application/json";
            }
        }
    }

    try {
        const res = await fetch(url, {
            method: request.method,
            headers,
            body,
        });

        const responseText = await res.text();
        let responseData: unknown;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        return NextResponse.json(responseData, { status: res.status });
    } catch {
        return NextResponse.json({ message: "Proxy error" }, { status: 500 });
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
