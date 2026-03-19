const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".avif",
];

const IMAGE_KEYS = [
  "profile_image",
  "profileImage",
  "avatar",
  "image",
  "photo",
  "url",
  "secure_url",
  "secureUrl",
  "image_url",
  "imageUrl",
  "path",
  "src",
  "location",
  "filename",
  "file_name",
  "fileName",
];

const isImageLikeString = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("//") ||
    normalized.startsWith("/") ||
    normalized.includes("/upload") ||
    normalized.includes("/uploads/") ||
    normalized.includes("cloudinary") ||
    IMAGE_EXTENSIONS.some((extension) => normalized.includes(extension))
  );
};

const extractImageValue = (
  value: unknown,
  seen: Set<unknown> = new Set(),
): string => {
  if (!value) return "";

  if (typeof value === "string") {
    return isImageLikeString(value) ? value.trim() : "";
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = extractImageValue(item, seen);
      if (result) return result;
    }
    return "";
  }

  if (typeof value !== "object" || seen.has(value)) {
    return "";
  }

  seen.add(value);
  const record = value as Record<string, unknown>;

  for (const key of IMAGE_KEYS) {
    if (!(key in record)) continue;
    const result = extractImageValue(record[key], seen);
    if (result) return result;
  }

  for (const child of Object.values(record)) {
    const result = extractImageValue(child, seen);
    if (result) return result;
  }

  return "";
};

const fileNameFromPath = (value: string) => {
  const normalized = value.split("?")[0].split("#")[0];
  const parts = normalized.split("/");
  return parts[parts.length - 1] || normalized;
};

export const getUserProfileImageCandidates = (value: unknown): string[] => {
  const raw = extractImageValue(value);
  if (!raw) return [];

  const fileName = fileNameFromPath(raw);
  const trimmed = raw.replace(/^\/+/, "");

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return Array.from(
      new Set([
        raw,
        `${API_BASE_URL}/uploads/users/${fileName}`,
        `${API_BASE_URL}/uploads/${fileName}`,
      ]),
    );
  }

  if (raw.startsWith("//")) {
    return [`https:${raw}`];
  }

  if (raw.startsWith("/")) {
    return Array.from(
      new Set([
        `${API_BASE_URL}${raw}`,
        `${API_BASE_URL}/uploads/users/${fileName}`,
        `${API_BASE_URL}/uploads/${fileName}`,
      ]),
    );
  }

  if (trimmed.startsWith("uploads/")) {
    return Array.from(
      new Set([
        `${API_BASE_URL}/${trimmed}`,
        `${API_BASE_URL}/uploads/users/${fileName}`,
        `${API_BASE_URL}/uploads/${fileName}`,
      ]),
    );
  }

  if (trimmed.includes("/")) {
    return Array.from(
      new Set([
        `${API_BASE_URL}/${trimmed}`,
        `${API_BASE_URL}/uploads/${trimmed}`,
        `${API_BASE_URL}/uploads/users/${fileName}`,
        `${API_BASE_URL}/uploads/${fileName}`,
      ]),
    );
  }

  return Array.from(
    new Set([
      `${API_BASE_URL}/uploads/users/${trimmed}`,
      `${API_BASE_URL}/uploads/${trimmed}`,
      `${API_BASE_URL}/${trimmed}`,
    ]),
  );
};

export const getUserProfileImage = (value: unknown): string =>
  getUserProfileImageCandidates(value)[0] || "";
