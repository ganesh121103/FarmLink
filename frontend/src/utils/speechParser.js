/**
 * Natural language parser for FarmLink Voice Commerce.
 * Detects intent (navigate, add_to_cart, search) from recognized speech.
 */

const normalize = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();

export const parseSpeechCommand = (transcript, products) => {
    const text = normalize(transcript);
    
    if (!text) return { intent: 'unknown' };

    // ─── 1. Navigation Intent ───────────────────────────────────────────────
    const navKeywords = ['go to', 'open', 'show', 'take me to', 'navigate to', 'मुझे', 'जाओ', 'दिखाओ', 'उघडा', 'दाखवा'];
    
    // Map of synonyms to standard views
    const viewMap = {
        'dashboard': ['dashboard', 'my dashboard', 'profile', 'डैशबोर्ड', 'डॅशबोर्ड'],
        'activity': ['cart', 'my cart', 'shopping cart', 'activity', 'my activity', 'orders', 'कार्ट', 'माझे कार्ट'],
        'products': ['marketplace', 'shop', 'store', 'market', 'products', 'produce', 'बाज़ार', 'बाजार', 'खरेदी'],
        'about': ['about', 'about us', 'mission', 'के बारे में', 'बद्दल'],
        'farmers': ['farmers', 'local farmers', 'farmer list', 'किसान', 'शेतकरी'],
        'chatbot': ['chatbot', 'chat bot', 'ai', 'ai chatbot', 'assistant', 'चैटबॉट', 'चॅटबॉट'],
        'home': ['home', 'home page', 'start', 'होम']
    };

    if (navKeywords.some(kw => text.includes(kw)) || Object.values(viewMap).flat().some(v => text.includes(v))) {
        for (const [view, synonyms] of Object.entries(viewMap)) {
            if (synonyms.some(s => text.includes(s))) {
                return { intent: 'navigate', view, match: text };
            }
        }
    }

    // ─── 2. Add to Cart Intent ──────────────────────────────────────────────
    const cartKeywords = ['add', 'buy', 'purchase', 'put in cart', 'खरीदें', 'कार्ट में जोड़ें', 'खरेदी करा', 'कार्टमध्ये जोडा'];
    
    if (cartKeywords.some(kw => text.includes(kw))) {
        // Try to match a product name in the speech
        if (products && products.length > 0) {
            // Sort by length descending to match longest product names first
            const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
            
            for (const product of sortedProducts) {
                const pName = normalize(product.name);
                // Also check category for loose matches
                const pCat = normalize(product.category || '');
                
                if (text.includes(pName) || (pName.length > 3 && text.includes(pName.substring(0, pName.length - 1)))) {
                    return { intent: 'add_to_cart', product, match: text };
                }
            }
        }
    }

    // ─── 3. Search Intent ───────────────────────────────────────────────────
    const searchKeywords = ['search', 'find', 'looking for', 'खोजें', 'ढूंढें', 'शोधा'];
    
    if (searchKeywords.some(kw => text.includes(kw))) {
        let query = text;
        // Strip the keyword from the query
        for (const kw of searchKeywords) {
            if (text.startsWith(kw)) {
                query = text.replace(kw, '').trim();
                break;
            }
        }
        return { intent: 'search', query, match: text };
    }

    // ─── 4. Language Change Intent ──────────────────────────────────────────
    const langKeywords = [
        'change language', 'speak in', 'switch to', 'language', 'भाषा', 'मराठीत', 'हिंदी में', 
        'english', 'hindi', 'marathi', 'मराठी', 'हिंदी', 'हिन्दी', 'इंग्लिश', 'अंग्रेजी', 'इंग्रजी'
    ];
    
    if (langKeywords.some(kw => text.includes(kw))) {
        if (text.includes('hindi') || text.includes('हिंदी') || text.includes('हिन्दी')) {
            return { intent: 'change_language', langCode: 'hi', match: text };
        } else if (text.includes('marathi') || text.includes('मराठी')) {
            return { intent: 'change_language', langCode: 'mr', match: text };
        } else if (text.includes('english') || text.includes('अंग्रेजी') || text.includes('इंग्रजी') || text.includes('इंग्लिश')) {
            return { intent: 'change_language', langCode: 'en', match: text };
        }
    }

    // Direct product mention without explicit "add/buy" (e.g. user just says "Tomato")
    // If it perfectly matches a product, let's treat it as a search
    if (products && products.length > 0) {
        const exactProductMatch = products.find(p => text.includes(normalize(p.name)));
        if (exactProductMatch) {
            return { intent: 'search', query: normalize(exactProductMatch.name), match: text };
        }
    }

    return { intent: 'unknown', transcript };
};
