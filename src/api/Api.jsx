// Api.jsx
import axios from 'axios';

export const ApiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

export const ApiQueryGet = async (url, controller, apiExt = "/api/") => {
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