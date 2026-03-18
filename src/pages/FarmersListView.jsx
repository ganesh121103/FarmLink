import React, { useState } from 'react';
import { Search, MapPin, Star, MessageSquare, Phone, Mail } from 'lucide-react';
import { FarmerSkeleton } from '../components/ui/Skeletons';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const FarmersListView = ({ BackBtn, farmers, setSelectedFarmer, isLoading }) => {
    const { t, navigate, setActiveChat } = useAppContext();
    const [search, setSearch] = useState('');
    const filtered = farmers.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase()));

    const handleViewProducts = (farmer) => {
        setSelectedFarmer(farmer);
        navigate('farmer-details');
    };

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
            <BackBtn />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <h1 className="text-5xl font-black text-black dark:text-white">{t('farmers')}</h1>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-3.5 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('searchFarmer')}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-black dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <FarmerSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-stone-500 font-medium">No farmers found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filtered.map(farmer => (
                        <Card key={farmer._id} className="p-6 flex flex-col gap-4 h-full">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl font-black text-green-700 dark:text-green-500 flex-shrink-0">
                                    {farmer.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-black text-lg leading-tight text-black dark:text-white">{farmer.name}</h3>
                                        {farmer.verified && <Badge>{t('verifiedFarmer')}</Badge>}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-slate-400 font-medium">
                                        <MapPin size={12} /> {farmer.location}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed flex-1">
                                {farmer.bio || "Dedicated local farmer providing fresh, high-quality produce."}
                            </p>

                            <div className="flex gap-4 text-sm font-bold text-stone-700 dark:text-slate-300 border-t border-stone-100 dark:border-slate-700 pt-4">
                                <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-current" /> {farmer.rating || 4.5}</div>
                                {farmer.phone && <div className="flex items-center gap-1"><Phone size={14} className="text-green-600" /> {farmer.phone}</div>}
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Button
                                    className="flex-1 py-2.5 text-sm"
                                    onClick={() => handleViewProducts(farmer)}
                                >
                                    {t('viewProducts')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="py-2.5 px-3"
                                    onClick={() => setActiveChat({ name: farmer.name, id: farmer._id })}
                                    aria-label="Chat with farmer"
                                >
                                    <MessageSquare size={18} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmersListView;
