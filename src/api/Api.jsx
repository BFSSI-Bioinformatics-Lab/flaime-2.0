import { axiosInstance } from "./services/authService";

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

const ApiQueryPost = async (url, data, controller, apiExt = "/api/") => {
  try {
    const res = await ApiInstance.post(`${apiExt}${url}`, data, {
      signal: controller ? controller.signal : null
    });
    return res.data;
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
};

const ApiQueryPatch = async (url, data, controller, apiExt = "/api/") => {
  try {
    const res = await ApiInstance.patch(`${apiExt}${url}`, data, {
      signal: controller ? controller.signal : null
    });
    return res.data;
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
};

const ApiQueryPut = async (url, data, controller, apiExt = "/api/") => {
  try {
    const res = await ApiInstance.put(`${apiExt}${url}`, data, {
      signal: controller ? controller.signal : null
    });
    return res.data;
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
};

export default ApiInstance;
export { ApiQueryGet, ApiQueryPost, ApiQueryPatch, ApiQueryPut };