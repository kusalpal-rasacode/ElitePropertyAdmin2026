export interface Organization {
    id: number;
    name: string;
    industry?: string;
    logo_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateOrganizationDto {
    name: string;
    industry?: string;
    logo_url?: string;
}

export interface UpdateOrganizationDto {
    name?: string;
    industry?: string;
    logo_url?: string;
}

export interface OrganizationParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface OrganizationResponse {
    data: Organization[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface AddUserToOrganizationDto {
    user_id: number;
}
