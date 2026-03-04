import * as yup from "yup";

export const campaignScheme = yup.object({
    name: yup.string().required("Campaign name is required"),

    campaign_type: yup.string().required("Campaign type is required"),

    channel: yup
        .array()
        .of(yup.string().required())
        .min(1, "At least one channel is required")
        .required("Channel is required"),

    scheduled_start_date: yup.string().required("Start date is required"),

    scheduled_end_date: yup.string().required("End date is required"),

    scheduled_start_time: yup.string().required("Start time is required"),

    scheduled_end_time: yup.string().required("End time is required"),

    subject_line: yup.string().nullable().required("Subject line is required"),

    email_content: yup.string().nullable().required("Email content is required"),

    status: yup.string().required("Status is required"),

    use_ai_personalization: yup.boolean().notRequired(),

    geographic_scope_type: yup.string().nullable().notRequired(),

    property_type: yup.string().nullable().notRequired(),

    min_price: yup
        .number()
        .typeError("Min price must be a number")
        .min(1000, "Minimum price must be at least $1,000")
        .required("Minimum price is required")
        .transform((v, o) => (o === "" ? null : v)),

    max_price: yup
        .number()
        .typeError("Max price must be a number")
        .max(50000000, "Maximum price cannot exceed $50,000,000")
        .moreThan(yup.ref('min_price'), "Maximum price must be greater than minimum price")
        .required("Maximum price is required")
        .transform((v, o) => (o === "" ? null : v)),

    distress_indicators: yup.array().of(yup.string().required()).nullable().notRequired(),

    last_qualification: yup.string().nullable().notRequired(),

    age_range: yup.string().optional(),

    ethnicity: yup.string().optional(),

    salary_range: yup.string().optional(),

    marital_status: yup.string().optional(),

    employment_status: yup.string().optional(),

    home_ownership_status: yup.string().optional(),

    buyer_country: yup.string().nullable().notRequired(),

    buyer_state: yup.string().nullable().notRequired(),

    buyer_counties: yup.string().nullable().notRequired(),

    buyer_city: yup.string().nullable().notRequired(),

    buyer_districts: yup.string().nullable().notRequired(),

    buyer_parish: yup.string().nullable().notRequired(),

    seller_country: yup.string().nullable().notRequired(),

    seller_state: yup.string().nullable().notRequired(),

    seller_counties: yup.string().nullable().notRequired(),

    seller_city: yup.string().nullable().notRequired(),

    seller_districts: yup.string().nullable().notRequired(),

    seller_parish: yup.string().nullable().notRequired(),

    seller_keywords: yup.string().nullable().notRequired(),
});

export type CampaignAddData = yup.InferType<typeof campaignScheme>;

// Default Form Schema
export const CampaignAddDataDefaultValues: CampaignAddData = {
    name: "",
    campaign_type: "",
    channel: [],
    scheduled_start_date: "",
    scheduled_end_date: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    subject_line: "",
    email_content: "",
    status: "",
    use_ai_personalization: false,
    geographic_scope_type: "",
    property_type: "",
    min_price: 0,
    max_price: 0,
    distress_indicators: [],
    last_qualification: "",
    age_range: "",
    ethnicity: "",
    salary_range: "",
    marital_status: "",
    employment_status: "",
    home_ownership_status: "",
    buyer_country: "",
    buyer_state: "",
    buyer_counties: "",
    buyer_city: "",
    buyer_districts: "",
    buyer_parish: "",
    seller_country: "",
    seller_state: "",
    seller_counties: "",
    seller_city: "",
    seller_districts: "",
    seller_parish: "",
    seller_keywords: "",
};

// Dropdown Options
export const campaignTypesOptions = [
    { value: "seller_finder", label: "Seller Finder" },
    { value: "buyer_finder", label: "Buyer Finder" },
    { value: "distressed_property", label: "Distressed Property" },
    { value: "wholesale", label: "Wholesale" },
];

export const channelsOptions = [
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "direct_mail", label: "Direct Mail" },
    { value: "social_media", label: "Social Media" },
];

export const statusesOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export const geographicScopesOptions = [
    { value: "country", label: "Country" },
    { value: "state", label: "State" },
    { value: "city", label: "City" },
    { value: "zip_code", label: "Zip Code" },
];

export const propertyTypesOptions = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
    { value: "Land", label: "Land" },
    { value: "Multi-Family", label: "Multi-Family" },
];

export const distressIndicatorsOptions = [
    { value: "foreclosure", label: "Foreclosure" },
    { value: "tax_lien", label: "Tax Lien" },
    { value: "pre_foreclosure", label: "Pre-Foreclosure" },
    { value: "bankruptcy", label: "Bankruptcy" },
    { value: "probate", label: "Probate" },
    { value: "divorce", label: "Divorce" },
];

export const qualificationStatusesOptions = [
    { value: "pre_qualified", label: "Pre-Qualified" },
    { value: "pre_approved", label: "Pre-Approved" },
    { value: "not_qualified", label: "Not Qualified" },
];

export const ageRangesOptions = [
    { value: "18-24", label: "18-24" },
    { value: "25-35", label: "25-35" },
    { value: "36-45", label: "36-45" },
    { value: "46-55", label: "46-55" },
    { value: "56-65", label: "56-65" },
    { value: "65+", label: "65+" },
];

export const ethnicitiesOptions = [
    { value: "asian", label: "Asian" },
    { value: "black", label: "Black" },
    { value: "hispanic", label: "Hispanic" },
    { value: "white", label: "White" },
    { value: "other", label: "Other" },
];

export const salaryRangesOptions = [
    { value: "0-25000", label: "$0 - $25,000" },
    { value: "25000-50000", label: "$25,000 - $50,000" },
    { value: "50000-75000", label: "$50,000 - $75,000" },
    { value: "75000-100000", label: "$75,000 - $100,000" },
    { value: "100000+", label: "$100,000+" },
];

export const maritalStatusesOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
];

export const employmentStatusesOptions = [
    { value: "employed", label: "Employed" },
    { value: "self_employed", label: "Self-Employed" },
    { value: "retired", label: "Retired" },
];

export const homeOwnershipStatusesOptions = [
    { value: "own_home", label: "Own Home" },
    { value: "rent_home", label: "Rent_Home" },
];
