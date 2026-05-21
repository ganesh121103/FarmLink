import React from 'react';

const Card = ({ children, className = "", onClick, tabIndex }) => (
    <div
        onClick={onClick}
        tabIndex={tabIndex}
        onKeyDown={(e) => { if (onClick && e.key === 'Enter') onClick(); }}
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-stone-100 dark:border-slate-700 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </div>
);

export default Card;
