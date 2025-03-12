import { axiosInstance } from "./services/auth/AuthService";

const ApiInstance = axiosInstance;

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