import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

/**
 * getGreeting — Returns time-aware greeting, emoji, and subtitle.
 * @param {string} role  'farmer' | 'customer' | 'admin'
 */
function getGreeting(role) {
    const hour = new Date().getHours();

    let period, emoji;
    if (hour >= 5 && hour < 12)  { period = 'Good morning';   emoji = '🌅'; }
    else if (hour >= 12 && hour < 17) { period = 'Good afternoon'; emoji = '☀️'; }
    else if (hour >= 17 && hour < 21) { period = 'Good evening';   emoji = '🌇'; }
    else                               { period = 'Good night';     emoji = '🌙'; }

    const subtitles = {
        farmer: {
            morning:   'Your crops are waiting. Let\'s have a productive day! 🌾',
            afternoon: 'Hope your harvest is going well. Check your orders below.',
            evening:   'Great work today! Review your sales and plan for tomorrow.',
            night:     'Rest well, farmer. Your fields will be ready in the morning.',
        },
        customer: {
            morning:   'Start your day with fresh, farm-direct produce. 🥦',
            afternoon: 'Looking for something fresh? Browse the marketplace!',
            evening:   'Dinner ideas? Find fresh ingredients from local farmers.',
            night:     'Planning tomorrow\'s meals? Your wishlist is ready.',
        },
        admin: {
            morning:   'Platform is running smoothly. Stay on top of things! 🛡️',
            afternoon: 'Midday check-in. Review pending verifications below.',
            evening:   'Wrapping up the day. Check today\'s platform stats.',
            night:     'Late night admin session. All systems operational.',
        },
    };

    const mapPeriod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    const subtitle = subtitles[role]?.[mapPeriod] || subtitles.customer[mapPeriod];

    return { greeting: period, emoji, subtitle };
}

/**
 * formatDate — e.g. "Friday, 18 April 2026"
 */
function formatDate() {
    return new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * formatClock — 12-hour clock, e.g. "10:45 AM" or "1:07 PM"
 */
function formatClock(date) {
    let h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;                        // convert 0 → 12, 13 → 1, etc.
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${h}:${mm}:${ss} ${ampm}`;
}

/**
 * DashboardGreeting
 * Props:
 *   user   — the logged-in user object { name, image, role }
 *   extra  — optional JSX rendered to the right (e.g. action buttons)
 */
const DashboardGreeting = ({ user, extra }) => {
    const [time, setTime] = useState(new Date());
    const [imgError, setImgError] = useState(false);

    // Live clock — tick every second for the visible clock display
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1_000);
        return () => clearInterval(id);
    }, []);

    const { greeting, emoji, subtitle } = getGreeting(user?.role || 'customer');
    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-fade-in-down">
            {/* Left: avatar + text */}
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-green-50 dark:bg-green-900/30 border-2 border-green-100 dark:border-green-800/50 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                    {user?.image && !imgError ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-2xl font-black text-green-700 dark:text-green-400 select-none">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                    )}
                </div>

                {/* Text */}
                <div>
                    {/* Date + live clock */}
                    <div className="flex items-center gap-3 mb-0.5">
                        <p className="text-xs font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
                            {formatDate()}
                        </p>
                        <span className="text-xs font-black text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 px-2 py-0.5 rounded-md tabular-nums">
                            {formatClock(time)}
                        </span>
                    </div>

                    {/* Main greeting */}
                    <h1 className="text-2xl md:text-3xl font-black text-black dark:text-white leading-tight">
                        {emoji} {greeting},{' '}
                        <span className="text-green-600 dark:text-green-400">{firstName}!</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-0.5">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Right: action buttons slot */}
            {extra && (
                <div className="flex gap-3 flex-wrap">
                    {extra}
                </div>
            )}
        </div>
    );
};

export default DashboardGreeting;
