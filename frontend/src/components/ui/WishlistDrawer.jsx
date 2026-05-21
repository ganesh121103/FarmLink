import React, { useEffect } from 'react';
import { Heart, HeartOff, X, ShoppingBasket, Trash2, ArrowRight, Star, BadgeCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AddToCartButton } from './Button';

const WishlistDrawer = ({ isOpen, onClose }) => {
    const { wishlist, removeFromWishlist, navigate } = useAppContext();

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        // Prevent body scroll when open
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md z-[70] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center shadow-sm">
                            <Heart size={20} className="text-red-500 fill-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-black dark:text-white">My Wishlist</h2>
                            <p className="text-xs text-stone-400 dark:text-slate-500 font-medium">
                                {wishlist.length === 0 ? 'No saved items' : `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                        aria-label="Close wishlist"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-5 shadow-inner">
                                <HeartOff size={36} className="text-red-300 dark:text-red-700" />
                            </div>
                            <h3 className="text-xl font-black text-black dark:text-white mb-2">Nothing saved yet</h3>
                            <p className="text-stone-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                                Tap the ❤️ on any product to save it here for later.
                            </p>
                            <button
                                onClick={() => { onClose(); navigate('products'); }}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                            >
                                <ShoppingBasket size={16} /> Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wishlist.map((product) => (
                                <div
                                    key={product._id}
                                    className="group flex gap-4 p-3 bg-stone-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 hover:border-stone-200 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200"
                                >
                                    {/* Image */}
                                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-stone-200 dark:bg-slate-700">
                                        <img
                                            src={product.images?.[0] || product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1 mb-0.5">
                                            <h4 className="font-bold text-sm text-black dark:text-white leading-tight line-clamp-2">{product.name}</h4>
                                            <button
                                                onClick={() => removeFromWishlist(product)}
                                                aria-label="Remove from wishlist"
                                                className="flex-shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-stone-400 dark:text-slate-500 font-bold uppercase tracking-wide mb-1.5 line-clamp-1">{product.farmerName}</p>

                                        {/* Stars */}
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    className={i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-stone-300 dark:text-slate-600'}
                                                />
                                            ))}
                                            <span className="text-[10px] text-stone-400 font-bold ml-0.5">({product.reviewsCount || 0})</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-green-700 dark:text-green-400 font-black text-base">
                                                ₹{product.price}<span className="text-[10px] text-stone-400 font-bold">/kg</span>
                                            </span>
                                            <AddToCartButton product={product} size="sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {wishlist.length > 0 && (
                    <div className="p-4 border-t border-stone-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
                        <button
                            onClick={() => { onClose(); navigate('activity'); window.location.hash = 'wishlist'; }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Heart size={16} className="fill-current" />
                            View Full Wishlist
                            <ArrowRight size={16} />
                        </button>
                        <p className="text-center text-xs text-stone-400 dark:text-slate-500 font-medium mt-2">
                            Add all items to cart from the full wishlist page
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default WishlistDrawer;
