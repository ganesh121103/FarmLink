/**
 * Gemini AI helper with key rotation and model fallback.
 * Tries multiple API keys and models to maximize availability.
 */

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];

function getApiKeys() {
    const keys = [];
    const k1 = import.meta.env.VITE_GEMINI_API_KEY;
    const k2 = import.meta.env.VITE_GEMINI_API_KEY_2;
    if (k1) keys.push(k1);
    if (k2) keys.push(k2);
    return keys;
}

/**
 * Call Gemini API with automatic key rotation and model fallback.
 * @param {Object} requestBody - The request body for generateContent
 * @returns {Promise<Object>} - The parsed response data
 * @throws {Error} - If all keys and models fail
 */
export async function callGemini(requestBody) {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error('NO_API_KEY');

    let lastError = '';

    for (const model of MODELS) {
        for (const key of keys) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                    }
                );

                if (res.status === 429 || res.status === 403) {
                    // Quota exceeded or forbidden — try next key/model
                    lastError = 'QUOTA_EXCEEDED';
                    continue;
                }

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) {
                    lastError = 'Empty AI response';
                    continue;
                }
                return { text: text.trim(), model, data };
            } catch (err) {
                lastError = err.message || 'Network error';
                continue;
            }
        }
    }

    const error = new Error(lastError);
    error.code = lastError === 'QUOTA_EXCEEDED' ? 'QUOTA_EXCEEDED' : 'AI_ERROR';
    throw error;
}

/**
 * Simple text prompt to Gemini.
 * @param {string} prompt - The text prompt
 * @returns {Promise<string>} - The AI response text
 */
export async function askGemini(prompt) {
    const result = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
    });
    return result.text;
}

/**
 * Image analysis with Gemini (for crop scanner).
 * @param {string} prompt - The text prompt
 * @param {string} base64Data - Base64 encoded image (without data:... prefix)
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<string>} - The AI response text
 */
export async function analyzeImage(prompt, base64Data, mimeType) {
    const result = await callGemini({
        contents: [{
            role: 'user',
            parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } },
            ],
        }],
    });
    return result.text;
}
