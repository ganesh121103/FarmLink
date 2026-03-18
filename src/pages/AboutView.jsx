import React from 'react';
import { Users, Leaf, TrendingUp } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { FarmerSkeleton } from '../components/ui/Skeletons';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';

const AboutView = ({ BackBtn, farmers }) => {
    const { t, navigate } = useAppContext();
    const stats = [
        { label: t('farmersOnboarded'), value: '500+', icon: '👨‍🌾' },
        { label: t('happyCustomers'), value: '10K+', icon: '😊' },
        { label: t('co2Saved'), value: '2T+', icon: '🌿' },
    ];

    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
            <BackBtn />
            <div className="max-w-3xl mb-16">
                <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">{t('missionTitle')}</h1>
                <p className="text-stone-600 dark:text-slate-400 text-lg leading-relaxed">{t('missionText')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm text-center">
                        <div className="text-4xl mb-3">{stat.icon}</div>
                        <div className="text-4xl font-black text-green-700 dark:text-green-500 mb-2">{stat.value}</div>
                        <p className="text-stone-500 dark:text-slate-400 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            <h2 className="text-3xl font-black text-black dark:text-white mb-8">Meet Our Farmers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {!farmers || farmers.length === 0
                    ? [...Array(5)].map((_, i) => <FarmerSkeleton key={i} />)
                    : farmers.map(farmer => (
                        <Card
                            key={farmer._id}
                            className="p-6 flex flex-col items-center text-center border-transparent hover:border-green-300 cursor-pointer"
                            onClick={() => navigate('farmers')}
                        >
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-500 mb-3 text-2xl font-black flex-shrink-0">
                                {farmer.name.charAt(0)}
                            </div>
                            <h3 className="font-bold text-base mb-1">{farmer.name}</h3>
                            {farmer.verified && <Badge className="text-[10px] mb-1">{t('verifiedFarmer')}</Badge>}
                            <p className="text-xs text-stone-500 dark:text-slate-400">{farmer.location}</p>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
};

export default AboutView;
