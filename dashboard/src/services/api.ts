import axios from "axios";
import type {
  ApiService,
  TDataResponseClient,
  TDataResponseClientListItem,
  TDataResponseStr,
  TPaginatedClientListItemDataResponse,
  TPaginatedProblemDataResponse,
  TPaginatedServiceDataResponse,
  TResponse,
  TStatCountsDataResponse,
  TStatHealthScoresDataResponse,
  TStatTrendsDataResponse
} from "../schemas/api";

const BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

// Add Authorization Header interceptor
api.interceptors.request.use(
  async (config) => {
    // @ts-expect-error Clerk token outside React
    const token: string = await window.Clerk.session.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    const errorMessage =
      typeof error === "string"
        ? error
        : (error as { message?: string })?.message ?? "Request error";
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiService: ApiService = {
  fetchProblems: async (page = 1, limit = 20, client_id, org_id) => {
    try {
      const response = await api.get<TPaginatedProblemDataResponse>(
        "/alerts/problems",
        { params: { client_id, org_id, page, limit } }
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  fetchServiceAlerts: async (page = 1, limit = 20, client_id, org_id) => {
    try {
      const response = await api.get<TPaginatedServiceDataResponse>(
        "/alerts/services",
        { params: { client_id, org_id, page, limit } }
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  fetchProblemsCount: async (client_id, org_id) => {
    try {
      const response = await api.get<TStatCountsDataResponse>(
        "/alerts/problems/count",
        { params: { client_id, org_id } }
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  fetchProblemsTrends: async (start, end, interval, client_id, org_id) => {
    try {
      const params: Record<string, string | string[] | null | undefined> = {
        start,
        client_id,
        org_id,
      };
      if (end) params.end = end;
      if (interval) params.interval = interval;
      const response = await api.get<TStatTrendsDataResponse>(
        "/alerts/problems/trends",
        { params }
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  fetchHostsHealthScores: async (client_id, org_id) => {
    try {
      const response = await api.get<TStatHealthScoresDataResponse>(
        "/alerts/hosts/health",
        { params: { client_id, org_id } }
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  createClient: async (data) => {
    try {
      const response = await api.post<TDataResponseClient>("/clients", {
        ...data,
      });
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  listClients: async (page = 1, limit = 20, owner_id) => {
    try {
      const response =
        await api.get<TPaginatedClientListItemDataResponse>("/clients", {
          params: { page, limit, owner_id },
        });
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  getClient: async (client_id) => {
    try {
      const response =
        await api.get<TDataResponseClientListItem>(`/clients/${client_id}`);
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  updateClient: async (client_id, data) => {
    try {
      const response = await api.put<TResponse>(`/clients/${client_id}`, {
        ...data,
      });
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  deleteClient: async (client_id) => {
    try {
      const response = await api.delete<TResponse>(`/clients/${client_id}`);
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  // ✅ KEEP OLD NAME AS YOU REQUESTED
  regenerateClientApiKey: async (client_id) => {
    try {
      const response = await api.put<TDataResponseStr>(
        `/clients/${client_id}/regenerate-api-key`
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },

  changeClientOwner: async (client_id, new_owner_id) => {
    try {
      const response = await api.put<TResponse>(
        `/clients/${client_id}/change-owner`,
        { new_owner_id }
      );
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  },
};

export default api;
