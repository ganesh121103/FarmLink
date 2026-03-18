import React from 'react';

const Badge = ({ children, color = "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-400", className = "" }) => (
    <span className={`${color} text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide inline-block mb-0 ${className}`}>{children}</span>
);

export default Badge;
