import * as yup from "yup";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

// TypeScript type for form data
export interface PropertyFormData {
  listing_type: "Sale" | "Rent" | "Both";
  listing_date?: string;
  listing_price: string | number;
  asking_price: string | number;
  street_address: string;
  unit_apt: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  property_type: string;
  bedrooms: string | number;
  bathrooms: string | number;
  square_feet: string | number;
  lot_size: string;
  year_built: string | number;
  garage_spaces: string | number;
  parking_spaces: string | number;
  roof_age: string;
  roof_status: string;
  interior_condition: string;
  exterior_paint_required: boolean;
  new_floor_required: boolean;
  kitchen_renovation_required: boolean;
  bathroom_renovation_required: boolean;
  drywall_repair_required: boolean;
  interior_paint_required: boolean;
  arv: string | number;
  repair_estimate: string | number;
  holding_costs: string | number;
  transaction_type: string;
  assignment_fee: string | number;
  property_description: string;
  seller_notes: string;
  // Rental Fields
  rent_price?: string | number;
  rent_frequency?: "Monthly" | "Weekly" | "Daily" | "Yearly";
  security_deposit?: string | number;
  available_from?: string;
  lease_duration?: string | number;
  is_furnished?: boolean;
  pets_allowed?: boolean;
  // New Rental Fields
  application_fee?: string | number;
  move_in_fees?: string | number;
  smoking_policy?: "Allowed" | "Not Allowed" | "Outdoors Only";
  utilities_included?: string[];
  amenities?: string[];
  images?: (File | string)[];
}

// Dropdown Options
export const propertyTypeOptions = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Land", label: "Land" },
  { value: "Multi-Family", label: "Multi-Family" },
  { value: "Single-Family", label: "Single-Family" },
];

export const roofStatusOptions = [
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
  { value: "Needs Replacement", label: "Needs Replacement" },
];

export const interiorConditionOptions = [
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
];

export const transactionTypeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Financing", label: "Financing" },
  { value: "Assignment", label: "Assignment" },
  { value: "Wholesale", label: "Wholesale" },
];

export const listingTypeOptions = [
  { value: "Sale", label: "For Sale" },
  { value: "Rent", label: "For Rent" },
  { value: "Both", label: "Both (Sale & Rent)" },
];

export const rentFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-Wekly" },
  { value: "annually", label: "Annually" },
];

export const utilityOptions = [
  "Water",
  "Electricity",
  "Gas",
  "Internet",
  "Cable",
  "Trash",
  "Sewer",
  "Heat",
  "Air Conditioning",
];

export const amenityOptions = [
  "Pool",
  "Gym",
  "Elevator",
  "Parking",
  "Laundry In-Unit",
  "Laundry On-Site",
  "Air Conditioning",
  "Dishwasher",
  "Balcony",
  "Garden",
  "Security System",
  "Doorman",
  "Wheelchair Access",
  "Fireplace",
  "Hardwood Floors",
  "Walk-in Closet",
  "High Speed Internet Access",
  "Smart Home Features",
];

export const smokingPolicyOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "not_allowed", label: "Not Allowed" },
  { value: "designated_areas", label: "Designated Areas" },
];

// Function to get initial form data
export const getInitialFormData = (): PropertyFormData => ({
  listing_type: "Sale",
  street_address: "",
  unit_apt: "",
  city: "",
  state: "",
  zip_code: "",
  county: "",
  property_type: "",
  bedrooms: "",
  bathrooms: "",
  square_feet: "",
  lot_size: "",
  year_built: "",
  garage_spaces: "",
  parking_spaces: "",
  roof_age: "",
  roof_status: "",
  interior_condition: "",
  exterior_paint_required: false,
  new_floor_required: false,
  kitchen_renovation_required: false,
  bathroom_renovation_required: false,
  drywall_repair_required: false,
  interior_paint_required: false,
  listing_price: "",
  asking_price: "",
  arv: "",
  repair_estimate: "",
  holding_costs: "",
  assignment_fee: "",
  transaction_type: "",
  property_description: "",
  seller_notes: "",
  rent_price: "",
  rent_frequency: "Monthly",
  security_deposit: "",
  available_from: "",
  lease_duration: "",
  is_furnished: false,
  pets_allowed: false,
  images: [],
  application_fee: "",
  move_in_fees: "",
  smoking_policy: "Not Allowed",
  utilities_included: [],
  amenities: [],
});

