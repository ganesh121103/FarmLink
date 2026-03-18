import React from 'react';
import { Leaf, ShoppingBasket, User, LogOut, Sun, Moon, Globe, Menu, X, ChevronDown, ShoppingCart } from 'lucide-react';
import Badge from '../ui/Badge';
import { useAppContext } from '../../context/AppContext';

const Navbar = ({ isMenuOpen, setIsMenuOpen, setSelectedFarmer }) => {
    const { user, cart, t, isDarkMode, toggleDarkMode, language, setLanguage, navigate, handleLogout, view } = useAppContext();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const navLinks = [
        { key: 'home', label: t('home') },
        { key: 'farmers', label: t('farmers') },
        { key: 'products', label: t('marketplace') },
        { key: 'about', label: t('about') },
    ];

    const handleNavClick = (key) => {
        if (key === 'products') setSelectedFarmer(null);
        navigate(key);
        setIsMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-stone-100 dark:border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2 font-black text-xl text-green-800 dark:text-green-400 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                        <Leaf size={24} className="fill-current" />
                        <span>FarmLink</span>
                    </button>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <button
                                key={link.key}
                                onClick={() => handleNavClick(link.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === link.key
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'text-stone-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className="relative hidden sm:block">
                            <div className="flex items-center gap-1 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer" onClick={() => setLanguage(language === 'en' ? 'hi' : language === 'hi' ? 'mr' : 'en')} title="Change Language">
                                <Globe size={18} className="text-stone-500 dark:text-slate-400" />
                                <span className="text-xs font-bold text-stone-600 dark:text-slate-400 uppercase">{language}</span>
                                <ChevronDown size={14} className="text-stone-400" />
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-stone-500" />}
                        </button>

                        {/* Cart Button */}
                        {user?.role === 'customer' && (
                            <button
                                onClick={() => navigate('activity')}
                                className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label={`Cart: ${cartCount} items`}
                            >
                                <ShoppingBasket size={22} className="text-stone-600 dark:text-slate-400" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* User Menu / Auth Buttons */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('dashboard')}
                                    className="px-3 py-2 text-sm font-bold text-stone-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('profile')}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-700 dark:text-green-400">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-black dark:text-slate-200 max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                                    {user.role === 'admin' && <Badge color="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">Admin</Badge>}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    aria-label="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('login')}
                                    className="px-4 py-2 text-sm font-bold text-stone-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    {t('login')}
                                </button>
                                <button
                                    onClick={() => navigate('register')}
                                    className="px-4 py-2 text-sm font-bold bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors shadow-md"
                                >
                                    {t('register')}
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <X size={22} className="text-stone-600 dark:text-slate-400" /> : <Menu size={22} className="text-stone-600 dark:text-slate-400" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-stone-100 dark:border-slate-800 px-4 py-4 space-y-1 animate-fade-in-down">
                    {navLinks.map(link => (
                        <button
                            key={link.key}
                            onClick={() => handleNavClick(link.key)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${view === link.key
                                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                    <div className="pt-3 border-t border-stone-100 dark:border-slate-800 space-y-1">
                        {user ? (
                            <>
                                <button onClick={() => { navigate('dashboard'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800">
                                    Dashboard
                                </button>
                                <button onClick={() => { navigate('profile'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800">
                                    <User size={18} /> Profile
                                </button>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <LogOut size={18} /> {t('logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { navigate('login'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800">
                                    {t('login')}
                                </button>
                                <button onClick={() => { navigate('register'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold bg-green-700 text-white hover:bg-green-800">
                                    {t('register')}
                                </button>
                            </>
                        )}
                        <button onClick={() => setLanguage(language === 'en' ? 'hi' : language === 'hi' ? 'mr' : 'en')} className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-slate-800">
                            <Globe size={18} /> {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
