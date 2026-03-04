export interface PropertyFilters {
  status?: 'active' | 'inactive' | 'all' | 'pending' | 'approved' | 'rejected';
  search?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}

export interface PropertyData {
    id: string | number;
    status:string;
    created_by:number;
    reviewed_by:number |string;
    reviewed_at:string;
    rejection_reason:string;
    listing_date: string;
    listing_price: number;
    asking_price: number;
    street_address: string;
    unit_apt: string;
    city: string;
    state: string;
    zip_code: string;
    county: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    lot_size: string;
    year_built: number;
    garage_spaces: number;
    parking_spaces: number;
    roof_age: string;
    roof_status: string;
    interior_condition: string;
    exterior_paint_required: boolean;
    new_floor_required: boolean;
    kitchen_renovation_required: boolean;
    bathroom_renovation_required: boolean;
    drywall_repair_required: boolean;
    interior_paint_required: boolean;
    arv: number;
    repair_estimate: number;
    holding_costs: number;
    transaction_type: string;
    assignment_fee: number;
    property_description: string;
    seller_notes: string;
    // Rental / Listing Type Fields
    listing_type: "Sale" | "Rent" | "Both";
    rent_price?: number;
    rent_frequency?: "Monthly" | "Weekly" | "Daily" | "Yearly";
    security_deposit?: number;
    available_from?: string;
    lease_duration?: number; // months
    is_furnished?: boolean;
    pets_allowed?: boolean;
    // New Rental Fields
    application_fee?: number;
    move_in_fees?: number;
    smoking_policy?: "Allowed" | "Not Allowed" | "Outdoors Only";
    utilities_included?: string[];
    amenities?: string[];
    images: string[]; // Changed from (File | string)[] to string[] since API returns URLs
    created_at?: string; // Added from API response
    updated_at?: string;
    is_active?: boolean;
    creator?: {
        id: number | string;
        username: string;
        first_name: string;
        last_name: string;
    };
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface creator {
    id:number| string;
    username: string;
    first_name: string;
    last_name:string;
}

export interface PropertiesPayload {
    id?: string | number;
    listing_date?: string;
    listing_price?: number;
    asking_price?: number;
    street_address?: string;
    unit_apt?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    county?: string;
    property_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: string;
    year_built?: number;
    garage_spaces?: number;
    parking_spaces?: number;
    roof_age?: string;
    roof_status?: string;
    interior_condition?: string;
    exterior_paint_required?: boolean;
    new_floor_required?: boolean;
    kitchen_renovation_required?: boolean;
    bathroom_renovation_required?: boolean;
    drywall_repair_required?: boolean;
    interior_paint_required?: boolean;
    arv?: number;
    repair_estimate?: number;
    holding_costs?: number;
    transaction_type?: string;
    assignment_fee?: number;
    property_description?: string;
    seller_notes?: string;
    // Rental / Listing Type Fields
    listing_type?: "Sale" | "Rent" | "Both";
    rent_price?: number;
    rent_frequency?: "Monthly" | "Weekly" | "Daily" | "Yearly";
    security_deposit?: number;
    available_from?: string;
    lease_duration?: number;
    is_furnished?: boolean;
    pets_allowed?: boolean;
    // New Rental Fields
    application_fee?: number;
    move_in_fees?: number;
    smoking_policy?: "Allowed" | "Not Allowed" | "Outdoors Only";
    utilities_included?: string[];
    amenities?: string[];
    images?: (File | string)[]; // Keep as is for upload
    page?: number; // Added for pagination
    limit?: number; // Added for pagination
    search?: string; // Added for search functionality
    type?: string; // Added for filtering by listing type
    status?: 'active' | 'inactive' | 'all' | 'pending' | 'approved' | 'rejected'; // Added for status filtering
}

export interface PropertiesResponse {
    is_success: boolean;
    message: string;
    data: PropertyData[];
    pagination: Pagination;
}