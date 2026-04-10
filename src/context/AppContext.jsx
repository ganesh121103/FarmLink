import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { TRANSLATIONS, API_BASE_URL } from '../constants';
import { apiCall } from '../api/apiCall';
import { io } from 'socket.io-client';
import { onAuthChange, logoutFirebase } from '../auth/firebaseAuth';
import { requestForToken, onMessageListener } from '../firebase';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => { try { return localStorage.getItem('farmlink_language') || 'en'; } catch { return 'en'; } });
    const t = (key) => TRANSLATIONS[language]?.[key] || key;
    
    useEffect(() => { localStorage.setItem('farmlink_language', language); }, [language]);

    const [view, setView] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('view') || 'home';
        } catch {
            return 'home';
        }
    });
    const [history, setHistory] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const initialView = params.get('view') || 'home';
            return [initialView];
        } catch {
            return ['home'];
        }
    });
    const [activeChat, setActiveChat] = useState(null);

    const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('farmlink_user')) || null; } catch { return null; } });
    const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('farmlink_cart')) || []; } catch { return []; } });
    const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('farmlink_wishlist')) || []; } catch { return []; } });

    // ── Notification state ──────────────────────────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationPollRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await apiCall('/notifications', 'GET');
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (e) {
            // silently fail — notifications are non-critical
        }
    }, [user?.token]);

    // Poll every 30 seconds while logged in
    useEffect(() => {
        if (user?.token) {
            fetchNotifications();
            notificationPollRef.current = setInterval(fetchNotifications, 30000);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (notificationPollRef.current) clearInterval(notificationPollRef.current);
        }
        return () => { if (notificationPollRef.current) clearInterval(notificationPollRef.current); };
    }, [user?.token, fetchNotifications]);

    const markNotificationRead = async (id) => {
        try {
            await apiCall(`/notifications/${id}/read`, 'PUT');
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { /* silent */ }
    };

    const markAllNotificationsRead = async () => {
        try {
            await apiCall('/notifications/mark-all-read', 'PUT');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { /* silent */ }
    };

    const clearAllNotifications = async () => {
        try {
            await apiCall('/notifications/clear-all', 'DELETE');
            setNotifications([]);
            setUnreadCount(0);
        } catch (e) { /* silent */ }
    };
    // ────────────────────────────────────────────────────────────────────

    // ── FCM Push Notifications setup ────────────────────────────────────
    useEffect(() => {
        if (!user || user.role === 'admin') return;

        const setupFCM = async () => {
            try {
                // Request token
                const fcmToken = await requestForToken();
                if (fcmToken) {
                    // Send to backend
                    await apiCall(`/users/${user._id || user.id}`, 'PUT', { fcmToken });
                }
            } catch (err) {
                console.warn("FCM Token setup failed:", err);
            }
        };

        setupFCM();

        // Listen for foreground messages
        onMessageListener().then(payload => {
            if (payload?.notification) {
                addToast(`🔔 ${payload.notification.title}`);
                fetchNotifications(); // Refresh the bell
            }
        }).catch(err => console.log('failed to setup listener: ', err));

    }, [user?._id, user?.token]);
    // ────────────────────────────────────────────────────────────────────

    const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false);
    const [toasts, setToasts] = useState([]);
    const socketRef = useRef(null);
    // Global state refs for socket event handlers
    const activeChatRef = useRef(activeChat);
    useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

    // Socket.IO connection management
    useEffect(() => {
        if (user?._id) {
            const SOCKET_URL = API_BASE_URL.replace('/api', '');
            const socket = io(SOCKET_URL, { query: { userId: user._id }, transports: ['websocket', 'polling'] });
            
            socket.on('receive_message', (msg) => {
                const isWatchingConversation = activeChatRef.current?.id === msg.senderId;
                if (!isWatchingConversation && msg.senderId !== user._id) {
                    addToast(`New message from ${msg.senderName}`);
                }
            });

            socketRef.current = socket;
            return () => { socket.disconnect(); socketRef.current = null; };
        } else {
            if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
        }
    }, [user?._id]);

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthChange((firebaseUser) => {
            if (firebaseUser) {
                console.log('🔥 Firebase session active:', firebaseUser.email);
            } else {
                console.log('🔥 Firebase session ended');
            }
        });
        return () => unsubscribe();
    }, []);

    const openChat = (chatUser) => {
        if (!user) { addToast('Please login to chat.'); navigate('login'); return; }
        setActiveChat({ 
            id: chatUser._id || chatUser.id, 
            name: chatUser.name, 
            role: chatUser.role || 'farmer',
            image: chatUser.image
        });
    };

    useEffect(() => { localStorage.setItem('farmlink_user', JSON.stringify(user)); }, [user]);
    useEffect(() => { localStorage.setItem('farmlink_cart', JSON.stringify(cart)); }, [cart]);
    useEffect(() => { localStorage.setItem('farmlink_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
    useEffect(() => { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDarkMode]);

    const viewRef = useRef(view);
    useEffect(() => { viewRef.current = view; }, [view]);

    const navigate = (newView) => {
        if (newView === viewRef.current) return;
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

    // ── Wishlist — synced to DB for logged-in customers ─────────────────
    const toggleWishlist = async (product) => {
        if (!user) { addToast("Please login to add to wishlist."); navigate('login'); return; }

        const exists = wishlist.findIndex(item => item._id === product._id) > -1;

        // Optimistic local update
        if (exists) {
            setWishlist(prev => prev.filter(item => item._id !== product._id));
            addToast(t('removedFromWishlist'));
        } else {
            setWishlist(prev => [...prev, product]);
            addToast(t('addedToWishlist'));
        }

        // Sync to DB (customers only)
        if (user.role === 'customer' && user._id && user.token) {
            try {
                await apiCall(`/users/${user._id}/wishlist/toggle`, 'PUT', { productId: product._id });
            } catch (e) {
                console.warn('[Wishlist] DB sync failed:', e.message);
            }
        }
    };

    const removeFromWishlist = async (product) => {
        setWishlist(prev => prev.filter(item => item._id !== product._id));
        addToast(t('removedFromWishlist'));
        if (user?.role === 'customer' && user._id && user.token) {
            try {
                await apiCall(`/users/${user._id}/wishlist/toggle`, 'PUT', { productId: product._id });
            } catch (e) { /* silent */ }
        }
    };
    // ────────────────────────────────────────────────────────────────────

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

    const handleLogout = async () => {
        logoutFirebase();
        if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
        if (notificationPollRef.current) clearInterval(notificationPollRef.current);
        setUser(null); setCart([]); setWishlist([]);
        setNotifications([]); setUnreadCount(0);
        setHistory(['home']); setView('home');
        localStorage.removeItem('farmlink_user');
        localStorage.removeItem('farmlink_cart');
        localStorage.removeItem('farmlink_wishlist');
    };

    const contextValue = {
        user, setUser, cart, setCart, wishlist, setWishlist,
        language, setLanguage, t,
        isDarkMode, toggleDarkMode,
        toasts, addToast,
        view, setView, history, setHistory, navigate,
        handleLogout,
        toggleWishlist, removeFromWishlist, addToCart, removeFromCart, updateCartQuantity,
        activeChat, setActiveChat, openChat, socket: socketRef,
        // Notifications
        notifications, unreadCount, fetchNotifications,
        markNotificationRead, markAllNotificationsRead, clearAllNotifications,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};


