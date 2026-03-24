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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950 backdrop-blur-md border-b border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2 font-black text-xl text-green-400 flex-shrink-0 hover:opacity-80 transition-opacity"
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
                                        ? 'bg-green-900/40 text-green-400'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className="relative hidden sm:block group pb-2">
                            <div className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-800 cursor-pointer" title="Change Language">
                                <Globe size={18} className="text-gray-300" />
                                <span className="text-xs font-bold text-gray-300 uppercase">{language}</span>
                                <ChevronDown size={14} className="text-gray-400 transition-transform group-hover:-rotate-180" />
                            </div>
                            <div className="absolute right-0 top-[80%] pt-2 w-36 bg-gray-900 rounded-xl shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                                {[
                                    { code: 'en', label: 'English (EN)' },
                                    { code: 'hi', label: 'हिंदी (HI)' },
                                    { code: 'mr', label: 'मराठी (MR)' }
                                ].map(lang => (
                                    <button 
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={`px-4 py-3 text-sm text-left font-bold transition-colors ${language === lang.code ? 'bg-green-900/40 text-green-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-300" />}
                        </button>

                        {/* Cart Button */}
                        {user?.role === 'customer' && (
                            <button
                                onClick={() => navigate('activity')}
                                className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                aria-label={`Cart: ${cartCount} items`}
                            >
                                <ShoppingBasket size={22} className="text-gray-300" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
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
                                    className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('profile')}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-green-900/40 rounded-full flex items-center justify-center text-green-400 overflow-hidden">
                                        {user.image
                                            ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                            : <User size={16} />
                                        }
                                    </div>
                                    <span className="text-sm font-bold text-white max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                                    {user.role === 'admin' && <Badge color="bg-purple-900/40 text-purple-400">Admin</Badge>}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"
                                    aria-label="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('login')}
                                    className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors"
                                >
                                    {t('login')}
                                </button>
                                <button
                                    onClick={() => navigate('register')}
                                    className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-md"
                                >
                                    {t('register')}
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <X size={22} className="text-gray-300" /> : <Menu size={22} className="text-gray-300" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-4 space-y-1 animate-fade-in-down">
                    {navLinks.map(link => (
                        <button
                            key={link.key}
                            onClick={() => handleNavClick(link.key)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${view === link.key
                                    ? 'bg-green-900/40 text-green-400'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                    <div className="pt-3 border-t border-gray-800 space-y-1">
                        {user ? (
                            <>
                                <button onClick={() => { navigate('dashboard'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-800 hover:text-white">
                                    Dashboard
                                </button>
                                <button onClick={() => { navigate('profile'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-800 hover:text-white">
                                    <User size={18} /> Profile
                                </button>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-400 hover:bg-red-900/20">
                                    <LogOut size={18} /> {t('logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { navigate('login'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-800 hover:text-white">
                                    {t('login')}
                                </button>
                                <button onClick={() => { navigate('register'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-500">
                                    {t('register')}
                                </button>
                            </>
                        )}
                        <div className="w-full text-left px-4 py-2">
                            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-400"><Globe size={16} /> Language</div>
                            <div className="flex gap-2">
                                {[ {code: 'en', label: 'EN'}, {code: 'hi', label: 'HI'}, {code: 'mr', label: 'MR'} ].map(lang => (
                                    <button 
                                        key={lang.code} 
                                        onClick={() => setLanguage(lang.code)} 
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${language === lang.code ? 'bg-green-900/60 text-green-300' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
