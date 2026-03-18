import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, User, Mic, LocateFixed, Loader2, ChevronLeft, ChevronRight, Heart, MessageSquare, Sparkles, Leaf } from 'lucide-react';
import { Button, AddToCartButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { SparklesIcon } from '../components/ui/BackButton';
import { ProductSkeleton } from '../components/ui/Skeletons';
import { mockReviews, CATEGORIES, LOCATIONS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import { useAppContext } from '../context/AppContext';

const ProductsView = ({ selectedFarmer, filterByLocation, showBack, BackBtn, farmers, products, isLoading }) => {
    const { user, t, navigate, toggleWishlist, wishlist, setActiveChat } = useAppContext();
    const [localSearch, setLocalSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeLocation, setActiveLocation] = useState('All');
    const [sortBy, setSortBy] = useState('none');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const debouncedSearch = useDebounce(localSearch, 400);
    const currentFarmer = selectedFarmer || (filterByLocation ? null : null);

    const handleVoiceSearch = () => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => setLocalSearch(e.results[0][0].transcript);
        recognition.start();
    };

    const handleLocateMe = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            () => { setActiveLocation(LOCATIONS[Math.floor(Math.random() * 3)]); setIsLocating(false); },
            () => { setIsLocating(false); }
        );
    };

    const handleSelectProduct = (p) => { setSelectedProduct(p); setCurrentMediaIndex(0); window.scrollTo(0, 0); };

    let filteredProducts = products;
    if (currentFarmer) filteredProducts = filteredProducts.filter(p => p.farmer === currentFarmer._id || p.farmerName === currentFarmer.name);
    if (filterByLocation) filteredProducts = filteredProducts.filter(p => p.location === filterByLocation);
    if (activeCategory !== 'All') filteredProducts = filteredProducts.filter(p => p.category === activeCategory);
    if (activeLocation !== 'All') filteredProducts = filteredProducts.filter(p => p.location === activeLocation);
    if (debouncedSearch) filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.farmerName?.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (sortBy === 'price-low') filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);

    // PRODUCT DETAIL VIEW
    if (selectedProduct) {
        const farmerInfo = farmers?.find(f => f.name === selectedProduct.farmerName || f._id === selectedProduct.farmer);
        const allMedia = selectedProduct.images || [selectedProduct.image];
        const currentMedia = allMedia[currentMediaIndex] || allMedia[0];
        const isVideo = currentMedia?.includes('.mp4') || currentMedia?.startsWith('data:video');
        const isWishlisted = wishlist?.some(i => i._id === selectedProduct._id);

        return (
            <div className="pt-32 px-4 md:px-6 pb-24 max-w-7xl mx-auto animate-fade-in-up">
                <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 mb-6 text-stone-600 dark:text-slate-400 hover:text-black dark:hover:text-white font-bold">
                    ← Back to Products
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
                    {/* Media Gallery */}
                    <div>
                        <div className="rounded-2xl overflow-hidden mb-4 bg-stone-100 dark:bg-slate-800 h-72 md:h-96 relative">
                            {isVideo ? (
                                <video src={currentMedia} controls className="w-full h-full object-contain" />
                            ) : (
                                <img src={currentMedia} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            )}
                            {allMedia.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentMediaIndex((currentMediaIndex - 1 + allMedia.length) % allMedia.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-2 rounded-full shadow-md">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={() => setCurrentMediaIndex((currentMediaIndex + 1) % allMedia.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-2 rounded-full shadow-md">
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                        {allMedia.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {allMedia.map((m, i) => (
                                    <button key={i} onClick={() => setCurrentMediaIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === currentMediaIndex ? 'border-green-500' : 'border-transparent'}`}>
                                        {m?.includes('.mp4') || m?.startsWith('data:video') ? (
                                            <div className="w-full h-full bg-stone-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-stone-500">Video</div>
                                        ) : (
                                            <img src={m} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <Badge className="mb-3">{selectedProduct.category}</Badge>
                        <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-2 leading-tight">{selectedProduct.name}</h1>
                        <p className="text-stone-500 dark:text-slate-400 font-bold uppercase text-sm mb-4">BY {selectedProduct.farmerName}</p>

                        <div className="text-4xl font-black text-green-700 dark:text-green-500 mb-6">₹{selectedProduct.price} <span className="text-xl text-stone-400 font-bold">/kg</span></div>

                        <div className="flex flex-wrap gap-3 mb-6">
                            {selectedProduct.tags?.map(tag => <span key={tag} className="flex items-center gap-1 bg-stone-100 dark:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-full"><SparklesIcon /> {tag}</span>)}
                            <span className="bg-stone-100 dark:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">📦 {selectedProduct.stock}kg left</span>
                            {selectedProduct.location && <span className="bg-stone-100 dark:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><MapPin size={12} /> {selectedProduct.location}</span>}
                        </div>

                        <p className="text-stone-600 dark:text-slate-300 leading-relaxed mb-8 border-t border-stone-100 dark:border-slate-700 pt-6">{selectedProduct.description}</p>

                        <div className="flex flex-col gap-3">
                            <AddToCartButton product={selectedProduct} fullWidth />
                            <div className="flex gap-3">
                                {user?.role === 'customer' && (
                                    <button onClick={() => toggleWishlist(selectedProduct)} className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 rounded-xl font-bold text-sm transition-colors ${isWishlisted ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'border-stone-200 dark:border-slate-600 text-stone-600 dark:text-slate-300 hover:border-stone-400'}`}>
                                        <Heart size={18} className={isWishlisted ? 'fill-current' : ''} /> {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                    </button>
                                )}
                                {farmerInfo && (
                                    <button onClick={() => setActiveChat({ name: farmerInfo.name, id: farmerInfo._id })} className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-stone-200 dark:border-slate-600 text-stone-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-stone-400 transition-colors">
                                        <MessageSquare size={18} /> Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Farmer Info */}
                {farmerInfo && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 mb-16 shadow-sm">
                        <h3 className="font-black text-xl mb-4 text-black dark:text-white">About the Farmer</h3>
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xl font-black text-green-700 flex-shrink-0">{farmerInfo.name.charAt(0)}</div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 className="font-black text-lg">{farmerInfo.name}</h4>
                                    {farmerInfo.verified && <Badge>✓ Verified</Badge>}
                                </div>
                                <p className="text-stone-500 dark:text-slate-400 text-sm mb-2 flex items-center gap-1"><MapPin size={12} /> {farmerInfo.location}</p>
                                <p className="text-stone-600 dark:text-slate-300 text-sm">{farmerInfo.bio}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div className="mb-16">
                    <h3 className="text-2xl font-black mb-6 text-black dark:text-white">Customer Reviews</h3>
                    <div className="space-y-4">
                        {mockReviews.map(r => (
                            <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-100 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-black dark:text-white">{r.user}</p>
                                    <div className="flex">
                                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-sm text-stone-600 dark:text-slate-400">{r.comment}</p>
                                <p className="text-xs text-stone-400 mt-2">{r.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Recommendations */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-purple-500" size={24} />
                        <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">AI Recommendations</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.filter(p => p._id !== selectedProduct._id && p.category === selectedProduct.category).slice(0, 4).map(p => (
                            <Card key={p._id} onClick={() => handleSelectProduct(p)} className="overflow-hidden group border-transparent hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer">
                                <div className="h-36 overflow-hidden">
                                    <img src={p.images?.[0] || p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                                    <p className="text-green-700 dark:text-green-400 font-black">₹{p.price}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // LISTING VIEW
    return (
        <div className={`${showBack && !filterByLocation ? 'pt-32' : 'pt-4'} px-6 pb-24 max-w-[1400px] mx-auto`}>
            {showBack && (
                <div className="mb-10">
                    {BackBtn && <div className={`${filterByLocation ? 'mb-4' : 'absolute top-28 left-6'}`}><BackBtn onClick={() => navigate('home')} /></div>}

                    {currentFarmer ? (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 mt-4">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
                                    <User size={40} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white">{currentFarmer.name}</h1>
                                        {currentFarmer.verified && <Badge>{t('verifiedFarmer')}</Badge>}
                                    </div>
                                    <p className="text-stone-600 dark:text-slate-300 mb-4 max-w-2xl text-sm">{currentFarmer.bio || "Dedicated local farmer providing fresh, high-quality produce directly to your table."}</p>
                                </div>
                                <Button className="py-3" onClick={() => setActiveChat({ name: currentFarmer.name, id: currentFarmer._id })}>
                                    <MessageSquare size={18} /> Chat Now
                                </Button>
                            </div>
                        </div>
                    ) : (
                        !filterByLocation && (
                            <div className="flex justify-between items-center">
                                <h2 className="text-5xl font-black text-black dark:text-white">{t('marketplace')}</h2>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col gap-6 mb-8 mt-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700">
                    <div className="relative w-full lg:w-1/2 flex items-center">
                        <Search className="absolute left-4 text-stone-400" size={20} />
                        <input type="text" placeholder={t('searchProduce')} className="w-full pl-12 pr-12 py-3 bg-stone-50 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-black dark:text-white" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
                        <button onClick={handleVoiceSearch} className={`absolute right-4 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-stone-400 hover:bg-stone-200 dark:hover:bg-slate-700'}`} title="Search by Voice">
                            <Mic size={20} />
                        </button>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <Button variant="outline" onClick={() => setShowMap(!showMap)} className="hidden md:flex gap-2">
                            <MapPin size={18} /> {showMap ? "Hide Map" : "View on Map"}
                        </Button>
                        <div className="relative flex-1 lg:w-48">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Filter size={16} className="text-stone-400" /></div>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-slate-900 rounded-xl outline-none appearance-none font-bold text-sm text-stone-700 dark:text-slate-300 focus:ring-2 focus:ring-green-500 cursor-pointer" aria-label="Sort By">
                                <option value="none">{t('sortBy')}...</option>
                                <option value="price-low">{t('priceLowHigh')}</option>
                                <option value="price-high">{t('priceHighLow')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {!currentFarmer && !filterByLocation && (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-2">{t('category')}:</span>
                            <button onClick={() => setActiveCategory("All")} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeCategory === "All" ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "border-stone-200 text-stone-500 hover:border-green-300"}`}>{t('allCategories')}</button>
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeCategory === cat ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "border-stone-200 text-stone-500 hover:border-green-300"}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
                            <button onClick={handleLocateMe} disabled={isLocating} className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 dark:bg-slate-700 text-white font-bold hover:bg-stone-800 transition-colors whitespace-nowrap flex-shrink-0 text-sm shadow-md">
                                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                                <span className="hidden sm:inline">{t('locateMe')}</span>
                            </button>
                            <div className="h-5 w-px bg-stone-300 dark:bg-slate-600 mx-1 flex-shrink-0"></div>
                            <button onClick={() => setActiveLocation("All")} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeLocation === "All" ? "border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" : "border-stone-200 text-stone-500 hover:border-sky-300"}`}>{t('all')}</button>
                            {LOCATIONS.map(loc => (
                                <button key={loc} onClick={() => setActiveLocation(loc)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeLocation === loc ? "border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" : "border-stone-200 text-stone-500 hover:border-sky-300"}`}>{loc}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showMap && (
                <div className="w-full h-64 bg-stone-200 dark:bg-slate-700 rounded-2xl mb-8 overflow-hidden relative flex items-center justify-center animate-fade-in-down">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    {filteredProducts.slice(0, 5).map((p, i) => (
                        <div key={i} className="absolute flex flex-col items-center group cursor-pointer" style={{ top: `${20 + (i * 15)}%`, left: `${10 + (i * 18)}%` }} onClick={() => handleSelectProduct(p)}>
                            <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{p.name}</div>
                            <MapPin size={24} className="text-green-600 drop-shadow-md" fill="#fff" />
                        </div>
                    ))}
                    <p className="z-10 font-bold text-stone-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm">Interactive Map View (Simulated)</p>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-stone-300 dark:border-slate-600">
                    <Leaf size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-stone-500">No products found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                        const isWishlisted = wishlist?.some(item => item._id === product._id);
                        return (
                            <Card key={product._id} tabIndex={0} onClick={() => handleSelectProduct(product)} className="overflow-hidden group flex flex-col relative h-full border-transparent hover:border-green-300 dark:hover:border-green-700 cursor-pointer">
                                {product.tags?.map((tag, i) => (<span key={i} className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-black dark:text-slate-200 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm flex items-center border border-stone-100 dark:border-slate-700"><SparklesIcon /> {tag}</span>))}
                                <div className="h-48 md:h-56 overflow-hidden relative">
                                    <img src={product.images?.[0] || product.image} loading="lazy" alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    {user?.role === 'customer' && (
                                        <button aria-label="Toggle Wishlist" onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                                            <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-stone-400"} />
                                        </button>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-green-700 transition-colors mb-1">{product.name}</h3>
                                    <p className="text-xs text-stone-500 uppercase font-bold mb-4">{product.farmerName}</p>
                                    <div className="mt-auto pt-4 border-t border-stone-100 dark:border-slate-700 flex items-center justify-between">
                                        <span className="text-2xl font-black text-green-800 dark:text-green-400">₹{product.price}</span>
                                        <AddToCartButton product={product} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProductsView;
