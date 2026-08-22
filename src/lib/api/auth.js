import { apiClient } from "./client";

export const authApi = {
  register: async (name, email, password) => {
    const { data } = await apiClient.post("/users/register", {
      name,
      email,
      password,
    });

    return data;
  },

  login: async (email, password) => {
    const { data } = await apiClient.post("/users/login", {
      email,
      password,
    });

    return data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};
