import { api, privetApi  } from "@/services/axios";
import { UserResponse, UserData, UsersListResponse } from "@/types/users.type";
export const getUsers = async (params?: any) => {
    try {
        const response = await privetApi.get("/users", { params });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};
export const getUserService = async (): Promise<UserData> => {
  try {
    const response = await api.get("/users");
    let userData: any;

    const data = response.data;

    if (data?.is_success && data?.data) {
      userData = data.data;
    } else if (data?.data) {
      userData = data.data;
    } else if (Array.isArray(data)) {
      const storedUserId = localStorage.getItem("userId");
      const storedUsername = localStorage.getItem("username");

      userData =
        data.find((u: any) => u.id?.toString() === storedUserId) ||
        data.find((u: any) => u.username === storedUsername) ||
        data[0];
    } else {
      userData = data;
    }

    if (!userData) {
      throw new Error("No user data found in response");
    }

    // Cache user
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.id) localStorage.setItem("userId", userData.id.toString());
    if (userData.username) localStorage.setItem("username", userData.username);

    return userData;
  } catch (error: any) {
    console.error("API failed, falling back to cache", error);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        /* ignore */
      }
    }
    throw new Error("Unable to fetch user data from API or cache");
  }
};

export const getAllUsersService = async (): Promise<UserData[]> => {
  try {
    const response = await api.get("/users");
    const data = response.data as UsersListResponse | UserData[];

    let usersArray: UserData[] = [];

    if (!Array.isArray(data) && data?.is_success && Array.isArray(data?.data)) {
      usersArray = data.data;
    } else if (!Array.isArray(data) && Array.isArray(data?.data)) {
      usersArray = data.data;
    } else if (Array.isArray(data)) {
      usersArray = data;
    } else {
      console.warn("Unexpected response format:", data);
      return [];
    }

    return usersArray;
  } catch (error: any) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getUserByIdService = async (id: string): Promise<UserResponse> => {
  try {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const updateUserByIdService = async (
  id: string,
  userData: any,
): Promise<UserResponse> => {
  try {
    let payload: FormData;

    if (userData instanceof FormData) {
      payload = userData;
    } else {
      payload = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          payload.append(key, value as any);
        }
      });
    }

    const response = await api.put<UserResponse>(`/users/${id}`, payload);

    if (response.data?.is_success && response.data.data) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(storedUser),
            ...response.data.data,
          }),
        );
      }
    }

    return response.data;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUserService = async (id: string): Promise<UserResponse> => {
  try {
    const response = await api.delete<UserResponse>(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// export const updateUserStatusService = async (
//   id: string,
//   status: string,
// ): Promise<UserResponse> => {
//   try {
//     const response = await api.patch<UserResponse>(`/users/${id}/status`, {
//       status,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error updating user status:", error);
//     throw error;
//   }
// };

export const createUserService = async (userData: {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}) => {
    try {
        const response = await privetApi.post("/users", userData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const getMyUsers = async (params?: any) => {
    try {
        const response = await privetApi.get("/users/my-users", { params });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};
