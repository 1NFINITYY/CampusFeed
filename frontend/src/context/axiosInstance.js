import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", // fallback
});

// 🟢 Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const fullURL = `${config.baseURL}${config.url}`;
  console.log("🟢 Axios Request:", fullURL);

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔴 Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    console.log("🔴 Axios Error Interceptor Triggered:", status, error.response?.data);

    if (status === 401 || status === 403) {
      console.log("🚪 Logging out due to invalid/expired token...");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
