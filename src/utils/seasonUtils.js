/**
 * seasonUtils.js
 * Determines the Indian agricultural season from the current month and maps
 * product names/categories to a seasonal badge if they are currently in season.
 */

// ─── Indian Season Map (month index 0 = Jan) ────────────────────────────────
const SEASON_BY_MONTH = {
    0:  'winter',   // January
    1:  'winter',   // February
    2:  'summer',   // March
    3:  'summer',   // April
    4:  'summer',   // May
    5:  'summer',   // June  (pre-monsoon)
    6:  'monsoon',  // July
    7:  'monsoon',  // August
    8:  'monsoon',  // September
    9:  'autumn',   // October
    10: 'autumn',   // November
    11: 'winter',   // December
};

// ─── Season display config ───────────────────────────────────────────────────
export const SEASON_CONFIG = {
    summer: {
        label: '☀️ Summer Pick',
        badge: 'Summer Pick',
        emoji: '☀️',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-700/50',
    },
    monsoon: {
        label: '🌧️ Monsoon Fresh',
        badge: 'Monsoon Fresh',
        emoji: '🌧️',
        bg: 'bg-sky-100 dark:bg-sky-900/30',
        text: 'text-sky-800 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-700/50',
    },
    winter: {
        label: '❄️ Winter Harvest',
        badge: 'Winter Harvest',
        emoji: '❄️',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-700/50',
    },
    autumn: {
        label: '🍂 Autumn Crop',
        badge: 'Autumn Crop',
        emoji: '🍂',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-700/50',
    },
};

// ─── Produce keywords by season ─────────────────────────────────────────────
// Each array contains lowercase substrings matched against product name + category
const SEASONAL_PRODUCE = {
    summer: [
        'mango', 'watermelon', 'melon', 'litchi', 'lichi', 'jackfruit',
        'cucumber', 'pumpkin', 'bitter gourd', 'bottle gourd', 'ridge gourd',
        'raw mango', 'raw banana', 'raw papaya', 'papaya', 'taro', 'pointed gourd',
        'okra', 'lady finger', 'bhindi', 'brinjal', 'eggplant', 'sweet corn', 'corn',
        'onion', 'tomato', 'cluster beans', 'lemon', 'lime', 'plum', 'kokum',
        'sugarcane', 'tender coconut', 'coconut',
    ],
    monsoon: [
        'rice', 'paddy', 'soybean', 'soya', 'groundnut', 'peanut', 'maize',
        'jowar', 'bajra', 'pearl millet', 'green moong', 'moong dal',
        'yam', 'colocasia', 'arbi', 'drumstick', 'moringa',
        'mushroom', 'ginger', 'turmeric', 'raw turmeric', 'black pepper',
        'arhar', 'toor dal', 'tur dal',
    ],
    autumn: [
        'pomegranate', 'guava', 'fig', 'persimmon', 'grapes',
        'sweet potato', 'lotus root', 'capsicum', 'bell pepper',
        'chickpea', 'chana', 'green peas', 'pea', 'mustard', 'sesame',
        'amla', 'gooseberry', 'tamarind', 'orange', 'mandarin', 'sweet lime', 'mosambi',
        'radish', 'turnip', 'beetroot',
    ],
    winter: [
        'carrot', 'cauliflower', 'cabbage', 'peas', 'spinach', 'methi',
        'fenugreek', 'mustard greens', 'sarson', 'coriander', 'broccoli',
        'lettuce', 'celery', 'potato', 'wheat', 'barley', 'oats',
        'strawberry', 'apple', 'pear', 'kiwi', 'chestnut', 'walnut', 'almond',
        'milk', 'dairy', 'butter', 'paneer', 'ghee', 'cream',
        'garlic', 'onion', 'leek', 'celeriac',
        'basmati', 'sugar beet', 'colocasia', 'arbi',
    ],
};

// ─── Public helpers ──────────────────────────────────────────────────────────

/** Returns the current Indian season key ('summer' | 'monsoon' | 'winter' | 'autumn') */
export function getCurrentSeason() {
    const month = new Date().getMonth(); // 0-indexed
    return SEASON_BY_MONTH[month] || 'summer';
}

/**
 * Returns the season that matches the product, or null if it doesn't fit any season.
 * Checks both the product name and category against the seasonal produce lists.
 *
 * @param {{ name: string, category?: string, tags?: string[] }} product
 * @returns {{ season: string, config: object } | null}
 */
export function getProductSeasonalTag(product) {
    const haystack = `${product.name} ${product.category || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

    const currentSeason = getCurrentSeason();

    // Check current season first (priority)
    const currentKeywords = SEASONAL_PRODUCE[currentSeason] || [];
    if (currentKeywords.some(kw => haystack.includes(kw))) {
        return { season: currentSeason, config: SEASON_CONFIG[currentSeason] };
    }

    // Check other seasons (product might be labelled but not in season — still worth showing)
    // We skip this to avoid showing wrong tags; only show if currently in season.
    return null;
}
