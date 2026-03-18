import React, { useState } from 'react';
import { PlusCircle, CheckCircle, ShoppingCart, Lock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button", ...props }) => {
    const baseStyle = "px-6 py-2.5 rounded-lg font-bold transition-all duration-300 transform flex items-center justify-center gap-2 active:scale-95";
    const variants = {
        primary: "bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30 border-none",
        secondary: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30",
        outline: "bg-transparent border-2 border-green-700 text-green-900 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-slate-800",
        white: "bg-white text-black hover:bg-stone-100 shadow-lg dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-md"
    };
    return <button type={type} onClick={disabled ? undefined : onClick} className={`${baseStyle} ${variants[variant]} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`} {...props}>{children}</button>;
};

// Add to Cart Micro-Interaction Component
export const AddToCartButton = ({ product, className = "", fullWidth = false }) => {
    const { addToCart, user, t } = useAppContext();
    const [added, setAdded] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        if (user?.role === 'farmer' || user?.role === 'admin') return;
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    if (user?.role === 'farmer' || user?.role === 'admin') {
        return <Button disabled className={className}><Lock size={18} /> Unavailable</Button>
    }

    if (fullWidth) {
        return (
            <Button onClick={handleClick} className={`w-full py-5 text-xl shadow-xl transition-all duration-300 ${added ? 'bg-green-800 dark:bg-green-500 scale-[0.98]' : 'hover:-translate-y-1'}`}>
                {added ? <CheckCircle className="mr-2 animate-pulse" /> : <ShoppingCart className="mr-2" />}
                {added ? "Added to Cart!" : t('addToCart')}
            </Button>
        )
    }

    return (
        <button aria-label="Add to Cart" onClick={handleClick} className={`p-3 rounded-xl transition-all duration-300 ${added ? 'bg-green-600 text-white scale-110 shadow-lg' : 'bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-slate-300 hover:bg-green-700 hover:text-white'} ${className}`}>
            {added ? <CheckCircle size={20} className="animate-pulse" /> : <PlusCircle size={20} />}
        </button>
    )
};
