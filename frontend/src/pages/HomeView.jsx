import React from 'react';
import { Leaf, Users, TrendingUp, ShoppingBasket, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const HomeView = () => {
    const { navigate, user, t } = useAppContext();
    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-28 pb-20 relative overflow-hidden bg-stone-900">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=80&w=1920"
                    alt="Agriculture"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 animate-hero-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/60 to-[#fdfbf7] dark:to-slate-900 z-10"></div>
            </div>

            <div className="relative z-20 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-green-300 text-sm font-bold px-4 py-2 rounded-full mb-6 animate-fade-in-down">
                    <Leaf size={14} className="fill-current" /> Farm to Fork Platform
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white dark:text-white mb-6 leading-tight tracking-tight animate-fade-in-down"
                    style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
                >
                    {t('heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-stone-300 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up font-medium">
                    {t('heroSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
                    {user ? (
                        <Button onClick={() => navigate(user.role === 'customer' ? 'products' : 'dashboard')} className="px-10 py-5 text-xl rounded-2xl shadow-2xl hover:-translate-y-1">
                            {t('goToDashboard')} <ArrowRight size={24} />
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => navigate('register')} className="px-10 py-5 text-xl rounded-2xl shadow-2xl hover:-translate-y-1">
                                {t('getStarted')} <ArrowRight size={24} />
                            </Button>
                            <Button variant="white" onClick={() => navigate('about')} className="px-10 py-5 text-xl rounded-2xl shadow-2xl hover:-translate-y-1">
                                {t('learnMore')}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="relative z-20 w-full max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                {[
                    { icon: Leaf, title: t('forFarmers'), desc: t('forFarmersDesc'), color: 'bg-green-600', action: 'register' },
                    { icon: ShoppingBasket, title: t('forCustomers'), desc: t('forCustomersDesc'), color: 'bg-yellow-500', action: 'products' },
                    { icon: TrendingUp, title: t('hyperLocal'), desc: t('hyperLocalDesc'), color: 'bg-sky-500', action: 'about' },
                ].map(({ icon: Icon, title, desc, color, action }) => (
                    <div key={title} onClick={() => navigate(action)} className="bg-white/40 dark:bg-white/5 backdrop-blur border border-stone-200 dark:border-white/10 rounded-2xl p-6 text-left hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer group hover:scale-105 shadow-sm dark:shadow-none">
                        <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon size={24} />
                        </div>
                        <h3 className="text-stone-800 dark:text-white font-bold text-lg mb-2">{title}</h3>
                        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeView;
