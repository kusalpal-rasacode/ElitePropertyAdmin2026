export interface SubscriptionPlan {
  id: number;
  name: string;
  display_name: string;
  plan_type: "FREE" | "PLUS" | "ENTERPRISE" | string;
  price: number;
}

export interface Subscription {
  id: number;
  status: "active" | "inactive" | "cancelled" | string;
  start_date: string;
  end_date: string;
  plan: SubscriptionPlan;
}

export interface Organization {
  id: number;
  name: string;
}

// Matches the actual API response shape
export interface UserData {
  id: number | string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  organization: Organization | null;
  subscription: Subscription | null;
  roles?: any[];
  // Extra optional fields used elsewhere in the app
  permissions?: any;
  profile_image?: string | File;
  date_of_birth?: string;
  gender?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface UserResponse {
  is_success: boolean;
  message: string;
  data: UserData;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersListResponse {
  is_success: boolean;
  message: string;
  data: UserData[];
  pagination: Pagination;
}

// --- Helper: derive a display role from subscription plan_type ---
export const getPlanRole = (user: UserData): string => {
  const planType = user.subscription?.plan?.plan_type;
  switch (planType) {
    case "ENTERPRISE":
      return "Enterprise";
    case "PLUS":
      return "Plus";
    case "FREE":
      return "Free";
    default:
      return "No Plan";
  }
};

// --- Helper: derive a status string from subscription.status ---
export const getUserStatus = (user: UserData): "Active" | "Inactive" => {
  return user.subscription?.status === "active" ? "Active" : "Inactive";
};

// --- Helper: get join date from subscription.start_date ---
export const getUserJoinDate = (user: UserData): string | undefined => {
  return user.subscription?.start_date;
};
