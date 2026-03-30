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
  start_date?: string;
  end_date?: string;
    available_from?: string;
    lease_duration?: number; // months
    is_furnished?: boolean;
    pets_allowed?: boolean;
    // New Rental Fields
    application_fee?: number;
    move_in_fees?: number;
    smoking_policy?: "allowed" | "not_allowed" | "designated_areas";
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
        phone_number?: string;
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
    phone_number?: string;
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
    start_date?: string;
    end_date?: string;
    available_from?: string;
    lease_duration?: number;
    is_furnished?: boolean;
    pets_allowed?: boolean;
    // New Rental Fields
    application_fee?: number;
    move_in_fees?: number;
    smoking_policy?: "allowed" | "not_allowed" | "designated_areas";
    utilities_included?: string[];
    amenities?: string[];
    images?: (File | string)[]; // Keep as is for upload
    page?: number; // Added for pagination
    limit?: number; // Added for pagination
    search?: string; // Added for search functionality
    type?: string; // Added for filtering by listing type
    status?: 'active' | 'inactive' | 'all' | 'pending' | 'approved' | 'rejected'; // Added for status filtering
    created_by?: creator[]; // Added for tracking who created the listing
}

export interface PropertiesResponse {
    is_success: boolean;
    message: string;
    data: PropertyData[];
    pagination: Pagination;
}
export type ActiveTab = "all" | "pending";
export type PendingStatus = "pending" | "approved" | "rejected";
export type PendingAction = "approve" | "reject" | "activate" | "deactivate";


export interface PropertyFilters {
    searchQuery: string;
    filterStatus: string;
    filterListingType: string;
    filterPropertyType: string;
    minPrice: string;
    maxPrice: string;
    beds: string;
    baths: string;
}
export function mapRentalToPropertyData(rental: Record<string, unknown>) {
    return {
        // ── identity ──────────────────────────────────────────────────────────
        id:                  rental.id,
        status:              rental.status,
        listing_type:        rental.listing_type ?? "Rent",
 
        // ── address ───────────────────────────────────────────────────────────
        street_address:      rental.street_address,
        unit_apt:            rental.unit_apt,
        city:                rental.city,
        state:               rental.state,
        zip_code:            rental.zip_code,
        county:              rental.county,
 
        // ── property basics ───────────────────────────────────────────────────
        property_type:       rental.property_type,
        bedrooms:            rental.bedrooms,
        bathrooms:           rental.bathrooms,
        square_feet:         rental.square_feet,
        lot_size:            rental.lot_size,
        year_built:          rental.year_built,
        garage_spaces:       rental.garage_spaces,
        parking_spaces:      rental.parking_spaces,
        interior_condition:  rental.interior_condition,
        roof_age:            rental.roof_age,
        roof_status:         rental.roof_status,
 
        // ── financials ────────────────────────────────────────────────────────
        //  ✅  API sends `monthly_rent`, map → `rent_price`
        rent_price:          rental.monthly_rent ?? rental.rent_price,
        rent_frequency:      rental.rent_frequency,
        security_deposit:    rental.security_deposit,
        application_fee:     rental.application_fee,
        move_in_fees:        rental.move_in_fees,
 
        // ── dates ─────────────────────────────────────────────────────────────
        start_date:          rental.start_date,
        end_date:            rental.end_date,
        available_from:      rental.available_from,
 
        //  ✅  API sends `lease_duration_months`, map → `lease_duration`
        lease_duration:      rental.lease_duration_months ?? rental.lease_duration,
 
        // ── policies ──────────────────────────────────────────────────────────
        is_furnished:        rental.is_furnished,
        pets_allowed:        rental.pets_allowed,
        smoking_policy:      rental.smoking_policy,
 
        // ── lists ─────────────────────────────────────────────────────────────
        utilities_included:  rental.utilities_included,
        amenities:           rental.amenities,
        images:              rental.images ?? [],
 
        // ── text ──────────────────────────────────────────────────────────────
        // property_description: rental.property_description,
        //  ✅  API sends `notes`, map → `seller_notes`
        seller_notes:         rental.notes,
 
        // ── admin ─────────────────────────────────────────────────────────────
        rejection_reason:    rental.rejection_reason,
        reviewed_by:         rental.reviewed_by,
        reviewed_at:         rental.reviewed_at,
        created_at:          rental.created_at,
        updated_at:          rental.updated_at,
 
        // ── listing / sale fields (kept for compatibility) ────────────────────
        listing_date:        rental.listing_date,
        listing_price:       rental.listing_price,
        asking_price:        rental.asking_price,
        arv:                 rental.arv,
        repair_estimate:     rental.repair_estimate,
        holding_costs:       rental.holding_costs,
        transaction_type:    rental.transaction_type,
        assignment_fee:      rental.assignment_fee,
 
        // ── creator ───────────────────────────────────────────────────────────
        //  ✅  API sends `created_by` — kept as-is so the page can read it directly.
        //      The page accesses:  (raw.created_by ?? raw.creator)
        creator: rental.created_by ?? rental.creator,
    };
}