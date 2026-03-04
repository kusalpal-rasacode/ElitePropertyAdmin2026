export interface CampaignData {
    id: number;
    name: string;
    campaign_type: string;
    channel: string[];
    scheduled_start_date: string;
    scheduled_end_date: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
    subject_line: string;
    email_content: string;
    status: string; // 'active' | 'inactive' | 'draft' | 'paused' ?
    use_ai_personalization?: boolean;
    // Geographic Scope
    geographic_scope_type?: string;
    property_type?: string;
    // Price Range
    min_price?: number;
    max_price?: number;
    // Distress
    distress_indicators?: string[];
    // Buyer
    last_qualification?: string;
    age_range?: string;
    ethnicity?: string;
    salary_range?: string;
    marital_status?: string;
    employment_status?: string;
    home_ownership_status?: string;
    buyer_country?: string;
    buyer_state?: string;
    buyer_counties?: string;
    buyer_city?: string;
    buyer_districts?: string;
    buyer_parish?: string;
    // Seller
    seller_country?: string;
    seller_state?: string;
    seller_counties?: string;
    seller_city?: string;
    seller_districts?: string;
    seller_parish?: string;
    seller_keywords?: string;

    // UI specific placeholders (not in API yet)
    reach?: string | number;
    clicks?: string | number;
    budget?: string | number;
    spent?: string | number;
    platform?: string; // Derived from channel usually

    created_at: string;
    updated_at: string;
}

export interface CampaignsResponse {
    is_success: boolean;
    message: string;
    data: CampaignData[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CampaignsPayload {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}
