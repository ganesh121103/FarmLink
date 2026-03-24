import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { apiCall } from '../api/apiCall';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const t = (key) => TRANSLATIONS[language]?.[key] || key;

    const [view, setView] = useState('home');
    const [history, setHistory] = useState(['home']);
    const [activeChat, setActiveChat] = useState(null);

    const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('farmlink_user')) || null; } catch { return null; } });
    const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('farmlink_cart')) || []; } catch { return []; } });
    const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('farmlink_wishlist')) || []; } catch { return []; } });

    const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false);
    const [toasts, setToasts] = useState([]);

    useEffect(() => { localStorage.setItem('farmlink_user', JSON.stringify(user)); }, [user]);
    useEffect(() => { localStorage.setItem('farmlink_cart', JSON.stringify(cart)); }, [cart]);
    useEffect(() => { localStorage.setItem('farmlink_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
    useEffect(() => { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDarkMode]);

    const navigate = (newView) => {
        if (newView === view) return;
        setView(newView);
        setHistory(prev => [...prev, newView]);
        window.scrollTo(0, 0);
    };

    // Handle global auth expiration
    useEffect(() => {
        const handleAuthExpired = () => { handleLogout(); addToast("Session expired. Please log in again."); navigate('login'); };
        document.addEventListener('auth-expired', handleAuthExpired);
        return () => document.removeEventListener('auth-expired', handleAuthExpired);
    }, []);

    // Handle cart clear from nested functions
    useEffect(() => {
        const handleClear = () => setCart([]);
        document.addEventListener('clear-cart', handleClear);
        return () => document.removeEventListener('clear-cart', handleClear);
    }, []);

    const addToast = (message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const toggleDarkMode = () => setIsDarkMode(d => !d);

    const toggleWishlist = (product) => {
        if (!user) { addToast("Please login to add to wishlist."); navigate('login'); return; }
        const exists = wishlist.findIndex(item => item._id === product._id);
        if (exists > -1) { setWishlist(prev => prev.filter(item => item._id !== product._id)); addToast(t('removedFromWishlist')); }
        else { setWishlist(prev => [...prev, product]); addToast(t('addedToWishlist')); }
    };

    const removeFromWishlist = (product) => { setWishlist(prev => prev.filter(item => item._id !== product._id)); addToast(t('removedFromWishlist')); };

    const addToCart = (product) => {
        if (user && user.role === 'admin') return;
        setCart(prev => {
            const idx = prev.findIndex(item => item._id === product._id);
            if (idx > -1) { const updated = [...prev]; updated[idx].quantity = (updated[idx].quantity || 1) + 1; return updated; }
            return [...prev, { ...product, quantity: 1 }];
        });
        addToast(`${t('addToCart')}: ${product.name}`);
    };

    const updateCartQuantity = (id, quantity) => { if (quantity < 1) return; setCart(prev => prev.map(item => item._id === id ? { ...item, quantity } : item)); };
    const removeFromCart = (id) => setCart(prev => prev.filter(item => item._id !== id));

    const handleLogout = () => { setUser(null); setCart([]); setWishlist([]); setHistory(['home']); setView('home'); localStorage.removeItem('farmlink_user'); localStorage.removeItem('farmlink_cart'); localStorage.removeItem('farmlink_wishlist'); };

    const contextValue = {
        user, setUser, cart, setCart, wishlist, setWishlist,
        language, setLanguage, t,
        isDarkMode, toggleDarkMode,
        toasts, addToast,
        view, setView, history, setHistory, navigate,
        handleLogout,
        toggleWishlist, removeFromWishlist, addToCart, removeFromCart, updateCartQuantity,
        activeChat, setActiveChat,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
