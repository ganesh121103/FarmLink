import React, { useState } from 'react';

/**
 * UserAvatar — Reusable avatar component used throughout FarmLink.
 *
 * Shows the user/farmer profile image if available.
 * Falls back to the first initial letter of the name if:
 *   - No image URL is provided, OR
 *   - The image URL fails to load (broken link, 404, etc.)
 *
 * Props:
 *   name       {string}   — Full name. First letter is used as fallback.
 *   image      {string}   — Image URL (optional).
 *   size       {string}   — Tailwind size classes, e.g. "w-8 h-8". Default: "w-10 h-10"
 *   textSize   {string}   — Tailwind text size for the initial. Default: "text-base"
 *   rounded    {string}   — Tailwind rounded class. Default: "rounded-full"
 *   className  {string}   — Extra classes appended to the container.
 */
const UserAvatar = ({
    name = '',
    image = '',
    size = 'w-10 h-10',
    textSize = 'text-base',
    rounded = 'rounded-full',
    className = '',
}) => {
    const [imgError, setImgError] = useState(false);

    const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?';
    const showImage = image && !imgError;

    return (
        <div
            className={`${size} ${rounded} bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/40 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
        >
            {showImage ? (
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span
                    className={`${textSize} font-black text-green-700 dark:text-green-400 select-none leading-none`}
                >
                    {initial}
                </span>
            )}
        </div>
    );
};

export default UserAvatar;
