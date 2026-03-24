import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, MapPin, Star, User, Mic, LocateFixed, Loader2, ChevronLeft, ChevronRight, Heart, MessageSquare, Sparkles, Leaf, Trash2 } from 'lucide-react';
import { apiCall } from '../api/apiCall';
import { Button, AddToCartButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { SparklesIcon } from '../components/ui/BackButton';
import { ProductSkeleton } from '../components/ui/Skeletons';
import { mockReviews, CATEGORIES, LOCATIONS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import { useAppContext } from '../context/AppContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITY_COORDINATES = {
    "Satara": [17.6805, 74.0183],
    "Mumbai": [19.0760, 72.8777],
    "Pune": [18.5204, 73.8567],
    "Nashik": [20.0110, 73.7903],
    "Nagpur": [21.1463, 79.0882],
    "Kolhapur": [16.7050, 74.2433],
    "Aurangabad": [19.8762, 75.3433],
    "Solapur": [17.6599, 75.9064],
    "Thane": [19.2183, 72.9781],
    "Amravati": [20.9320, 77.7523],
    "Ratnagiri": [16.9902, 73.3120],
    "Sangli": [16.8524, 74.5815],
    "Latur": [18.4088, 76.5604],
    "Dhule": [20.9042, 74.7749],
    "Akola": [20.7059, 77.0082]
};

const VanillaMap = ({ activeLocation, filteredProducts, handleSelectProduct, exactUserLocation }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([19.7515, 75.7139], 6);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);
            L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
        }
        return () => {}; // Cleanup skipped for HMR stability on persistent routes
    }, []);

    useEffect(() => {
        if (!mapInstance.current) return;
        
        let center = CITY_COORDINATES[activeLocation] || [19.7515, 75.7139];
        let zoom = activeLocation === 'All' ? 6 : 11;
        
        // If the user's city matches their active filter, use their EXACT high-precision street coordinates and zoom in closer
        if (exactUserLocation && (activeLocation !== 'All')) {
             center = exactUserLocation;
             zoom = 13; // Higher zoom for neighborhood level
        }

        mapInstance.current.flyTo(center, zoom, { duration: 1.5 });

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // User Location Dot
        const userIcon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;"><div style="position:absolute;inset:0;background-color:#ef4444;border-radius:50%;opacity:0.6;animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div><div style="position:relative;width:14px;height:14px;background-color:#e11d48;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        // Always show the user loc dot exactly where they are if we have it, else put it at city center
        const dotPosition = exactUserLocation || center;
        const userMarker = L.marker(dotPosition, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance.current);
        userMarker.bindTooltip("<b>Your Exact Location</b>", { direction: 'top', offset: [0, -10], className: 'custom-tooltip text-rose-600 border-rose-200' });
        markersRef.current.push(userMarker);

        // Product Pins
        const productIcon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: `<div style="background-color: #16a34a; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -36]
        });

        filteredProducts.slice(0, 50).forEach((p, i) => {
            const baseCoords = CITY_COORDINATES[p.location] || [19.7515, 75.7139];
            const offsetLat = baseCoords[0] + (Math.sin(i * 10) * 0.02);
            const offsetLng = baseCoords[1] + (Math.cos(i * 10) * 0.02);
            
            const marker = L.marker([offsetLat, offsetLng], { icon: productIcon }).addTo(mapInstance.current);
            const popupContent = document.createElement('div');
            popupContent.className = "text-center w-40 cursor-pointer m-0 p-1";
            popupContent.innerHTML = `
                <img src="${p.images?.[0] || p.image}" style="width:100%; height:110px; object-fit:cover; border-radius:10px; margin-bottom:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);" alt="${p.name}" />
                <p style="font-weight:bold; font-size:15px; color:#292524; line-height:1.2; margin-bottom:4px;">${p.name}</p>
                <p style="color:#16a34a; font-weight:900; margin-bottom:12px; font-size:16px;">₹${p.price}/kg</p>
                <button style="background-color:#16a34a; color:white; font-size:13px; width:100%; padding:8px 0; border-radius:8px; font-weight:bold; border:none; cursor:pointer;">View Item</button>
            `;
            popupContent.onclick = () => handleSelectProduct(p);
            marker.bindPopup(popupContent, { maxWidth: 220, className: 'custom-popup z-50 rounded-xl' });
            markersRef.current.push(marker);
        });

    }, [activeLocation, exactUserLocation, filteredProducts, handleSelectProduct]);

    return (
        <div className="w-full h-full relative z-0">
            <style>{`
                .leaflet-container { z-index: 0 !important; font-family: inherit; border-radius: 1rem; }
                .leaflet-pane { z-index: auto !important; }
                .leaflet-top, .leaflet-bottom { z-index: 9 !important; }
                .leaflet-popup-content-wrapper { border-radius: 16px; padding: 4px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
                .leaflet-popup-content { margin: 8px; }
                .custom-leaflet-icon:hover { transform: scale(1.1) translateY(-4px); z-index: 1000 !important; }
            `}</style>
            <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '1rem' }} />
        </div>
    );
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD3oKVXraHDSGB-57B2HbnHRDgsJzhNDSE";

const ProductsView = ({ selectedFarmer, filterByLocation, showBack, BackBtn, farmers, products, setProducts, isLoading }) => {
    const { user, t, navigate, toggleWishlist, wishlist, setActiveChat, addToast } = useAppContext();
    const [localSearch, setLocalSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeLocation, setActiveLocation] = useState('All');
    const [sortBy, setSortBy] = useState('none');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [dynamicLocations, setDynamicLocations] = useState(LOCATIONS);
    const [exactUserLocation, setExactUserLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [aiRecs, setAiRecs] = useState([]);
    const [aiRecsLoading, setAiRecsLoading] = useState(false);
    
    // Review States
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);

    const handleSubmitReview = async () => {
        if (!newReviewComment.trim()) return;
        setSubmittingReview(true);
        try {
            const { data } = await apiCall(`/products/${selectedProduct._id}/reviews`, "POST", { 
                rating: newReviewRating, 
                comment: newReviewComment 
            });
            
            setSelectedProduct(data);
            setNewReviewComment('');
            setNewReviewRating(5);
            
            // Properly update parent state for real-time reactivity
            if (setProducts) {
                setProducts(prev => prev.map(p => p._id === data._id ? data : p));
            }
            addToast(data.message || "Review submitted successfully!");
            setIsEditingReview(false);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to submit review");
        }
        setSubmittingReview(false);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const { data } = await apiCall(`/products/${selectedProduct._id}/reviews/${reviewId}`, "DELETE");
            setSelectedProduct(data);
            if (setProducts) {
                setProducts(prev => prev.map(p => p._id === data._id ? data : p));
            }
            addToast("Review deleted successfully!");
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to delete review");
        }
    };

    const fetchAIRecs = useCallback(async (product) => {
        if (!product || products.length < 2) return;
        setAiRecsLoading(true);
        setAiRecs([]);
        try {
            const others = products.filter(p => p._id !== product._id).slice(0, 20);
            const productList = others.map(p => `ID:${p._id} Name:${p.name} Category:${p.category} Price:₹${p.price}/kg`).join('\n');
            const prompt = `A customer is viewing "${product.name}" (${product.category}, ₹${product.price}/kg).
From this product list, pick exactly 4 IDs that would be best recommendations. Return ONLY a JSON array of 4 IDs, example: ["id1","id2","id3","id4"]

Products:
${productList}`;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '[]';
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const ids = JSON.parse(text);
            const recommended = ids.map(id => others.find(p => p._id === id)).filter(Boolean).slice(0, 4);
            setAiRecs(recommended.length >= 2 ? recommended : others.slice(0, 4));
        } catch {
            // fallback: show same-category products
            setAiRecs(products.filter(p => p._id !== product._id && p.category === product.category).slice(0, 4));
        } finally {
            setAiRecsLoading(false);
        }
    }, [products]);

    const debouncedSearch = useDebounce(localSearch, 400);
    const currentFarmer = selectedFarmer || (filterByLocation ? null : null);

    const handleVoiceSearch = () => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => setLocalSearch(e.results[0][0].transcript.replace(/\.$/, ''));
        recognition.start();
    };

    const handleLocateMe = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            setIsLocating(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    setExactUserLocation([latitude, longitude]);
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();
                    
                    const city = data.city || data.locality || data.principalSubdivision;
                    if (city) {
                        if (!dynamicLocations.includes(city)) setDynamicLocations([...dynamicLocations, city]);
                        setActiveLocation(city);
                    } else {
                        setActiveLocation(dynamicLocations[0]);
                    }
                } catch (err) {
                    setActiveLocation(dynamicLocations[0]); // Fallback
                }
                setIsLocating(false);
            },
            () => { setIsLocating(false); }
        );
    };

    const handleSelectProduct = (p) => { setSelectedProduct(p); setCurrentMediaIndex(0); window.scrollTo(0, 0); fetchAIRecs(p); };

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

                {/* Reviews Summary & Breakdown */}
                <div className="mb-12">
                    <h3 className="text-2xl font-black mb-6 text-black dark:text-white">Customer Reviews</h3>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-10 items-center">
                        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-stone-100 dark:border-slate-700 shadow-sm text-center">
                            <span className="text-6xl font-black text-black dark:text-white mb-2">{selectedProduct.rating?.toFixed(1) || '0.0'}</span>
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} size={24} className={i < Math.round(selectedProduct.rating || 0) ? "text-yellow-400 fill-current" : "text-stone-300 dark:text-slate-600"} />)}
                            </div>
                            <span className="text-stone-500 dark:text-slate-400 font-bold">{selectedProduct.reviewsCount || 0} reviews</span>
                        </div>
                        
                        <div className="space-y-3">
                            {[5,4,3,2,1].map(star => {
                                const count = selectedProduct.reviews?.filter(r => r.rating === star).length || 0;
                                const pct = selectedProduct.reviewsCount ? (count / selectedProduct.reviewsCount) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-stone-600 dark:text-slate-400 w-8">{star} <Star size={12} className="inline mb-1 ml-0.5" /></span>
                                        <div className="flex-grow h-3 bg-stone-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-yellow-400 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-stone-500 dark:text-slate-500 w-8">{pct.toFixed(0)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                        {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                            <p className="text-stone-500 dark:text-slate-400 bg-stone-50 dark:bg-slate-800 p-8 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600 text-center italic font-medium">No reviews yet. Be the first to share your experience!</p>
                        ) : (
                            selectedProduct.reviews.map(r => (
                                <div key={r._id || Math.random()} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center font-black text-green-700 dark:text-green-400 text-lg shadow-sm">{r.userName?.charAt(0).toUpperCase() || 'U'}</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-black dark:text-white leading-tight">{r.userName}</p>
                                                    {r.isVerified && (
                                                        <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/40 text-[10px] font-black uppercase text-green-700 dark:text-green-400 rounded-md tracking-tighter shadow-sm border border-green-100 dark:border-green-800 flex items-center gap-0.5 border-dashed">✓ Verified Purchase</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-stone-400 dark:text-slate-500 mt-1">{new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex bg-stone-50 dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-stone-100 dark:border-slate-600">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < r.rating ? "text-yellow-400 fill-current" : "text-stone-200 dark:text-slate-600"} />)}
                                            </div>
                                            {user?.role === 'admin' && (
                                                <button onClick={() => handleDeleteReview(r._id)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Review">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-stone-700 dark:text-slate-200 leading-relaxed ml-1">{r.comment}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {user && user.role === 'customer' ? (
                        (() => {
                            const currentUserId = (user._id || user.id)?.toString();
                            const hasReviewed = selectedProduct.reviews?.some(r => 
                                r.user?.toString() === currentUserId
                            );
                            
                            if (hasReviewed && !isEditingReview) {
                                return (
                                    <div className="bg-stone-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-stone-200 dark:border-slate-700 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-3 shadow-sm border border-green-100">
                                            <Star size={20} className="fill-current" />
                                        </div>
                                        <p className="text-stone-700 dark:text-slate-200 font-bold mb-1">Thank you for your feedback!</p>
                                        <p className="text-stone-500 dark:text-slate-400 text-sm font-medium italic mb-4">You have already shared a review for this product.</p>
                                        <button 
                                            onClick={() => {
                                                const myReview = selectedProduct.reviews.find(r => r.user?.toString() === currentUserId);
                                                if (myReview) {
                                                    setNewReviewRating(myReview.rating);
                                                    setNewReviewComment(myReview.comment);
                                                }
                                                // Temporarily hide the 'success' state by using a local state override if needed, 
                                                // but for simplicity, we'll just allow the form to show if we clear the 'hasReviewed' logic 
                                                // by adding a 'isEditing' local state.
                                                setIsEditingReview(true);
                                            }}
                                            className="text-green-600 dark:text-green-400 text-sm font-bold hover:underline"
                                        >
                                            Edit Your Review
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div className="bg-gradient-to-br from-stone-50 to-white dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 border border-stone-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                    <h4 className="font-black text-lg mb-4 text-stone-800 dark:text-white flex items-center gap-2"><Sparkles className="text-green-500" size={18} /> Write a Review</h4>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-stone-100 dark:border-slate-700">
                                        <span className="text-sm font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">Your Rating</span>
                                        <div className="flex cursor-pointer gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    size={28} 
                                                    onClick={() => setNewReviewRating(star)}
                                                    className={`${star <= newReviewRating ? "text-yellow-400 fill-current drop-shadow-sm scale-110" : "text-stone-300 dark:text-slate-600 hover:text-yellow-200 hover:scale-110"} transition-all`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <textarea
                                        value={newReviewComment}
                                        onChange={(e) => setNewReviewComment(e.target.value)}
                                        placeholder="What did you like or dislike about this product?"
                                        className="w-full p-4 rounded-xl border-2 border-transparent bg-stone-100 dark:bg-slate-900 text-sm focus:border-green-500 outline-none mb-5 min-h-[120px] resize-y font-medium text-stone-700 dark:text-slate-200 transition-colors shadow-inner"
                                    />
                                    
                                    <div className="flex justify-end">
                                        <button onClick={handleSubmitReview} disabled={submittingReview || !newReviewComment.trim()} className="bg-green-600 hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center min-w-[160px]">
                                            {submittingReview ? <Loader2 size={18} className="animate-spin mr-2 inline" /> : "Submit Review"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()
                    ) : user ? (
                        <div className="bg-stone-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-stone-200 dark:border-slate-700 text-center flex flex-col items-center">
                            <p className="text-stone-500 dark:text-slate-400 font-bold italic">Only customers can leave reviews for products.</p>
                        </div>
                    ) : (
                        <div className="bg-stone-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-stone-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-stone-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-stone-400 mb-4">
                                <User size={24} />
                            </div>
                            <h4 className="font-black text-lg mb-2 text-stone-800 dark:text-white">Sign in to review</h4>
                            <p className="text-stone-500 dark:text-slate-400 font-medium mb-6 max-w-sm">Share your experience with this product by writing a review after logging in.</p>
                            <button onClick={() => navigate('login')} className="bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                                Sign In / Register
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Recommendations */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-purple-500" size={24} />
                        <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">AI Recommendations</h2>
                        {aiRecsLoading && <Loader2 size={18} className="animate-spin text-purple-500" />}
                    </div>
                    {aiRecsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-2xl overflow-hidden bg-stone-100 dark:bg-slate-800 animate-pulse">
                                    <div className="h-36 bg-stone-200 dark:bg-slate-700" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
                                        <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : aiRecs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {aiRecs.map(p => (
                                <Card key={p._id} onClick={() => handleSelectProduct(p)} className="overflow-hidden group border-transparent hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer">
                                    <div className="h-36 overflow-hidden">
                                        <img src={p.images?.[0] || p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm mb-1 line-clamp-1">{p.name}</h4>
                                        <div className="flex items-center gap-1 mb-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < Math.round(p.rating || 0) ? "text-yellow-400 fill-current" : "text-stone-300 dark:text-slate-600"} />)}
                                            </div>
                                            <span className="text-[10px] font-bold text-stone-400">({p.reviewsCount || 0})</span>
                                        </div>
                                        <p className="text-green-700 dark:text-green-400 font-black text-sm">₹{p.price}/kg</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-stone-400 text-sm">No recommendations available.</p>
                    )}
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
                        <Button variant="outline" onClick={() => setShowMap(!showMap)} className={`hidden md:flex gap-2 ${showMap ? 'border-green-500 text-green-600 bg-green-50 dark:border-green-500 dark:text-green-400 dark:bg-green-900/20' : ''}`}>
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
                        <div className="flex gap-3 overflow-x-auto pb-3 items-center" style={{ scrollbarWidth: 'thin' }}>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-2">{t('category')}:</span>
                            <button onClick={() => setActiveCategory("All")} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeCategory === "All" ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "border-stone-200 text-stone-500 hover:border-green-300"}`}>{t('allCategories')}</button>
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeCategory === cat ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "border-stone-200 text-stone-500 hover:border-green-300"}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-3 items-center" style={{ scrollbarWidth: 'thin' }}>
                            <button onClick={handleLocateMe} disabled={isLocating} className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 dark:bg-slate-700 text-white font-bold hover:bg-stone-800 transition-colors whitespace-nowrap flex-shrink-0 text-sm shadow-md">
                                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                                <span className="hidden sm:inline">{t('locateMe')}</span>
                            </button>
                            <div className="h-5 w-px bg-stone-300 dark:bg-slate-600 mx-1 flex-shrink-0"></div>
                            <button onClick={() => setActiveLocation("All")} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeLocation === "All" ? "border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" : "border-stone-200 text-stone-500 hover:border-sky-300"}`}>{t('all')}</button>
                            {dynamicLocations.map(loc => (
                                <button key={`loc-${loc}`} onClick={() => setActiveLocation(loc)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border-2 ${activeLocation === loc ? "border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" : "border-stone-200 text-stone-500 hover:border-sky-300"}`}>{loc}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showMap && (
                <div className="w-full h-72 md:h-96 bg-stone-200 dark:bg-slate-700 rounded-2xl mb-8 overflow-hidden relative animate-fade-in-down shadow-inner border border-stone-200 dark:border-slate-700 flex items-center justify-center">
                    <VanillaMap 
                        activeLocation={activeLocation} 
                        exactUserLocation={exactUserLocation}
                        filteredProducts={filteredProducts} 
                        handleSelectProduct={handleSelectProduct} 
                    />
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
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-green-700 transition-colors mb-0.5">{product.name}</h3>
                                    <p className="text-xs text-stone-500 uppercase font-bold mb-2 tracking-wide">{product.farmerName}</p>
                                    
                                    <div className="flex items-center gap-1.5 mb-4">
                                        <div className="flex bg-stone-50 dark:bg-slate-900/50 px-1.5 py-0.5 rounded-md border border-stone-100 dark:border-slate-700">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < Math.round(product.rating || 0) ? "text-yellow-400 fill-current" : "text-stone-300 dark:text-slate-600"} />)}
                                        </div>
                                        <span className="text-xs font-black text-stone-400 dark:text-slate-500">{product.rating?.toFixed(1) || '0.0'}</span>
                                        <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-700 px-1.5 rounded-full">{(product.reviewsCount || 0)}</span>
                                    </div>
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
