import React from 'react';
import { Leaf, Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Footer = () => {
    const { t, navigate } = useAppContext();
    return (
        <footer className="bg-stone-900 dark:bg-slate-950 text-stone-400 dark:text-slate-500 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-white dark:text-slate-200 font-black text-2xl mb-4">
                            <Leaf size={24} className="text-green-500 fill-current" />
                            FarmLink
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">{t('footerDesc')}</p>
                    </div>

                    <div>
                        <h4 className="text-white dark:text-slate-200 font-bold text-lg mb-5 uppercase tracking-wider">{t('quickLinks')}</h4>
                        <ul className="space-y-3">
                            {[
                                { key: 'home', label: t('home') },
                                { key: 'farmers', label: t('farmers') },
                                { key: 'products', label: t('marketplace') },
                                { key: 'about', label: t('about') },
                                { key: 'privacy', label: t('privacyPolicy') },
                                { key: 'terms', label: t('termsOfService') },
                            ].map(item => (
                                <li key={item.key}>
                                    <button
                                        onClick={() => navigate(item.key)}
                                        className="text-sm hover:text-green-400 dark:hover:text-green-500 transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white dark:text-slate-200 font-bold text-lg mb-5 uppercase tracking-wider">{t('contact')}</h4>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-green-500 flex-shrink-0" />
                                <span>support@farmlink.in</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-green-500 flex-shrink-0" />
                                <span>+91 9876 543 210</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="text-stone-400 hover:text-green-400 transition-colors" aria-label="Instagram"><Instagram size={22} /></a>
                            <a href="#" className="text-stone-400 hover:text-green-400 transition-colors" aria-label="Facebook"><Facebook size={22} /></a>
                            <a href="#" className="text-stone-400 hover:text-green-400 transition-colors" aria-label="Twitter"><Twitter size={22} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-800 dark:border-slate-800 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} FarmLink. {t('rightsReserved')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
