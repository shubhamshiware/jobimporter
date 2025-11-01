import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error - please check your connection");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
);

export default api;
