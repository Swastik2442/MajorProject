// src/services/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

export default api;

export const fetchProblems = async () => {
  const res = await api.get("/problems");
  return res.data;
};
