// authService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});


// Add token to all requests
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Auth methods
const login = async (username, password) => {
  try {
    // Use a more direct approach to rule out any axios configuration issues
    const response = await fetch(`${API_BASE_URL}/api/token-auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Response not OK:', response.status);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error(`HTTP error ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      const userResponse = await fetch(`${API_BASE_URL}/api/user-info/`, {
        headers: {
          'Authorization': `Token ${data.token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// API query function
const ApiQueryGet = async (url, controller, apiExt = "/api/") => {
  try {
    const res = await axiosInstance.get(`${apiExt}${url}`, {
      signal: controller ? controller.signal : null
    });
    return res.data;
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
};

export { axiosInstance, ApiQueryGet, login, logout };