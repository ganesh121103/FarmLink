import React, { useState, useEffect, useMemo } from 'react';
import {
    Bell, CheckCheck, Trash2, Filter, Package, Star, ShoppingBag,
    Info, TrendingDown, AlertTriangle, Sparkles, Search, X, RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { typeConfig } from '../components/ui/NotificationBell';

/* ── Helpers ────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const formatDate = (dateStr) => {
    const d   = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === now.toDateString())        return 'Today';
    if (d.toDateString() === yesterday.toDateString())  return 'Yesterday';
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
};

const groupByDate = (notifs) => {
    const groups = {};
    notifs.forEach((n) => {
        const label = formatDate(n.createdAt);
        if (!groups[label]) groups[label] = [];
        groups[label].push(n);
    });
    return groups;
};

/* ── Tab definitions ─────────────────────────────────────────── */
const TABS = [
    { key: 'All',             label: 'All',              icon: Bell,          types: null },
    { key: 'Orders',          label: 'Orders',           icon: Package,       types: ['Order'] },
    { key: 'Wishlist',        label: 'Wishlist',         icon: Star,          types: ['Wishlist', 'OutOfStock'] },
    { key: 'Arrivals',        label: 'New Arrivals',     icon: Sparkles,      types: ['NewArrival', 'Recommendation'] },
    { key: 'Deals',           label: 'Price Drops',      icon: TrendingDown,  types: ['PriceDrop'] },
    { key: 'System',          label: 'System',           icon: Info,          types: ['System'] },
];

/* ════════════════════════════════════════════════════════════════
   NotificationsPage
   ════════════════════════════════════════════════════════════════ */
const NotificationsPage = ({ BackBtn }) => {
    const {
        notifications, unreadCount, fetchNotifications,
        markNotificationRead, markAllNotificationsRead, clearAllNotifications,
        navigate
    } = useAppContext();

    const [activeTab,   setActiveTab]   = useState('All');
    const [search,      setSearch]      = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [animIn,      setAnimIn]      = useState(false);

    useEffect(() => { setAnimIn(true); }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchNotifications();
        setTimeout(() => setIsRefreshing(false), 600);
    };

    /* ── Filter notifications ── */
    const filtered = useMemo(() => {
        const tab = TABS.find(t => t.key === activeTab);
        let list = notifications;
        if (tab?.types) list = list.filter(n => tab.types.includes(n.type));
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(n =>
                n.title?.toLowerCase().includes(q) ||
                n.message?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [notifications, activeTab, search]);

    const grouped = useMemo(() => groupByDate(filtered), [filtered]);
    const dateKeys = Object.keys(grouped);

    const handleClick = async (notif) => {
        if (!notif.isRead) await markNotificationRead(notif._id);
        if (notif.link) navigate('products');
    };

    /* ── Tab badge count ── */
    const tabCount = (tab) => {
        if (!tab.types) return unreadCount;
        return notifications.filter(n => tab.types.includes(n.type) && !n.isRead).length;
    };

    return (
        <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 max-w-3xl mx-auto transition-all duration-500 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* ── Page Header ── */}
            <div className="flex items-center gap-4 mb-6">
                {BackBtn && <BackBtn />}
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/30">
                            <Bell size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Notifications</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllNotificationsRead}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                        >
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAllNotifications}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <Trash2 size={14} /> Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* ── Search bar ── */}
            <div className="relative mb-5">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const cnt  = tabCount(tab);
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                isActive
                                    ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-green-900/30'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Icon size={13} />
                            {tab.label}
                            {cnt > 0 && (
                                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                                    isActive ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                                }`}>
                                    {cnt > 9 ? '9+' : cnt}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Notification groups ── */}
            {dateKeys.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400 dark:text-gray-600">
                    <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Bell size={36} strokeWidth={1.2} />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-gray-500 dark:text-gray-400">No notifications</p>
                        <p className="text-sm mt-1">
                            {search ? 'No results for your search.' : "You're all caught up! We'll notify you when something happens."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {dateKeys.map((dateLabel) => (
                        <div key={dateLabel}>
                            {/* Date separator */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                                <span className="text-[11px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2">
                                    {dateLabel}
                                </span>
                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                            </div>

                            {/* Cards */}
                            <div className="space-y-2">
                                {grouped[dateLabel].map((notif, idx) => {
                                    const cfg  = typeConfig[notif.type] || typeConfig.System;
                                    const Icon = cfg.icon;
                                    return (
                                        <button
                                            key={notif._id}
                                            onClick={() => handleClick(notif)}
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                            className={`
                                                w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all
                                                animate-fade-in-up
                                                ${!notif.isRead
                                                    ? 'bg-white dark:bg-gray-900 border-green-100 dark:border-green-900/30 shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-900/50 border-transparent'
                                                }
                                                hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700
                                            `}
                                        >
                                            {/* Left: image or icon */}
                                            <div className={`flex-shrink-0 relative w-14 h-14 rounded-2xl overflow-hidden ${cfg.bg} flex items-center justify-center`}>
                                                {notif.image
                                                    ? <img src={notif.image} alt="" className="w-full h-full object-cover" />
                                                    : <Icon size={26} className={cfg.color} />
                                                }
                                                {!notif.isRead && (
                                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className={`text-sm font-black leading-snug ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 whitespace-nowrap">
                                                        {timeAgo(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                                        {cfg.label}
                                                    </span>
                                                    {!notif.isRead && (
                                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400">
                                                            • New
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Bottom summary */}
                    <p className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">
                        Showing {filtered.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
