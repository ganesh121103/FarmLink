import { API_BASE_URL } from '../constants';

// UPGRADED for Production: Handles FormData (for DB-friendly image uploads) and JWT 401 Expirations
const apiCall = async (endpoint, method = 'GET', body = null, isMultipart = false) => {
    try {
        const options = {
            method,
            headers: {
                // If it's multipart (FormData), do NOT set Content-Type. The browser sets it with the correct boundary.
                ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
            },
        };

        if (body) {
            options.body = isMultipart ? body : JSON.stringify(body);
        }

        const userStr = localStorage.getItem('farmlink_user');
        if (userStr && userStr !== "undefined") {
            const userObj = JSON.parse(userStr);
            if (userObj && userObj.token) {
                options.headers['Authorization'] = `Bearer ${userObj.token}`;
            }
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options).catch(() => {
            throw new Error("BACKEND_OFFLINE");
        });

        if (response.status === 401) {
            // Handle MongoDB/Node JWT Expiration centrally
            document.dispatchEvent(new CustomEvent('auth-expired'));
            throw new Error("Session expired. Please log in again.");
        }

        let data;
        try { data = await response.json(); } catch (e) { data = { message: "Invalid server response" }; }

        if (!response.ok) { throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`); }
        return { data };
    } catch (error) {
        if (error.message !== "BACKEND_OFFLINE") { console.error(`API Error (${method} ${endpoint}):`, error.message); }
        throw error;
    }
};

export { apiCall };