// Function to convert API property data to form data
export const propertyToFormData = (property: any): PropertyFormData => ({
  listing_type: property.listing_type || "Sale",
  street_address: property.street_address || "",
  unit_apt: property.unit_apt || "",
  city: property.city || "",
  state: property.state || "",
  zip_code: property.zip_code || "",
  county: property.county || "",
  property_type: property.property_type || "",
  bedrooms: property.bedrooms?.toString() || "",
  bathrooms: property.bathrooms?.toString() || "",
  square_feet: property.square_feet?.toString() || "",
  lot_size: property.lot_size || "",
  year_built: property.year_built?.toString() || "",
  garage_spaces: property.garage_spaces?.toString() || "",
  parking_spaces: property.parking_spaces?.toString() || "",
  roof_age: property.roof_age || "",
  roof_status: property.roof_status || "",
  interior_condition: property.interior_condition || "",
  exterior_paint_required: property.exterior_paint_required || false,
  new_floor_required: property.new_floor_required || false,
  kitchen_renovation_required: property.kitchen_renovation_required || false,
  bathroom_renovation_required: property.bathroom_renovation_required || false,
  drywall_repair_required: property.drywall_repair_required || false,
  interior_paint_required: property.interior_paint_required || false,
  listing_price: property.listing_price?.toString() || "",
  asking_price: property.asking_price?.toString() || "",
  arv: property.arv?.toString() || "",
  repair_estimate: property.repair_estimate?.toString() || "",
  holding_costs: property.holding_costs?.toString() || "",
  assignment_fee: property.assignment_fee?.toString() || "",
  transaction_type: property.transaction_type || "",
  property_description: property.property_description || "",
  seller_notes: property.seller_notes || "",
  rent_price: property.rent_price?.toString() || "",
  rent_frequency: property.rent_frequency || "Monthly",
  security_deposit: property.security_deposit?.toString() || "",
  available_from: property.available_from ? property.available_from.split("T")[0] : "",
  lease_duration: property.lease_duration?.toString() || "",
  is_furnished: property.is_furnished || false,
  pets_allowed: property.pets_allowed || false,
  images: [],
  application_fee: property.application_fee?.toString() || "",
  move_in_fees: property.move_in_fees?.toString() || "",
  smoking_policy: property.smoking_policy || "Not Allowed",
  utilities_included: property.utilities_included || [],
  amenities: property.amenities || [],
});

