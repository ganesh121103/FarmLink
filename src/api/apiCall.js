import { API_BASE_URL } from '../constants';

const TIMEOUT_MS = 15000; // 15 second timeout

const apiCall = async (endpoint, method = 'GET', body = null, isMultipart = false) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const options = {
            method,
            signal: controller.signal,
            headers: {
                ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
            },
        };

        if (body) {
            options.body = isMultipart ? body : JSON.stringify(body);
        }

        // Don't send token for login/register
        if (!endpoint.includes('/login') && !endpoint.includes('/register')) {
            const userStr = localStorage.getItem('farmlink_user');
            if (userStr && userStr !== "undefined") {
                try {
                    const userObj = JSON.parse(userStr);
                    if (userObj?.token) {
                        options.headers['Authorization'] = `Bearer ${userObj.token}`;
                    }
                } catch { /* ignore invalid json */ }
            }
        }

        let response;
        try {
            response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            throw new Error('Cannot connect to server. Please ensure the backend is running.');
        }

        clearTimeout(timeoutId);

        if (response.status === 401) {
            document.dispatchEvent(new CustomEvent('auth-expired'));
            throw new Error('Session expired. Please log in again.');
        }

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error('Invalid server response');
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return { data };

    } catch (error) {
        console.error(`API Error (${method} ${endpoint}):`, error.message);
        throw error;
    }
};

export { apiCall };