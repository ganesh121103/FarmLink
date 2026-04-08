import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ShoppingBag, Star, Package, Info, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/* ── Helpers ─────────────────────────────────────────── */
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const typeConfig = {
    Wishlist:       { icon: Star,        color: 'text-pink-500',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
    Recommendation: { icon: ShoppingBag, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
    Order:          { icon: Package,     color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    System:         { icon: Info,        color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-gray-800' },
};

/* ── Component ───────────────────────────────────────── */
const NotificationBell = ({ onProductClick }) => {
    const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useAppContext();
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = async (notif) => {
        if (!notif.isRead) await markNotificationRead(notif._id);
        if (notif.link && onProductClick) onProductClick(notif.link);
        setOpen(false);
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                id="notification-bell-btn"
                onClick={() => setOpen(o => !o)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={`Notifications: ${unreadCount} unread`}
            >
                <Bell size={22} className={unreadCount > 0 ? 'text-green-600 dark:text-green-400 animate-[wiggle_0.6s_ease-in-out]' : 'text-gray-600 dark:text-gray-300'} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-bounce-short">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    id="notification-panel"
                    className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-h-[520px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[999] animate-slide-down"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-green-600 dark:text-green-400" />
                            <span className="font-black text-sm text-gray-900 dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllNotificationsRead}
                                    title="Mark all as read"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                >
                                    <CheckCheck size={14} /> All read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    title="Clear all"
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 dark:text-gray-600">
                                <Bell size={36} strokeWidth={1.5} />
                                <p className="text-sm font-semibold">You're all caught up!</p>
                                <p className="text-xs text-center px-8">We'll notify you when there's activity relevant to you.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const cfg = typeConfig[notif.type] || typeConfig.System;
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={notif._id}
                                        onClick={() => handleClick(notif)}
                                        className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${!notif.isRead ? 'bg-green-50/60 dark:bg-green-900/10' : ''}`}
                                    >
                                        {/* Image or icon */}
                                        <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            {notif.image
                                                ? <img src={notif.image} alt="" className="w-full h-full object-cover" />
                                                : <div className={`w-full h-full flex items-center justify-center ${cfg.bg}`}>
                                                    <Icon size={20} className={cfg.color} />
                                                  </div>
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <p className={`text-xs font-black leading-tight line-clamp-1 ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-0.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                                                    {notif.type}
                                                </span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-600">
                                                    {timeAgo(notif.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {notif.link && (
                                            <ArrowRight size={14} className="flex-shrink-0 text-gray-300 dark:text-gray-600 mt-1" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-center">
                            <p className="text-[11px] text-gray-400 dark:text-gray-600">
                                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
