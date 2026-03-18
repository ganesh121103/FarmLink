import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type = "text", placeholder, value, onChange, className = "", required = false, error = "" }) => {
    const [show, setShow] = useState(false);
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-bold text-black dark:text-slate-300">{label}</label>}
            <div className="relative">
                <input
                    type={type === 'password' ? (show ? 'text' : 'password') : type}
                    placeholder={placeholder} value={value} onChange={onChange} required={required}
                    className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-stone-300 dark:border-slate-600'} rounded-lg focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-800 text-black dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500`}
                />
                {type === 'password' && (
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-stone-500" aria-label="Toggle Password Visibility">
                        {show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <span className="text-xs text-red-500 font-medium mt-1">{error}</span>}
        </div>
    );
};

export default Input;
