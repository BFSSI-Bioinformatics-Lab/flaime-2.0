//api/Api.jsx
import axios from 'axios';

const API_PREFIX = '/api';

export const ApiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const makeRequest = async (method, endpoint, data = null) => {
  try {
    const response = await ApiInstance({
      method,
      url: `${API_PREFIX}/${endpoint}`,
      data
    });
    return response.data;
  } catch (error) {
    console.error(`API error for ${endpoint}: `, error);
    throw error;
  }
};

export const Api = {
  get: (endpoint) => makeRequest('get', endpoint),
  post: (endpoint, data) => makeRequest('post', endpoint, data),
  patch: (endpoint, data) => makeRequest('patch', endpoint, data),
  delete: (endpoint) => makeRequest('delete', endpoint)
};

export default Api;