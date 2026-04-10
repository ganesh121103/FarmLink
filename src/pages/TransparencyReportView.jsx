import React, { useEffect, useState } from 'react';
import { Leaf, Award, User, MapPin, ShieldCheck, Beaker, Sprout, ChevronLeft, Droplet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiCall } from '../api/apiCall';

const TransparencyReportView = ({ BackBtn, products }) => {
    const { navigate } = useAppContext();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const encodedData = params.get('data');
                
                // If we received data directly in the URL via the TunnelQR
                if (encodedData) {
                    try {
                        const decodedObj = JSON.parse(decodeURIComponent(atob(encodedData)));
                        setProduct(decodedObj);
                        setLoading(false);
                        return;
                    } catch(e) {
                        console.error("Failed to decode inline product data", e);
                    }
                }

                // Fallback to searching by ID (legacy)
                const productId = params.get('productId');
                if (!productId) {
                    setLoading(false);
                    return;
                }

                // First check locally if we have it
                const localProd = products.find(p => p._id === productId);
                if (localProd) {
                    setProduct(localProd);
                    setLoading(false);
                    return;
                }

                // If not, fetch from API
                const { data } = await apiCall(`/products/${productId}`);
                setProduct(data);
            } catch (err) {
                console.error("Error fetching product for transparency", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [products]);

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center min-h-screen bg-stone-50 dark:bg-slate-950">
                <div className="animate-spin text-green-600"><Sprout size={48} /></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-stone-50 dark:bg-slate-950 px-4 text-center">
                <ShieldCheck size={64} className="text-stone-300 dark:text-slate-700 mb-4" />
                <h2 className="text-2xl font-black text-black dark:text-white mb-2">Product Not Found</h2>
                <p className="text-stone-500 mb-6">The transparency report you are looking for is unavailable.</p>
                <button onClick={() => navigate('home')} className="bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition">
                    Return Home
                </button>
            </div>
        );
    }

    const isOrganic = product.farmingType === 'Organic' || product.organic;
    const isInorganic = product.farmingType === 'Inorganic';
    const isSeasonal = product.farmingType === 'Seasonal';

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 pb-20 fade-in-up">
            {/* Header / Banner */}
            <div className="relative bg-gradient-to-br from-green-800 to-emerald-900 text-white pt-24 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -right-20 -top-20 opacity-20 pointer-events-none">
                    <ShieldCheck size={300} />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    {BackBtn && (
                        <div className="mb-6 -mt-8">
                            <BackBtn />
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30">
                            <Award size={24} className="text-green-300" />
                        </div>
                        <h3 className="font-black tracking-widest text-sm text-green-300 uppercase">Certified Transparency Report</h3>
                    </div>

                    <h1 className="text-5xl font-black mb-3 leading-tight tracking-tight">
                        {product.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium">
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                            <User size={14} /> {product.farmerName}
                        </div>
                        {product.location && (
                            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                                <MapPin size={14} /> {product.location}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                            <Droplet size={14} /> ₹{product.price}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Info */}
            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
                
                {/* Farming Type Cards */}
                <div className="grid grid-cols-1 gap-4">
                    {isOrganic && (
                        <div className="p-6 rounded-3xl border-2 transition-all shadow-lg backdrop-blur-md bg-green-500 text-white border-green-400 scale-105">
                            <div className="flex items-center gap-3 mb-2">
                                <Leaf size={28} className="text-white" />
                                <h3 className="font-black text-xl text-white">Organic</h3>
                            </div>
                            <p className="text-sm text-green-50">
                                Premium grown organically without harsh synthetic chemicals.
                            </p>
                        </div>
                    )}

                    {isInorganic && (
                        <div className="p-6 rounded-3xl border-2 transition-all shadow-lg backdrop-blur-md bg-blue-500 text-white border-blue-400 scale-105">
                            <div className="flex items-center gap-3 mb-2">
                                <Beaker size={28} className="text-white" />
                                <h3 className="font-black text-xl text-white">Standard/Inorganic</h3>
                            </div>
                            <p className="text-sm text-blue-50">
                                Grown utilizing standard modern agricultural fertilizers.
                            </p>
                        </div>
                    )}

                    {isSeasonal && (
                        <div className="p-6 rounded-3xl border-2 transition-all shadow-lg backdrop-blur-md bg-amber-500 text-white border-amber-400 scale-105">
                            <div className="flex items-center gap-3 mb-2">
                                <Sprout size={28} className="text-white" />
                                <h3 className="font-black text-xl text-white">Seasonal Focus</h3>
                            </div>
                            <p className="text-sm text-amber-50">
                                Grown specifically aligned with matching seasonal cycles.
                            </p>
                        </div>
                    )}
                </div>

                {/* Report Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-stone-100 dark:border-slate-800 shadow-xl">
                    <h2 className="text-2xl font-black text-black dark:text-white flex items-center gap-3 mb-6">
                        <ShieldCheck size={28} className="text-green-600" />
                        Detailed Manufacturing & Pesticide Information
                    </h2>
                    
                    <div className="prose dark:prose-invert max-w-none">
                        {product.transparencyInfo ? (
                            <div className="bg-stone-50 dark:bg-slate-950/50 p-6 rounded-2xl border-l-4 border-green-500 text-stone-700 dark:text-slate-300 leading-loose text-lg font-medium whitespace-pre-wrap">
                                {product.transparencyInfo}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-stone-500 text-lg font-medium">The farmer has not provided any additional specialized manufacturing or pesticide information for this particular product yet.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer Assurance */}
                <div className="text-center pt-8 opacity-75">
                    <p className="text-xs font-bold text-stone-400 dark:text-slate-500 uppercase tracking-widest">
                        FarmLink Assured Transparency Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TransparencyReportView;
