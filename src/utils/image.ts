export const getImageUrl = (path: string | undefined | null): string => {
    if (!path) return "/placeholder.png"; // Fallback if no path

    if (path.startsWith("http") || path.startsWith("https") || path.startsWith("blob:")) {
        return path;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    // Remove trailing slash from baseUrl to avoid double slashes
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    // Remove leading slash from path
    let cleanPath = path.replace(/^\/+/, "");

    // Replace backslashes with forward slashes (fix for Windows paths)
    cleanPath = cleanPath.replace(/\\/g, "/");

    // Encode each segment to handle spaces and special characters
    cleanPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');

    return `${cleanBaseUrl}/${cleanPath}`;
};
