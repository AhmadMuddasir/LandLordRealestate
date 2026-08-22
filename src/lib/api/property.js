import { apiClient } from "./client";

export const propertyApi = {
  getAll: async () => {
    const { data } = await apiClient.get("/properties");

    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/properties/${id}`);

    return data;
  },

  search: async (location) => {
    const { data } = await apiClient.get("/properties/search", {
      params: { location },
    });

    return data;
  },

  create: async (formData) => {
    const { data } = await apiClient.post("/properties", formData);

    return data;
  },

  update: async (id, formData) => {
    const { data } = await apiClient.put(`/properties/${id}`, formData);

    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/properties/${id}`);

    return data;
  },
};
