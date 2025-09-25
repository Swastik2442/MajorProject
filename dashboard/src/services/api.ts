import axios from "axios";
import type {
  ApiService,
  TPaginatedProblemDataResponse,
  TPaginatedServiceDataResponse,
  TStatCountsDataResponse,
  TStatHealthScoresDataResponse,
  TStatTrendsDataResponse
} from "../schemas/api";

const BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

export const apiService: ApiService = {
  fetchProblems: async (page = 1, limit = 20) => {
    try {
      const response = await api.get<TPaginatedProblemDataResponse>('/alerts/problems', { params: { page, limit } });
      return response.data;
    } catch (err) {
      console.error('API error:', err);
      return null;
    }
  },

  fetchServiceAlerts: async (page = 1, limit = 20) => {
    try {
      const response = await api.get<TPaginatedServiceDataResponse>('/alerts/services', { params: { page, limit } });
      return response.data;
    } catch (err) {
      console.error('API error:', err);
      return null;
    }
  },

  fetchProblemsCount: async () => {
    try {
      const response = await api.get<TStatCountsDataResponse>('/alerts/problems/count');
      return response.data;
    } catch (err) {
      console.error('API error:', err);
      return null;
    }
  },

  fetchProblemsTrends: async (start, end, interval) => {
    try {
      const params: Record<string, string> = { start };
      if (end) params.end = end;
      if (interval) params.interval = interval;
      const response = await api.get<TStatTrendsDataResponse>('/alerts/problems/trends', { params });
      return response.data;
    } catch (err) {
      console.error('API error:', err);
      return null;
    }
  },

  fetchHostsHealthScores: async () => {
    try {
      const response = await api.get<TStatHealthScoresDataResponse>('/alerts/hosts/health');
      return response.data;
    } catch (err) {
      console.error('API error:', err);
      return null;
    }
  },
};

export default api;
