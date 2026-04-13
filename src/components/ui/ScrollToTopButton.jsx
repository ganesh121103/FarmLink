import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div 
            className={`fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-[100] pointer-events-none transition-all duration-300 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            <button
                type="button"
                onClick={scrollToTop}
                className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/40 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-green-600 dark:text-green-400 hover:bg-white dark:hover:bg-gray-800 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-out group"
                aria-label="Scroll to top"
            >
                <ArrowUp 
                    size={22} 
                    strokeWidth={2.5} 
                    className="group-hover:-translate-y-0.5 transition-transform duration-300" 
                />
            </button>
        </div>
    );
};

export default ScrollToTopButton;
