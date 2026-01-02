import axios from "axios";
import {
  type ApiService,
  DataResponseClientListItemSchema,
  DataResponseStrSchema,
  PaginatedClientListItemDataResponseSchema,
  PaginatedProblemDataResponseSchema,
  PaginatedProblemOrServiceDataResponseSchema,
  PaginatedServiceDataResponseSchema,
  ResponseSchema,
  StatCommonCountsDataResponseSchema,
  StatCommonTrendsDataResponseSchema,
  StatCountsDataResponseSchema,
  StatHealthScoresDataResponseSchema,
  StatHostsProblemsCountDataResponseSchema,
  StatTrendsDataResponseSchema,
  StatProblematicAlertTrendsDataResponseSchema,
  StatAlertDurationsOverThresholdDataResponseSchema,
  StatAlertDurationSplitDataResponseSchema,
  StatServiceAlertDurationsOverThresholdDataResponseSchema,
  StatServicesProblemsCountDataResponseSchema,
  DataResponseThreadParamsSchema,
  PaginatedThreadLeanDataResponseSchema,
  DataResponseChartsDataSchema,
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
    const response = await api.get(
      "/alerts/triggers/",
      { params }
    );
    return PaginatedProblemDataResponseSchema.parse(response.data);
  },

  getTriggerAlertsCount: async (params) => {
    const response = await api.get(
      "/alerts/triggers/count",
      { params }
    );
    return StatCountsDataResponseSchema.parse(response.data);
  },

  getTriggerAlertTrends: async (params) => {
    const response = await api.get(
      "/alerts/triggers/trends",
      { params }
    );
    return StatTrendsDataResponseSchema.parse(response.data);
  },

  getHostsHealthScores: async (params) => {
    const response = await api.get(
      "/alerts/triggers/hosts/health",
      { params }
    );
    return StatHealthScoresDataResponseSchema.parse(response.data);
  },

  getHostsProblemsCount: async (params) => {
    const response = await api.get(
      "/alerts/triggers/hosts/count",
      { params }
    );
    return StatHostsProblemsCountDataResponseSchema.parse(response.data);
  },

  getProblematicTriggerAlertTrends: async (params) => {
    const response = await api.get(
      "/alerts/triggers/trends/problematic-alerts",
      { params }
    );
    return StatProblematicAlertTrendsDataResponseSchema.parse(response.data);
  },

  getTriggerAlertDurationsOverThreshold: async (params) => {
    const response = await api.get(
      "/alerts/triggers/hosts/duration/threshold",
      { params }
    );
    return StatAlertDurationsOverThresholdDataResponseSchema.parse(response.data);
  },

  getTriggerAlertDurationSplit: async (params) => {
    const response = await api.get(
      "/alerts/triggers/hosts/duration/split",
      { params }
    );
    return StatAlertDurationSplitDataResponseSchema.parse(response.data);
  },

  // --- SERVICE ALERTS ---

  getServiceAlerts: async (params) => {
    const response = await api.get(
      "/alerts/services/",
      { params }
    );
    return PaginatedServiceDataResponseSchema.parse(response.data);
  },

  getServiceAlertsCount: async (params) => {
    const response = await api.get(
      "/alerts/services/count",
      { params }
    );
    return StatCountsDataResponseSchema.parse(response.data);
  },

  getServiceAlertTrends: async (params) => {
    const response = await api.get(
      "/alerts/services/trends",
      { params }
    );
    return StatTrendsDataResponseSchema.parse(response.data);
  },

  getServicesHealthScores: async (params) => {
    const response = await api.get(
      "/alerts/services/health",
      { params }
    );
    return StatHealthScoresDataResponseSchema.parse(response.data);
  },

  getServicesProblemsCount: async (params) => {
    const response = await api.get(
      "/alerts/services/count/services",
      { params }
    );
    return StatServicesProblemsCountDataResponseSchema.parse(response.data);
  },

  getProblematicServiceAlertTrends: async (params) => {
    const response = await api.get(
      "/alerts/services/trends/problematic-alerts",
      { params }
    );
    return StatProblematicAlertTrendsDataResponseSchema.parse(response.data);
  },

  getServiceAlertDurationsOverThreshold: async (params) => {
    const response = await api.get(
      "/alerts/services/duration/threshold",
      { params }
    );
    return StatServiceAlertDurationsOverThresholdDataResponseSchema.parse(response.data);
  },

  getServiceAlertDurationSplit: async (params) => {
    const response = await api.get(
      "/alerts/services/duration/split",
      { params }
    );
    return StatAlertDurationSplitDataResponseSchema.parse(response.data);
  },

  // --- COMMON ALERTS ---

  getCommonAlerts: async (params) => {
    const response = await api.get(
      "/alerts/common/",
      { params }
    );
    return PaginatedProblemOrServiceDataResponseSchema.parse(response.data);
  },

  getCommonAlertsCount: async (params) => {
    const response = await api.get(
      "/alerts/common/count",
      { params }
    );
    return StatCommonCountsDataResponseSchema.parse(response.data);
  },

  getCommonAlertTrends: async (params) => {
    const response = await api.get(
      "/alerts/common/trends",
      { params }
    );
    return StatCommonTrendsDataResponseSchema.parse(response.data);
  },

  // --- CLIENT MANAGEMENT ---

  createClient: async (data) => {
    const response = await api.post(
      "/clients/",
      { ...data }
    );
    return DataResponseStrSchema.parse(response.data);
  },

  listClients: async (params) => {
    const response = await api.get(
      "/clients/",
      { params }
    );
    return PaginatedClientListItemDataResponseSchema.parse(response.data);
  },

  getClient: async (client_id) => {
    const response = await api.get(
      `/clients/${client_id}`
    );
    return DataResponseClientListItemSchema.parse(response.data);
  },

  updateClient: async (client_id, data) => {
    const response = await api.put(
      `/clients/${client_id}`,
      { ...data }
    );
    return ResponseSchema.parse(response.data);
  },

  deleteClient: async (client_id) => {
    const response = await api.delete(`/clients/${client_id}`);
    return ResponseSchema.parse(response.data);
  },

  regenerateClientApiKey: async (client_id) => {
    const response = await api.put(
      `/clients/${client_id}/regenerate_api_key`
    );
    return DataResponseStrSchema.parse(response.data);
  },

  changeClientOwner: async (client_id, data) => {
    const response = await api.put(
      `/clients/${client_id}/change_owner`,
      { ...data }
    );
    return ResponseSchema.parse(response.data);
  },

  // --- AI ---

  startPromptChart: async (body) => {
    const response = await api.post(
      "/promptChart/start",
      { ...body }
    );
    return DataResponseThreadParamsSchema.parse(response.data);
  },

  continuePromptChart: async (body) => {
    const response = await api.post(
      "/promptChart/continue",
      { ...body }
    );
    return ResponseSchema.parse(response.data);
  },

  getPromptChartThreads: async (params) => {
    const response = await api.get(
      "/promptChart/threads",
      { params }
    );
    return PaginatedThreadLeanDataResponseSchema.parse(response.data);
  },

  getPromptChartThreadDetails: async (params) => {
    const response = await api.get(
      (params.index !== undefined
        ? `/promptChart/threads/${params.thread_id}/${params.index}`
        : `/promptChart/threads/${params.thread_id}`),
      { params: { client_id: params.client_id, org_id: params.org_id } }
    );
    return DataResponseChartsDataSchema.parse(response.data);
  },

  updateThread: async (thread_id, body) => {
    const response = await api.patch(
      `/promptChart/threads/${thread_id}`,
      { ...body }
    );
    return ResponseSchema.parse(response.data);
  },

  deleteThread: async (thread_id) => {
    const response = await api.delete(
      `/promptChart/threads/${thread_id}`
    );
    return ResponseSchema.parse(response.data);
  },
};

export default api;
