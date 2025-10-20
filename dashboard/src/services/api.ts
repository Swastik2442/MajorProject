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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token: string = await window.Clerk.session.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    const errorMessage =
      typeof error === "string"
        ? error
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        : (error as { message?: string })?.message ?? "Request error";
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiService: ApiService = {
  fetchProblems: async (params) => {
    const response = await api.get<TPaginatedProblemDataResponse>(
      "/alerts/problems",
      { params }
    );
    return response.data;
  },

  fetchServiceAlerts: async (params) => {
    const response = await api.get<TPaginatedServiceDataResponse>(
      "/alerts/services",
      { params }
    );
    return response.data;
  },

  fetchProblemsCount: async (params) => {
    const response = await api.get<TStatCountsDataResponse>(
      "/alerts/problems/count",
      { params }
    );
    return response.data;
  },

  fetchProblemsTrends: async (params) => {
    const response = await api.get<TStatTrendsDataResponse>(
      "/alerts/problems/trends",
      { params }
    );
    return response.data;
  },

  fetchHostsHealthScores: async (params) => {
    const response = await api.get<TStatHealthScoresDataResponse>(
      "/alerts/hosts/health",
      { params }
    );
    return response.data;
  },

  createClient: async (data) => {
    const response = await api.post<TDataResponseClient>(
      "/clients",
      { ...data }
    );
    return response.data;
  },

  listClients: async (params) => {
    const response = await api.get<TPaginatedClientListItemDataResponse>(
      "/clients",
      { params }
    );
    return response.data;
  },

  getClient: async (client_id) => {
    const response = await api.get<TDataResponseClientListItem>(
      `/clients/${client_id}`
    );
    return response.data;
  },

  updateClient: async (client_id, data) => {
    const response = await api.put<TResponse>(
      `/clients/${client_id}`,
      { ...data }
    );
    return response.data;
  },

  deleteClient: async (client_id) => {
    const response = await api.delete<TResponse>(
      `/clients/${client_id}`
    );
    return response.data;
  },

  regenerateClientApiKey: async (client_id) => {
    const response = await api.put<TDataResponseStr>(
      `/clients/${client_id}/regenerate_api_key`
    );
    return response.data;
  },

  changeClientOwner: async (client_id, data) => {
    const response = await api.put<TResponse>(
      `/clients/${client_id}/change_owner`,
      { ...data }
    );
    return response.data;
  },
};

export default api;
