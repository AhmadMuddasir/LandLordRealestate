import { apiClient } from "./client";

export const rentalApi = {
  getAll: async () => {
    const { data } = await apiClient.get("/rentals");

    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/rentals/${id}`);

    return data;
  },

  search: async (location) => {
    const { data } = await apiClient.get("/rentals/search", {
      params: { location },
    });

    return data;
  },

  create: async (formData) => {
    const { data } = await apiClient.post("/rentals", formData);

    return data;
  },

  update: async (id, formData) => {
    const { data } = await apiClient.put(`/rentals/${id}`, formData);

    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/rentals/${id}`);

    return data;
  },
};
