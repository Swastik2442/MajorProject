import axios from "axios";
import type {
  ApiService,
  TDataResponseClientListItem,
  TDataResponseStr,
  TPaginatedClientListItemDataResponse,
  TPaginatedProblemDataResponse,
  TPaginatedProblemOrServiceDataResponse,
  TPaginatedServiceDataResponse,
  TResponse,
  TStatCommonCountsDataResponse,
  TStatCommonTrendsDataResponse,
  TStatCountsDataResponse,
  TStatHealthScoresDataResponse,
  TStatHostsProblemsCountDataResponse,
  TStatTrendsDataResponse,
  TStatProblematicAlertTrendsDataResponse,
  TStatAlertDurationPerHostDataResponse,
  TStatAlertDurationPerServiceDataResponse,
  TStatServicesProblemsCountDataResponse,
} from "@/schemas/api";

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
  // --- PROBLEMS ---

  getTriggerAlerts: async (params) => {
    const response = await api.get<TPaginatedProblemDataResponse>(
      "/alerts/triggers/",
      { params }
    );
    return response.data;
  },

  getTriggerAlertsCount: async (params) => {
    const response = await api.get<TStatCountsDataResponse>(
      "/alerts/triggers/count",
      { params }
    );
    return response.data;
  },

  getTriggerAlertTrends: async (params) => {
    const response = await api.get<TStatTrendsDataResponse>(
      "/alerts/triggers/trends",
      { params }
    );
    return response.data;
  },

  getHostsHealthScores: async (params) => {
    const response = await api.get<TStatHealthScoresDataResponse>(
      "/alerts/triggers/hosts/health",
      { params }
    );
    return response.data;
  },

  getHostsProblemsCount: async (params) => {
    const response = await api.get<TStatHostsProblemsCountDataResponse>(
      "/alerts/triggers/hosts/count",
      { params }
    );
    return response.data;
  },

  getProblematicTriggerAlertTrends: async (params) => {
    const response = await api.get<TStatProblematicAlertTrendsDataResponse>(
      "/alerts/triggers/trends/problematic-alerts",
      { params }
    );
    return response.data;
  },

  getAlertDurationPerHost: async (params) => {
    const response = await api.get<TStatAlertDurationPerHostDataResponse>(
      "/alerts/problems/hosts/duration",
      { params }
    );
    return response.data;
  },

  // --- SERVICE ALERTS ---

  getServiceAlerts: async (params) => {
    const response = await api.get<TPaginatedServiceDataResponse>(
      "/alerts/services/",
      { params }
    );
    return response.data;
  },

  getServiceAlertsCount: async (params) => {
    const response = await api.get<TStatCountsDataResponse>(
      "/alerts/services/count",
      { params }
    );
    return response.data;
  },

  getServiceAlertTrends: async (params) => {
    const response = await api.get<TStatTrendsDataResponse>(
      "/alerts/services/trends",
      { params }
    );
    return response.data;
  },

  getServicesHealthScores: async (params) => {
    const response = await api.get<TStatHealthScoresDataResponse>(
      "/alerts/services/health",
      { params }
    );
    return response.data;
  },

  getServicesProblemsCount: async (params) => {
    const response = await api.get<TStatServicesProblemsCountDataResponse>(
      "/alerts/services/count/services",
      { params }
    );
    return response.data;
  },

  getProblematicServiceAlertTrends: async (params) => {
    const response = await api.get<TStatProblematicAlertTrendsDataResponse>(
      "/alerts/services/trends/problematic-alerts",
      { params }
    );
    return response.data;
  },

  getAlertDurationPerService: async (params) => {
    const response = await api.get<TStatAlertDurationPerServiceDataResponse>(
      "/alerts/services/duration",
      { params }
    );
    return response.data;
  },

  // --- COMMON ALERTS ---

  getCommonAlerts: async (params) => {
    const response = await api.get<TPaginatedProblemOrServiceDataResponse>(
      "/alerts/common/",
      { params }
    );
    return response.data;
  },

  getCommonAlertsCount: async (params) => {
    const response = await api.get<TStatCommonCountsDataResponse>(
      "/alerts/common/count",
      { params }
    );
    return response.data;
  },

  getCommonAlertTrends: async (params) => {
    const response = await api.get<TStatCommonTrendsDataResponse>(
      "/alerts/common/trends",
      { params }
    );
    return response.data;
  },

  // --- CLIENT MANAGEMENT ---

  createClient: async (data) => {
    const response = await api.post<TDataResponseStr>("/clients/", { ...data });
    return response.data;
  },

  listClients: async (params) => {
    const response = await api.get<TPaginatedClientListItemDataResponse>(
      "/clients/",
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
    const response = await api.delete<TResponse>(`/clients/${client_id}`);
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
