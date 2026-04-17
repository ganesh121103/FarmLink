import React, { useState } from 'react';
import { Search, MapPin, Star, MessageSquare, Phone, Mail, BadgeCheck, Store, Package } from 'lucide-react';
import { FarmerSkeleton } from '../components/ui/Skeletons';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const FarmersListView = ({ BackBtn, farmers, products = [], setSelectedFarmer, isLoading }) => {
    const { t, navigate, addToast, openChat } = useAppContext();
    const [search, setSearch] = useState('');
    const filtered = farmers.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase()));

    const handleWhatsAppChat = (farmerName, phone) => {
        if (!phone) {
            addToast(`Phone number not registered for ${farmerName}.`);
            return;
        }
        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const handleViewProducts = (farmer) => {
        setSelectedFarmer(farmer);
        navigate('farmer-storefront');
    };

    const getFarmerRating = (farmer) => {
        if (!products || products.length === 0) return farmer.rating || 0;
        const farmerProducts = products.filter(p => p.farmer === farmer._id || p.farmerName === farmer.name);
        const ratedProducts = farmerProducts.filter(p => p.rating > 0);
        if (ratedProducts.length === 0) return farmer.rating || 0;
        const totalRating = ratedProducts.reduce((sum, p) => sum + p.rating, 0);
        return (totalRating / ratedProducts.length).toFixed(1);
    };

    const getFarmerProductCount = (farmer) => {
        if (!products || products.length === 0) return 0;
        return products.filter(p => p.farmer === farmer._id || p.farmerName === farmer.name).length;
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
                                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl font-black text-green-700 dark:text-green-500 flex-shrink-0 overflow-hidden">
                                    {farmer.image ? (
                                        <img src={farmer.image} alt={farmer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        farmer.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-black text-lg leading-tight text-black dark:text-white flex items-center gap-1.5">{farmer.name} {farmer.verified && <BadgeCheck size={18} className="text-blue-500 fill-blue-50 dark:fill-blue-950" />}</h3>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-slate-400 font-medium">
                                        <MapPin size={12} /> {farmer.location}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed flex-1">
                                {farmer.bio || "Dedicated local farmer providing fresh, high-quality produce."}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm font-bold text-stone-700 dark:text-slate-300 border-t border-stone-100 dark:border-slate-700 pt-4">
                                <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-current" /> {getFarmerRating(farmer)}</div>
                                <div className="flex items-center gap-1.5">
                                    <Package size={14} className="text-green-600" />
                                    <span>{getFarmerProductCount(farmer)} product{getFarmerProductCount(farmer) !== 1 ? 's' : ''}</span>
                                </div>
                                {farmer.phone && <div className="flex items-center gap-1"><Phone size={14} className="text-green-600" /> {farmer.phone}</div>}
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Button
                                    className="flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                                    onClick={() => handleViewProducts(farmer)}
                                >
                                    <Store size={15} /> Visit Store
                                </Button>
                                <Button
                                    variant="outline"
                                    className="py-2.5 px-3 flex items-center gap-2 justify-center"
                                    onClick={(e) => { e.stopPropagation(); openChat(farmer); }}
                                    aria-label="Chat with farmer"
                                >
                                    <MessageSquare size={18} /> Chat
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
