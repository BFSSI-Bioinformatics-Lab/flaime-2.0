import { ApiInstance } from '../../Api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/api/token/`,
    refresh: `${API_BASE_URL}/api/token/refresh/`,
};

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

class AuthService {
    constructor() {
        this.refreshTimeout = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        this.setupInterceptors();
    }

    setAuthHeader(token) {
        if (token) {
            ApiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete ApiInstance.defaults.headers.common['Authorization'];
        }
    }

    parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    async login(credentials) {
        try {
            const response = await ApiInstance.post(AUTH_ENDPOINTS.login, credentials);
            const { access, refresh } = response.data;

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            this.setAuthHeader(access);
            this.scheduleTokenRefresh(access);

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    }

    scheduleTokenRefresh(token) {
        const payload = this.parseJwt(token);
        if (!payload) return;

        const expiresIn = payload.exp * 1000 - Date.now();
        const refreshIn = expiresIn - TOKEN_REFRESH_THRESHOLD;

        if (refreshIn <= 0) {
            this.refreshToken();
            return;
        }

        this.refreshTimeout = setTimeout(() => this.refreshToken(), refreshIn);
    }

    async refreshToken() {
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await ApiInstance.post(AUTH_ENDPOINTS.refresh, {
                refresh: refreshToken
            });

            const { access } = response.data;
            localStorage.setItem('accessToken', access);
            this.setAuthHeader(access);
            this.scheduleTokenRefresh(access);

            this.refreshSubscribers.forEach(callback => callback(access));
            this.refreshSubscribers = [];

            return access;
        } catch (error) {
            this.logout();
            throw new Error('Session expired');
        } finally {
            this.isRefreshing = false;
        }
    }

    logout() {
        this.clearAuth();
    }

    clearAuth() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.setAuthHeader(null);
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    setupInterceptors() {
        ApiInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            }
        );
        ApiInstance.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const token = await this.refreshToken();
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return ApiInstance(originalRequest);
                    } catch (refreshError) {
                        window.dispatchEvent(new CustomEvent('sessionExpired', {
                            detail: {
                                message: 'Your session has expired. Please log in again.'
                            }
                        }));
                        this.clearAuth();
                        throw refreshError;
                    }
                }
                return Promise.reject(error);
            }
        );
    }
}

export const authService = new AuthService();
export default authService;