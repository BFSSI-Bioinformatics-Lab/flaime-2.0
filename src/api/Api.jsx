import axios from "axios";

const ApiInstance = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL 
});

ApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

ApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

const ApiQueryGet = async (url, controller, apiExt = "/api/") => {
  try {
    const res = await ApiInstance.get(`${apiExt}${url}`, {
      signal: controller ? controller.signal : null
    });
    return res.data;
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
};

export default ApiInstance;
export { ApiQueryGet };