import { PropertyData } from "@/types/properties.types";

const safeNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const safeString = (value: unknown, fallback = ""): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toTitleCase = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const API_BASE_URL = "http://localhost:4000";

const normalizeUrl = (value: string): string => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/uploads/rentals/${value}`;
};

const fileNameFromPath = (value: string) => {
  const normalized = value.split("?")[0].split("#")[0];
  const parts = normalized.split("/");
  return parts[parts.length - 1] || normalized;
};

export const getRentalImageCandidates = (value: string): string[] => {
  if (!value) return [];
  if (value.startsWith("http://") || value.startsWith("https://")) {
    const file = fileNameFromPath(value);
    return Array.from(
      new Set([
        value,
        `${API_BASE_URL}/uploads/rentals/${file}`,
        `${API_BASE_URL}/uploads/properties/${file}`,
        `${API_BASE_URL}/uploads/${file}`,
      ]),
    );
  }

  if (value.startsWith("/")) {
    const full = `${API_BASE_URL}${value}`;
    const file = fileNameFromPath(value);
    return Array.from(
      new Set([
        full,
        `${API_BASE_URL}/uploads/rentals/${file}`,
        `${API_BASE_URL}/uploads/properties/${file}`,
        `${API_BASE_URL}/uploads/${file}`,
      ]),
    );
  }

  return Array.from(
    new Set([
      `${API_BASE_URL}/uploads/rentals/${value}`,
      `${API_BASE_URL}/uploads/properties/${value}`,
      `${API_BASE_URL}/uploads/${value}`,
      `${API_BASE_URL}/${value}`,
    ]),
  );
};

const imageFromObject = (item: Record<string, unknown>): string => {
  const candidateKeys = ["url", "image_url", "imageUrl", "path", "src", "location"];
  for (const key of candidateKeys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) {
      return normalizeUrl(value.trim());
    }
  }
  return "";
};

const looksLikeImagePath = (value: string) => {
  const v = value.toLowerCase();
  return (
    v.includes("/upload") ||
    v.includes("/image") ||
    v.includes("cloudinary") ||
    v.endsWith(".jpg") ||
    v.endsWith(".jpeg") ||
    v.endsWith(".png") ||
    v.endsWith(".webp") ||
    v.endsWith(".gif")
  );
};

const extractImageUrlsDeep = (value: unknown, limit = 20): string[] => {
  const results: string[] = [];
  const stack: unknown[] = [value];
  const seen = new Set<unknown>();

  while (stack.length > 0 && results.length < limit) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    if (typeof current === "string") {
      const trimmed = current.trim();
      if (trimmed && looksLikeImagePath(trimmed)) {
        results.push(normalizeUrl(trimmed));
      }
      continue;
    }

    if (Array.isArray(current)) {
      current.forEach((item) => stack.push(item));
      continue;
    }

    if (typeof current === "object") {
      const obj = current as Record<string, unknown>;
      const direct = imageFromObject(obj);
      if (direct) {
        results.push(direct);
      }
      Object.values(obj).forEach((v) => stack.push(v));
    }
  }

  return Array.from(new Set(results)).filter(Boolean);
};

const extractImageUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return normalizeUrl(item.trim());
      if (item && typeof item === "object") return imageFromObject(item as Record<string, unknown>);
      return "";
    })
    .filter(Boolean);
};

const arrayFromUnknown = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (item == null ? "" : String(item).trim()))
      .filter(Boolean);
  }
  return [];
};

export const normalizeRentalStatus = (status?: string) => {
  const value = (status || "").toLowerCase();
  if (value === "pending") return "Pending";
  if (value === "rejected") return "Rejected";
  if (value === "inactive") return "Inactive";
  if (value === "expired") return "Expired";
  if (value === "cancelled") return "Cancelled";
  return "Active";
};

export const mapRentalToPropertyData = (rental: Record<string, unknown>): PropertyData => {
  const imageCandidates = [
    extractImageUrls(rental?.images),
    extractImageUrls(rental?.rental_images),
    extractImageUrls(rental?.media),
    extractImageUrls(rental?.photos),
    extractImageUrlsDeep(rental?.images),
    extractImageUrlsDeep(rental?.rental_images),
    extractImageUrlsDeep(rental?.media),
    extractImageUrlsDeep(rental?.photos),
    extractImageUrlsDeep(rental),
  ];
  const imageUrls = imageCandidates.find((list) => list.length > 0) || [];
  const rawId = rental?.id;
  const id = typeof rawId === "string" || typeof rawId === "number" ? rawId : safeString(rawId);
  return {
    id,
    created_by: safeNumber(rental?.created_by, 0),
    reviewed_by: safeString(rental?.reviewed_by),
    reviewed_at: safeString(rental?.reviewed_at),
    rejection_reason: safeString(rental?.rejection_reason),
    listing_date: safeString(rental?.created_at, new Date().toISOString().split("T")[0]),
    listing_price: safeNumber(rental?.monthly_rent, 0),
    asking_price: safeNumber(rental?.monthly_rent, 0),
    street_address: safeString(rental?.street_address),
    unit_apt: safeString(rental?.unit_apt),
    city: safeString(rental?.city),
    state: safeString(rental?.state),
    zip_code: safeString(rental?.zip_code),
    county: safeString(rental?.county),
    property_type: safeString(rental?.property_type),
    bedrooms: safeNumber(rental?.bedrooms, 0),
    bathrooms: safeNumber(rental?.bathrooms, 0),
    square_feet: safeNumber(rental?.square_feet, 0),
    lot_size: safeString(rental?.lot_size),
    year_built: safeNumber(rental?.year_built, 0),
    garage_spaces: safeNumber(rental?.garage_spaces, 0),
    parking_spaces: safeNumber(rental?.parking_spaces, 0),
    roof_age: safeString(rental?.roof_age),
    roof_status: safeString(rental?.roof_status),
    interior_condition: safeString(rental?.interior_condition, "Good"),
    exterior_paint_required: Boolean(rental?.exterior_paint_required),
    new_floor_required: Boolean(rental?.new_floor_required),
    kitchen_renovation_required: Boolean(rental?.kitchen_renovation_required),
    bathroom_renovation_required: Boolean(rental?.bathroom_renovation_required),
    drywall_repair_required: Boolean(rental?.drywall_repair_required),
    interior_paint_required: Boolean(rental?.interior_paint_required),
    arv: 0,
    repair_estimate: 0,
    holding_costs: 0,
    transaction_type: "Rent",
    assignment_fee: 0,
    property_description: safeString(rental?.notes),
    seller_notes: safeString(rental?.notes),
    listing_type: "Rent",
    rent_price: safeNumber(rental?.monthly_rent, 0),
    rent_frequency:
      (safeString(rental?.rent_frequency).toLowerCase() === "weekly"
        ? "Weekly"
        : safeString(rental?.rent_frequency).toLowerCase() === "annually"
          ? "Yearly"
          : safeString(rental?.rent_frequency).toLowerCase() === "bi-weekly"
            ? "Weekly"
            : "Monthly"),
    security_deposit: safeNumber(rental?.security_deposit, 0),
    start_date: safeString(rental?.start_date),
    end_date: safeString(rental?.end_date),

    available_from: safeString(rental?.available_from),
    lease_duration: safeNumber(rental?.lease_duration_months, 0),
    is_furnished: Boolean(rental?.is_furnished),
    pets_allowed: Boolean(rental?.pets_allowed),
    application_fee: safeNumber(rental?.application_fee, 0),
    move_in_fees: safeNumber(rental?.move_in_fees, 0),
    smoking_policy:
      safeString(rental?.smoking_policy).toLowerCase() === "allowed"
        ? "allowed"
        : safeString(rental?.smoking_policy).toLowerCase() === "designated_areas"
          ? "designated_areas"
          : "not_allowed",
    utilities_included: arrayFromUnknown(rental?.utilities_included).map((v) =>
      toTitleCase(v.replaceAll("_", " ")),
    ),
    amenities: arrayFromUnknown(rental?.amenities).map((v) =>
      toTitleCase(v.replaceAll("_", " ")),
    ),
    images: imageUrls,
    created_at: safeString(rental?.created_at) || undefined,
    updated_at: safeString(rental?.updated_at) || undefined,
    status: normalizeRentalStatus(safeString(rental?.status)),
  };
};

const splitList = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toSnake = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");

const mapRentFrequency = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "weekly") return "weekly";
  if (normalized === "yearly") return "annually";
  if (normalized === "daily") return "weekly";
  return "monthly";
};

const mapSmokingPolicy = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "allowed") return "allowed";
  if (normalized === "designated_areas" || normalized === "outdoors only") return "designated_areas";
  return "not_allowed";
};

export const mapPropertyFormToRentalPayload = (source: FormData, isUpdate: boolean = false): FormData => {
  const output = new FormData();
  const scalarMap: Record<string, string> = {
    rent_price: "monthly_rent",
    security_deposit: "security_deposit",
    street_address: "street_address",
    unit_apt: "unit_apt",
    city: "city",
    state: "state",
    zip_code: "zip_code",
    county: "county",
    property_type: "property_type",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    square_feet: "square_feet",
    lot_size: "lot_size",
    year_built: "year_built",
    garage_spaces: "garage_spaces",
    parking_spaces: "parking_spaces",
    roof_age: "roof_age",
    roof_status: "roof_status",
    interior_condition: "interior_condition",
    exterior_paint_required: "exterior_paint_required",
    new_floor_required: "new_floor_required",
    kitchen_renovation_required: "kitchen_renovation_required",
    bathroom_renovation_required: "bathroom_renovation_required",
    drywall_repair_required: "drywall_repair_required",
    interior_paint_required: "interior_paint_required",
    start_date: "start_date",
    end_date: "end_date",
    available_from: "available_from",
    lease_duration: "lease_duration_months",
    application_fee: "application_fee",
    move_in_fees: "move_in_fees",
    seller_notes: "notes",
    is_furnished: "is_furnished",
    pets_allowed: "pets_allowed",
  };

  const excludedOnUpdate = [
    "interior_condition",
    "exterior_paint_required",
    "new_floor_required",
    "kitchen_renovation_required",
    "bathroom_renovation_required",
    "drywall_repair_required",
    "interior_paint_required",
  ];

  let availableFrom = "";

  source.forEach((value, key) => {
    if (key === "images" && value instanceof File) {
      output.append("images", value);
      return;
    }

    if (key === "rent_frequency") {
      output.append("rent_frequency", mapRentFrequency(String(value)));
      return;
    }

    if (key === "smoking_policy") {
      output.append("smoking_policy", mapSmokingPolicy(String(value)));
      return;
    }

    if (key === "utilities_included") {
      splitList(String(value)).forEach((item) =>
        output.append("utilities_included", toSnake(item)),
      );
      return;
    }

    if (key === "amenities") {
      splitList(String(value)).forEach((item) => output.append("amenities", toSnake(item)));
      return;
    }

    const mappedKey = scalarMap[key];
    if (mappedKey) {
      if (isUpdate && excludedOnUpdate.includes(mappedKey)) {
        return;
      }
      output.append(mappedKey, String(value));
      if (mappedKey === "available_from") {
        availableFrom = String(value).trim();
      }
    }
  });

  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0];

  const finalAvailableFrom = availableFrom || today;

  output.set("available_from", finalAvailableFrom);
  output.set("start_date", finalAvailableFrom);

  if (!output.has("end_date") || !output.get("end_date") || String(output.get("end_date")).trim() === "") {
    output.set("end_date", nextYear);
  }

  return output;
};