import { ApiInstance } from '../../Api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://172.17.24.4:8000';
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/api/token/`,
    refresh: `${API_BASE_URL}/api/token/refresh/`,
};

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;

class AuthService {
    constructor() {
        this.refreshTimeout = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        this.setupInterceptors();
        this.initializeAuthState();
    }

    checkTokenValidity(token, type = 'access') {
        const payload = this.parseJwt(token);
        if (!payload) return false;

        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        console.log(`${type} token:`, {
            expiresAt: new Date(expirationTime).toISOString(),
            currentTime: new Date(currentTime).toISOString(),
            timeUntilExpiry: `${timeUntilExpiry/1000} seconds`,
            isValid: timeUntilExpiry > 0
        });

        return timeUntilExpiry > 0;
    }

    initializeAuthState() {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        console.log('Initializing auth state...');
        
        if (!accessToken || !refreshToken) {
            this.handleTokenError('No tokens available');
            return;
        }

        // Check if refresh token is valid first
        if (!this.checkTokenValidity(refreshToken, 'refresh')) {
            this.handleTokenError('Session expired - please log in again');
            return;
        }

        // Now check access token
        if (this.checkTokenValidity(accessToken, 'access')) {
            this.setAuthHeader(accessToken);
            this.scheduleTokenRefresh(accessToken);
        } else {
            console.log('Access token expired, attempting refresh...');
            this.refreshToken();
        }
    }
    
    async refreshToken() {
        if (this.isRefreshing) {
            console.log('Refresh already in progress, waiting...');
            return new Promise((resolve, reject) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;
        console.log('Starting token refresh...');

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Check if refresh token is still valid
            if (!this.checkTokenValidity(refreshToken, 'refresh')) {
                throw new Error('Refresh token expired');
            }

            console.log('Making refresh request to:', AUTH_ENDPOINTS.refresh);
            const response = await ApiInstance.post(AUTH_ENDPOINTS.refresh, {
                refresh: refreshToken
            });

            console.log('Refresh response:', response.data);
            const { access } = response.data;
            
            localStorage.setItem('accessToken', access);
            this.setAuthHeader(access);
            this.scheduleTokenRefresh(access);

            this.refreshSubscribers.forEach(callback => callback(access));
            this.refreshSubscribers = [];

            return access;
        } catch (error) {
            console.error('Refresh failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            this.handleTokenError('Session expired - please log in again');
            // Reject all pending subscribers
            this.refreshSubscribers.forEach(callback => callback(null));
            this.refreshSubscribers = [];
            throw error;
        } finally {
            this.isRefreshing = false;
        }
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
            console.error('Token parsing error:', e);
            this.handleTokenError('Invalid token format');
            return null;
        }
    }

    handleTokenError(message) {
        console.error('Auth error:', message);
        this.clearAuth();
        // Force redirect to login
        window.dispatchEvent(new CustomEvent('authError', {
            detail: { message }
        }));
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
            console.error('Login error:', error);
            const message = error.response?.data?.detail || 'Login failed';
            this.handleTokenError(message);
            throw new Error(message);
        }
    }

    scheduleTokenRefresh(token) {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }

        const payload = this.parseJwt(token);
        if (!payload) return;

        const expiresIn = payload.exp * 1000 - Date.now();
        const refreshIn = Math.max(0, expiresIn - TOKEN_REFRESH_THRESHOLD);

        console.log(`Token expires in ${expiresIn}ms, refreshing in ${refreshIn}ms`);

        if (refreshIn <= 0) {
            this.refreshToken();
            return;
        }

        this.refreshTimeout = setTimeout(() => this.refreshToken(), refreshIn);
    }

    logout() {
        this.clearAuth();
        window.dispatchEvent(new CustomEvent('logout'));
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
        ApiInstance.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                
                if (!error.response) {
                    return Promise.reject(error);
                }

                if ((error.response.status === UNAUTHORIZED_STATUS || 
                     error.response.status === FORBIDDEN_STATUS) && 
                    !originalRequest._retry) {
                    originalRequest._retry = true;
                    console.log('Intercepted auth error, attempting refresh...');

                    try {
                        const token = await this.refreshToken();
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return ApiInstance(originalRequest);
                    } catch (refreshError) {
                        console.error('Refresh attempt failed:', refreshError);
                        this.handleTokenError('Session expired');
                        return Promise.reject(refreshError);
                    }
                }

                if (error.response.status === UNAUTHORIZED_STATUS || 
                    error.response.status === FORBIDDEN_STATUS) {
                    this.handleTokenError('Authentication failed');
                }

                return Promise.reject(error);
            }
        );
    }
}

export const authService = new AuthService();
export default authService;