// Property Listing Validation Schema (if you want to use yup validation)
export const propertyListingSchema = yup.object({
  // Listing Information
  listing_date: yup.string().optional(),

  // Address Information
  street_address: yup.string().required("Street address is required"),
  unit_apt: yup.string().required("Unit/Apt is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zip_code: yup
    .string()
    .required("ZIP code is required")
    .matches(/^[A-Za-z0-9\- ]{3,10}$/, "Invalid postal code"),
  county: yup.string().required("County is required"),

  // Property Details
  property_type: yup.string().required("Property type is required"),
  bedrooms: yup
    .number()
    .typeError("Bedrooms must be a number")
    .required("Bedrooms is required")
    .min(0, "Must be 0 or greater"),
  bathrooms: yup
    .number()
    .typeError("Bathrooms must be a number")
    .required("Bathrooms is required")
    .min(0, "Must be 0 or greater"),
  square_feet: yup
    .number()
    .typeError("Square feet must be a number")
    .required("Square feet is required")
    .min(1, "Must be greater than 0"),
  lot_size: yup.string().required("Lot size is required"),
  year_built: yup
    .number()
    .typeError("Year built must be a number")
    .required("Year built is required")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  garage_spaces: yup
    .number()
    .typeError("Garage spaces must be a number")
    .min(0, "Must be 0 or greater")
    .required("Garage spaces is required")
    .transform((v, o) => (o === "" ? null : v)),
  parking_spaces: yup
    .number()
    .typeError("Parking spaces must be a number")
    .min(0, "Must be 0 or greater")
    .required("Parking spaces is required")
    .transform((v, o) => (o === "" ? null : v)),

  // Condition Information
  roof_age: yup.string().required("Roof age is required"),
  roof_status: yup.string().required("Roof status is required"),
  interior_condition: yup.string().required("Interior condition is required"),
  exterior_paint_required: yup.boolean().required("Exterior paint is required"),
  new_floor_required: yup.boolean().required("New floor is required"),
  kitchen_renovation_required: yup
    .boolean()
    .required("Kitchen renovation is required"),
  bathroom_renovation_required: yup
    .boolean()
    .required("Bathroom renovation is required"),
  drywall_repair_required: yup.boolean().required("Drywall repair is required"),
  interior_paint_required: yup.boolean().required("Interior paint is required"),

  // Financial Information
  listing_price: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Sale" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Listing price must be a number")
          .required("Listing price is required")
          .min(10000, "Price must be greater than 10000"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  asking_price: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Sale" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Asking price must be a number")
          .required("Asking price is required")
          .min(10000, "Price must be greater than 10000"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  arv: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Sale" || val === "Both",
      then: (schema) =>
        schema
          .typeError("ARV must be a number")
          .required("ARV is required")
          .min(10000, "Must be 10000 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  repair_estimate: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Sale" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Repair estimate must be a number")
          .required("Repair estimate is required")
          .min(100, "Must be 100 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  holding_costs: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Sale" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Holding costs must be a number")
          .required("Holding costs is required")
          .min(100, "Must be 100 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  transaction_type: yup.string().when("listing_type", {
    is: (val: string) => val === "Sale" || val === "Both",
    then: (schema) => schema.required("Transaction type is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  assignment_fee: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Sale" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Assignment fee must be a number")
          .required("Assignment fee is required")
          .min(100, "Must be 100 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  // Rental Specific Validation
  rent_price: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Rent" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Rent price must be a number")
          .required("Rent price is required")
          .min(1, "Price must be greater than 0"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  rent_frequency: yup.string().when("listing_type", {
    is: (val: string) => val === "Rent" || val === "Both",
    then: (schema) => schema.required("Frequency is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  security_deposit: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Rent" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Security deposit must be a number")
          .min(0, "Must be 0 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  available_from: yup.string().when("listing_type", {
    is: (val: string) => val === "Rent" || val === "Both",
    then: (schema) => schema.required("Available date is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  lease_duration: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Rent" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Lease duration must be a number")
          .min(1, "Must be at least 1 month"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  // Additional Information
  property_description: yup.string().nullable().notRequired(),
  seller_notes: yup.string().nullable().notRequired(),

  images: yup
    .array()
    .of(
      yup
        .mixed<File | string>()
        .test(
          "file-or-url",
          "Invalid image",
          (value) => typeof value === "string" || value instanceof File,
        ),
    )
    .nullable(),

  // Additional Rental Validation
  application_fee: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Rent" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Application fee must be a number")
          .min(0, "Must be 0 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  move_in_fees: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("listing_type", {
      is: (val: string) => val === "Rent" || val === "Both",
      then: (schema) =>
        schema
          .typeError("Move-in fees must be a number")
          .min(0, "Must be 0 or greater"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  smoking_policy: yup.string().when("listing_type", {
    is: (val: string) => val === "Rent" || val === "Both",
    then: (schema) => schema.required("Smoking policy is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  utilities_included: yup.array().of(yup.string()),
  amenities: yup.array().of(yup.string()),
});
