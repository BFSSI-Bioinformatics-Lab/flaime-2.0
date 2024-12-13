import axios from 'axios';

export const ApiInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://172.17.24.4:8000',
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const ApiQueryGet = async (endpoint) => {
    try {
        const response = await ApiInstance.get(`/api/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`API Query error for ${endpoint}: `, error);
        throw error;
    }
};

export const Api = {
    get: async (endpoint) => {
        try {
            const response = await ApiInstance.get(`/api/${endpoint}`);
            return response.data;
        } catch (error) {
            console.error(`API error for ${endpoint}: `, error);
            throw error;
        }
    },
    
    post: async (endpoint, data) => {
        try {
            const response = await ApiInstance.post(`/api/${endpoint}`, data);
            return response.data;
        } catch (error) {
            console.error(`API error for ${endpoint}: `, error);
            throw error;
        }
    },

    patch: async (endpoint, data) => {
        try {
            const response = await ApiInstance.patch(`/api/${endpoint}`, data);
            return response.data;
        } catch (error) {
            console.error(`API error for ${endpoint}: `, error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            const response = await ApiInstance.delete(`/api/${endpoint}`);
            return response.data;
        } catch (error) {
            console.error(`API error for ${endpoint}: `, error);
            throw error;
        }
    }
};

export default Api;