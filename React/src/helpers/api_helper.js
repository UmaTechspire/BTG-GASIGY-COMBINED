import axios from "axios";
// import accessToken from "./jwt-token-access/accessToken";

import { getToken } from "./jwt-token-access/accessToken";

// Pass new generated access token
// const token = accessToken;
// const token = getToken;

// Use environment variable for base URL
const API_URL = process.env.REACT_APP_API_URL;

const axiosApi = axios.create({
  baseURL: API_URL,
});

// Set default Authorization header
// axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Optionally include a referrer
//axiosApi.defaults.headers.common["Referrer"] = "https://your-frontend-domain.com";

// Interceptor to handle responses globally
axiosApi.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// ✅ Add interceptor to dynamically attach token before every request
axiosApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { PYTHON_API_URL } from "../common/pyapiconfig";

// GET Request
export async function get(url, config = {}) {
  const finalConfig = { ...config };
  let finalUrl = url;

  if (config.usePython) {
    const pythonBase = (PYTHON_API_URL || "").replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    finalUrl = `${pythonBase}/${cleanUrl}`;
    delete finalConfig.usePython;
    // For Python calls, use a separate axios instance or just direct axios call to avoid baseURL override
    return axios.get(finalUrl, finalConfig).then((response) => response.data);
  }

  return axiosApi.get(url, { ...finalConfig }).then((response) => response.data);
}

// POST Request
export async function post(url, data, config = {}) {
  const finalConfig = { ...config };
  let finalUrl = url;

  if (config.usePython) {
    const pythonBase = (PYTHON_API_URL || "").replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    finalUrl = `${pythonBase}/${cleanUrl}`;
    delete finalConfig.usePython;
    return axios.post(finalUrl, data, finalConfig).then((response) => response.data);
  }

  return axiosApi.post(url, data, finalConfig).then((response) => response.data);
}

// export async function post(url, data, config = {}) {
//   try {
//     const response = await axiosApi.post(url, data, {
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "*/*",
//         ...config.headers,
//       },
//       ...config,
//     });
//     return response.data;
//   } catch (err) {
//     console.error("Post API error:", err);
//     throw err;
//   }
// }

// PUT Request
export async function put(url, data, config = {}) {
  return axiosApi.put(url, data, config).then((response) => response.data);
}

// DELETE Request
export async function del(url, config = {}) {
  return axiosApi.delete(url, config).then((response) => response.data);
}