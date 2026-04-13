import React, { useState, useMemo } from 'react';
import {
    MapPin, Star, BadgeCheck, MessageSquare, Phone, Mail,
    ShoppingBag, Package, Award, Calendar, Filter, Search,
    ChevronRight, ChevronLeft, Sprout, TrendingUp, Heart, Share2, ArrowLeft,
    CheckCircle2, Users, Leaf, Clock, ExternalLink, X, QrCode
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { AddToCartButton, Button } from '../components/ui/Button';
import TransparencyModal from '../components/modals/TransparencyModal';
import { useAppContext } from '../context/AppContext';

/* ── Star Rating Display ─────────────────────────────────────── */
const StarRow = ({ rating, size = 14, showNum = true }) => {
    const r = parseFloat(rating) || 0;
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={size}
                    className={i <= Math.round(r)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-gray-600 fill-current'
                    }
                />
            ))}
            {showNum && <span className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">{r > 0 ? r.toFixed(1) : 'No ratings'}</span>}
        </div>
    );
};

/* ── Product Card ────────────────────────────────────────────── */
const ProductCard = ({ product, onProductClick }) => {
    const { addToWishlist, wishlist } = useAppContext();
    const isWishlisted = wishlist?.some(w => w._id === product._id);

    return (
        <div
            className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-green-200 dark:hover:border-green-900/50 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onProductClick?.(product)}
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Stock badge */}
                <div className="absolute top-2 left-2">
                    {product.stock === 0
                        ? <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Out of Stock</span>
                        : product.stock < 20
                            ? <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Low Stock</span>
                            : null
                    }
                </div>
                {/* Organic badge */}
                {(product.organic || product.isOrganic) && (
                    <div className="absolute top-2 right-2">
                        <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"><Leaf size={9} /> Organic</span>
                    </div>
                )}
                {/* Wishlist overlay */}
                <button
                    onClick={e => { e.stopPropagation(); addToWishlist?.(product); }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                    <Heart
                        size={14}
                        className={isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                    />
                </button>
                {/* Transparency QR button */}
                <button
                    onClick={e => { e.stopPropagation(); onProductClick?.({...product, showTransparency: true}); }}
                    className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform hover:text-green-600 dark:hover:text-green-400"
                    title="Scan for Manufacturing Details"
                >
                    <QrCode size={14} />
                </button>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white leading-tight line-clamp-1">{product.name}</h3>
                    <Badge>{product.category}</Badge>
                </div>

                {product.rating > 0 && (
                    <StarRow rating={product.rating} size={11} />
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                    {product.description || `Fresh ${product.category} straight from the farm.`}
                </p>

                {/* Freshness bar */}
                {product.expiresAt && (() => {
                    const daysLeft = Math.ceil((new Date(product.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                    const totalDays = product.freshnessDays || 4;
                    const pct = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
                    return daysLeft > 0 ? (
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                <span className="flex items-center gap-1"><Clock size={9} /> Freshness</span>
                                <span>{daysLeft}d left</span>
                            </div>
                            <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-amber-400' : 'bg-red-400'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    ) : null;
                })()}

                <div className="flex items-center justify-between mt-auto pt-1">
                    <div>
                        <p className="text-xl font-black text-green-700 dark:text-green-400">₹{product.price}</p>
                        <p className="text-[10px] text-gray-400">per kg</p>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                        <AddToCartButton product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════
   FarmerStorefrontView
   ════════════════════════════════════════════════════════════════ */
const FarmerStorefrontView = ({ farmer, products = [], BackBtn }) => {
    const { openChat, addToast, navigate, user, wishlist } = useAppContext();

    const [categoryFilter, setCategoryFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [shareTooltip, setShareTooltip] = useState(false);
    const [transparencyProduct, setTransparencyProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    if (!farmer) {
        return (
            <div className="pt-40 text-center text-gray-400">
                <Package size={48} className="mx-auto mb-4" />
                <p className="font-bold">Farmer not found.</p>
                <Button onClick={() => navigate('farmers')} variant="outline" className="mt-4">Browse Farmers</Button>
            </div>
        );
    }

    /* ── Computed data ── */
    const farmerProducts = useMemo(() =>
        products.filter(p => p.farmer === farmer._id || p.farmerName === farmer.name),
        [products, farmer]
    );

    const categories = useMemo(() => {
        const cats = [...new Set(farmerProducts.map(p => p.category).filter(Boolean))];
        return ['All', ...cats];
    }, [farmerProducts]);

    const avgRating = useMemo(() => {
        const rated = farmerProducts.filter(p => p.rating > 0);
        if (!rated.length) return 0;
        return (rated.reduce((s, p) => s + p.rating, 0) / rated.length).toFixed(1);
    }, [farmerProducts]);

    const totalReviews = useMemo(() =>
        farmerProducts.reduce((s, p) => s + (p.reviewsCount || p.reviews?.length || 0), 0),
        [farmerProducts]
    );

    const inStockCount = farmerProducts.filter(p => p.stock > 0).length;

    // All reviews across all products
    const allReviews = useMemo(() => {
        const reviews = [];
        farmerProducts.forEach(p => {
            (p.reviews || []).forEach(r => {
                reviews.push({ ...r, productName: p.name, productImage: p.images?.[0] || p.image });
            });
        });
        return reviews.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    }, [farmerProducts]);

    /* ── Filtered + sorted products ── */
    const filtered = useMemo(() => {
        let list = farmerProducts;
        if (categoryFilter !== 'All') list = list.filter(p => p.category === categoryFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
        }
        if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        if (sortBy === 'stock') list = [...list].sort((a, b) => b.stock - a.stock);
        return list;
    }, [farmerProducts, categoryFilter, search, sortBy]);

    /* ── WhatsApp ── */
    const handleWhatsApp = () => {
        if (!farmer.phone) { addToast(`Phone number not available for ${farmer.name}.`); return; }
        let p = String(farmer.phone).replace(/[^0-9]/g, '');
        if (p.length === 10) p = '91' + p;
        window.open(`https://wa.me/${p}`, '_blank');
    };

    /* ── Share ── */
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
        addToast('Store link copied!');
    };

    /* ── Years on FarmLink ── */
    const memberSince = farmer.createdAt
        ? new Date(farmer.createdAt).getFullYear()
        : new Date().getFullYear();

    /* ── Cover gradient based on name (deterministic) ── */
    const gradients = [
        'from-green-700 via-emerald-600 to-teal-700',
        'from-lime-700 via-green-600 to-emerald-700',
        'from-emerald-800 via-green-700 to-lime-600',
        'from-teal-700 via-emerald-600 to-green-700',
    ];
    const gradient = gradients[farmer.name.charCodeAt(0) % gradients.length];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* ═══════════════════════ HERO BANNER ═══════════════════════ */}
            <div className={`relative bg-gradient-to-br ${gradient} pt-24 pb-0 overflow-hidden`}>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back button */}
                    {BackBtn && (
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => navigate('farmers')}
                                className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors"
                            >
                                <ArrowLeft size={18} /> Back to Farmers
                            </button>
                        </div>
                    )}

                    {/* Profile section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 pb-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10">
                                {farmer.image
                                    ? <img src={farmer.image} alt={farmer.name} className="w-full h-full object-cover" />
                                    : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">
                                            {farmer.name.charAt(0).toUpperCase()}
                                        </div>
                                    )
                                }
                            </div>
                            {farmer.verified && (
                                <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg" title="Verified Farmer">
                                    <BadgeCheck size={20} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-3xl sm:text-4xl font-black text-white">{farmer.name}</h1>
                                {farmer.verified && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/40 rounded-full text-xs font-black text-blue-200">
                                        <BadgeCheck size={13} /> Verified Farmer
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-white/75 text-sm">
                                {farmer.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} /> {farmer.location}
                                    </span>
                                )}
                                {farmer.specialization && (
                                    <span className="flex items-center gap-1.5">
                                        <Sprout size={14} /> {farmer.specialization}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} /> Member since {memberSince}
                                </span>
                            </div>
                            {/* Star rating */}
                            {avgRating > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <StarRow rating={avgRating} size={15} showNum={false} />
                                    <span className="text-white font-black text-sm">{avgRating}</span>
                                    <span className="text-white/60 text-xs">({totalReviews} reviews)</span>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => openChat(farmer)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-700 font-black text-sm hover:bg-green-50 transition-colors shadow-lg"
                            >
                                <MessageSquare size={16} /> Chat
                            </button>
                            {farmer.phone && (
                                <button
                                    type="button"
                                    onClick={handleWhatsApp}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white font-black text-sm hover:bg-green-400 transition-colors shadow-lg"
                                >
                                    <Phone size={16} /> WhatsApp
                                </button>
                            )}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                                    title="Share store"
                                >
                                    <Share2 size={18} />
                                </button>
                                {shareTooltip && (
                                    <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-black text-white text-xs rounded-lg whitespace-nowrap">
                                        Link copied!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="relative h-8">
                    <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
                        <path d="M0,32 L1440,32 L1440,0 Q720,32 0,0 Z" className="fill-gray-50 dark:fill-gray-950" />
                    </svg>
                </div>
            </div>

            {/* ═══════════════════════ STATS BAR ═══════════════════════ */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: Package, label: 'Products Listed', value: farmerProducts.length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { icon: CheckCircle2, label: 'In Stock', value: inStockCount, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { icon: Star, label: 'Avg Rating', value: avgRating > 0 ? avgRating : '—', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { icon: Users, label: 'Total Reviews', value: totalReviews, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3 border border-white dark:border-gray-800 shadow-sm`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white dark:bg-gray-900 shadow-sm flex-shrink-0`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className={`text-xl font-black ${color}`}>{value}</p>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wide">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════ MAIN CONTENT ═══════════════════════ */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-10">

                {/* ── About / Bio ── */}
                {(farmer.bio || farmer.specialization) && (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Sprout size={20} className="text-green-600" /> About the Farmer
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            {farmer.bio || `${farmer.name} is a dedicated farmer from ${farmer.location || 'India'}, specializing in ${farmer.specialization || 'mixed crops'}. They are committed to delivering the freshest produce directly from their farm to your table.`}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {farmer.specialization && (
                                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-900/40">
                                    <Leaf size={11} /> {farmer.specialization}
                                </span>
                            )}
                            {farmer.location && (
                                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-900/40">
                                    <MapPin size={11} /> {farmer.location}
                                </span>
                            )}
                            {farmer.verified && (
                                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-900/40">
                                    <BadgeCheck size={11} /> Government Verified
                                </span>
                            )}
                            {categories.filter(c => c !== 'All').map(c => (
                                <span key={c} className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Products Section ── */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag size={22} className="text-green-600" />
                            Products
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-600">({farmerProducts.length})</span>
                        </h2>
                    </div>

                    {/* Search + Sort + Category filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="stock">Most in Stock</option>
                        </select>
                    </div>

                    {/* Category pills */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categories.map(cat => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                                        categoryFilter === cat
                                            ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-green-900/30'
                                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-600'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Package size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                            <p className="font-bold text-gray-500 dark:text-gray-400">No products found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Try a different category or search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {filtered.map(p => (
                                <ProductCard 
                                    key={p._id} 
                                    product={p} 
                                    onProductClick={(clickedProd) => {
                                        if (clickedProd.showTransparency) {
                                            setTransparencyProduct(clickedProd);
                                        } else {
                                            setSelectedProduct(clickedProd);
                                            setCurrentMediaIndex(0);
                                        }
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Customer Reviews ── */}
                {allReviews.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Star size={22} className="text-amber-500 fill-amber-400" /> Customer Reviews
                            </h2>
                            {/* Rating summary */}
                            <div className="text-right">
                                <p className="text-4xl font-black text-gray-900 dark:text-white">{avgRating}</p>
                                <StarRow rating={avgRating} size={13} showNum={false} />
                                <p className="text-xs text-gray-400 mt-0.5">{totalReviews} reviews</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allReviews.map((review, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                                    {/* Product reference */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {review.productImage && (
                                            <img src={review.productImage} alt={review.productName} className="w-8 h-8 rounded-lg object-cover" />
                                        )}
                                        <span className="text-xs font-black text-gray-500 dark:text-gray-500 uppercase tracking-wide">{review.productName}</span>
                                        {review.isVerified && (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full ml-auto">
                                                <CheckCircle2 size={9} /> Verified
                                            </span>
                                        )}
                                    </div>

                                    <StarRow rating={review.rating} size={12} showNum={false} />
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">"{review.comment}"</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-xs font-black text-gray-500 dark:text-gray-500">{review.userName || 'Customer'}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-600">
                                            {review.date ? new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Contact Section ── */}
                <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl p-8 text-white shadow-xl`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2">Get in Touch</h2>
                        <p className="text-white/75 text-sm mb-6">Have questions about {farmer.name}'s products? Reach out directly!</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => openChat(farmer)}
                                className="flex items-center gap-3 px-5 py-4 bg-white/15 border border-white/20 rounded-2xl hover:bg-white/25 transition-colors text-left"
                            >
                                <MessageSquare size={22} className="flex-shrink-0" />
                                <div>
                                    <p className="font-black text-sm">FarmLink Chat</p>
                                    <p className="text-white/60 text-xs">Real-time messaging</p>
                                </div>
                            </button>

                            {farmer.phone && (
                                <button
                                    type="button"
                                    onClick={handleWhatsApp}
                                    className="flex items-center gap-3 px-5 py-4 bg-white/15 border border-white/20 rounded-2xl hover:bg-white/25 transition-colors text-left"
                                >
                                    <Phone size={22} className="flex-shrink-0" />
                                    <div>
                                        <p className="font-black text-sm">WhatsApp</p>
                                        <p className="text-white/60 text-xs">{farmer.phone}</p>
                                    </div>
                                </button>
                            )}

                            {farmer.email && (
                                <button
                                    type="button"
                                    onClick={() => { navigator.clipboard.writeText(farmer.email); addToast('Email copied!'); }}
                                    className="flex items-center gap-3 px-5 py-4 bg-white/15 border border-white/20 rounded-2xl hover:bg-white/25 transition-colors text-left"
                                >
                                    <Mail size={22} className="flex-shrink-0" />
                                    <div>
                                        <p className="font-black text-sm">Email</p>
                                        <p className="text-white/60 text-xs truncate">{farmer.email}</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
            {/* ── Local Product Details Modal ── */}
            {selectedProduct && (() => {
                const isWishlisted = wishlist?.some(w => w._id === selectedProduct._id);
                const allMedia = selectedProduct.images || [selectedProduct.image || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300'];
                const currentMedia = allMedia[currentMediaIndex] || allMedia[0];
                const isVideo = currentMedia?.includes('.mp4') || currentMedia?.startsWith('data:video');

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)} />
                        
                        <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-slide-up border border-gray-200 dark:border-gray-800 flex flex-col custom-scrollbar">
                            
                            <button
                                type="button"
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition z-20"
                            >
                                <X size={20} className="text-gray-700 dark:text-gray-300" />
                            </button>

                            <div className="flex flex-col md:flex-row gap-0">
                                {/* Left: Image Gallery */}
                                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-800/80 p-6 md:p-8 flex flex-col justify-center items-center relative min-h-[300px]">
                                    <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-lg relative bg-white dark:bg-black/20">
                                        {isVideo ? (
                                            <video src={currentMedia} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <img src={currentMedia} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                        )}
                                        
                                        {allMedia.length > 1 && (
                                            <>
                                                <button onClick={() => setCurrentMediaIndex((currentMediaIndex - 1 + allMedia.length) % allMedia.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition-colors">
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button onClick={() => setCurrentMediaIndex((currentMediaIndex + 1) % allMedia.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition-colors">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    
                                    {allMedia.length > 1 && (
                                        <div className="flex gap-2 mt-6 overflow-x-auto w-full max-w-sm pb-2 scrollbar-hide">
                                            {allMedia.map((m, i) => (
                                                <button key={i} onClick={() => setCurrentMediaIndex(i)} className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${i === currentMediaIndex ? 'border-green-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                                    {m?.includes('.mp4') || m?.startsWith('data:video') ? (
                                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">Vid</div>
                                                    ) : (
                                                        <img src={m} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Details */}
                                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge>{selectedProduct.category}</Badge>
                                        {(selectedProduct.organic || selectedProduct.isOrganic) && (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-900/40 tracking-wider uppercase">
                                                <Leaf size={10} /> Certified Organic
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">BY {farmer.name}</p>

                                    {selectedProduct.rating > 0 && (
                                        <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 w-max px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                            <span className="text-lg font-black text-gray-900 dark:text-white">{selectedProduct.rating?.toFixed(1) || '0.0'}</span>
                                            <StarRow rating={selectedProduct.rating} size={14} showNum={false} />
                                            <span className="text-xs font-bold text-gray-500">({selectedProduct.reviewsCount || selectedProduct.reviews?.length || 0} reviews)</span>
                                        </div>
                                    )}

                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl font-black text-green-700 dark:text-green-500">₹{selectedProduct.price}</span>
                                        <span className="text-lg font-bold text-gray-400">per kg</span>
                                    </div>
                                    <div className="mb-6">
                                        <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                                            🚚 Get it by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8 flex-1">
                                        {selectedProduct.description || `${selectedProduct.name} carefully grown and harvested by ${farmer.name}. Buy direct from the farm for the best quality and prices.`}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <div className="col-span-2">
                                            <AddToCartButton product={selectedProduct} fullWidth />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => useAppContext().toggleWishlist?.(selectedProduct)} 
                                            className={`flex justify-center items-center gap-2 py-3.5 border-2 rounded-xl font-bold text-sm transition-colors ${isWishlisted ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'}`}
                                        >
                                            <Heart size={18} className={isWishlisted ? 'fill-current' : ''} /> {isWishlisted ? 'Wishlisted' : 'Save'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setTransparencyProduct(selectedProduct)} 
                                            className="flex justify-center items-center gap-2 py-3.5 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:border-green-400 hover:text-green-600 transition-colors"
                                        >
                                            <QrCode size={18} /> Transparency
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <TransparencyModal isOpen={!!transparencyProduct} onClose={() => setTransparencyProduct(null)} product={transparencyProduct} />
        </div>
    );
};

export default FarmerStorefrontView;
