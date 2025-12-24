import axios from "axios";
import toast from "react-hot-toast";
import i18n from "../i18n";
import { getApiErrorMessageKey } from "../utils/i18nError";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Helper to get token from either storage
const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

// Request interceptor - Auto-attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle API response format and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle standard ApiResponse wrapper format
    const data = response.data;
    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) {
        // API returned success: false
        const errorMessage = data.message || i18n.t("errors.generic");
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          toast.error(errorMessages || errorMessage);
        } else {
          toast.error(errorMessage);
        }
        return Promise.reject(new Error(errorMessage));
      }
      // Return unwrapped data for successful responses
      return { ...response, data: data.data, message: data.message };
    }
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const apiResponse = response.data;
      const messageKey = getApiErrorMessageKey(error);
      const translated = messageKey ? i18n.t(messageKey) : null;
      const message =
        translated || apiResponse?.message || i18n.t("errors.generic");

      switch (response.status) {
        case 401:
          // Clear both storages on 401
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("rememberMe");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          sessionStorage.removeItem("user");
          window.location.href = "/login";
          toast.error(i18n.t("auth.sessionExpired"));
          break;
        case 403:
          toast.error(i18n.t("errors.permissionDenied"));
          break;
        case 404:
          toast.error(
            apiResponse?.message || i18n.t("errors.resourceNotFound")
          );
          break;
        case 400:
          if (apiResponse?.errors) {
            const errorMessages = Object.values(apiResponse.errors)
              .flat()
              .join(", ");
            toast.error(errorMessages || message);
          } else {
            toast.error(message);
          }
          break;
        case 500:
          toast.error(i18n.t("errors.serverErrorTryLater"));
          break;
        default:
          toast.error(message);
      }
    } else {
      toast.error(i18n.t("errors.networkErrorCheckConnection"));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
