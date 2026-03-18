import React, { useState } from 'react';
import { Package, Heart, HeartOff, ShoppingBasket, X, Minus, Plus, User, Trash2, ArrowRight, FileText, Star } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Button, AddToCartButton } from '../components/ui/Button';
import { OrderTrackingTimeline } from '../components/ui/Timeline';
import ReviewModal from '../components/modals/ReviewModal';
import ReceiptModal from '../components/modals/ReceiptModal';
import { useAppContext } from '../context/AppContext';

const CustomerActivityView = ({ orders, BackBtn, setIsCheckoutOpen }) => {
    const { t, wishlist, removeFromWishlist, cart, removeFromCart, updateCartQuantity, navigate } = useAppContext();
    const [activeTab, setActiveTab] = useState('orders');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [receiptOrder, setReceiptOrder] = useState(null);

    const handleOpenReview = (orderId) => { setSelectedOrderId(orderId); setReviewModalOpen(true); };

    const tabStyle = (tab) => `py-3 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-green-600 text-green-700 dark:text-green-400' : 'border-transparent text-stone-500 hover:text-black dark:hover:text-white'}`;

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
            <BackBtn />
            <h2 className="text-4xl md:text-5xl font-black mb-8 text-black dark:text-white">{t('myActivity')}</h2>

            <div className="flex gap-4 mb-8 border-b border-stone-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('orders')} className={tabStyle('orders')}>{t('orderHistory')}</button>
                <button onClick={() => setActiveTab('wishlist')} className={tabStyle('wishlist')}>{t('wishlist')} ({wishlist.length})</button>
                <button onClick={() => setActiveTab('cart')} className={`${tabStyle('cart')} flex items-center gap-2`}>
                    {t('cart')} <span className="bg-green-100 text-green-800 text-xs py-0.5 px-2 rounded-full">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="space-y-6 animate-fade-in-up">
                    {orders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                            <Package size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                            <p className="text-xl font-bold text-stone-500">{t('noOrders')}</p>
                        </div>
                    ) : orders.map((order, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-stone-500 font-bold mb-1">Order #{order._id}</p>
                                        <p className="text-xs text-stone-400">{order.date}</p>
                                    </div>
                                    <Badge color={order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>{order.status}</Badge>
                                </div>
                                <div className="space-y-3 mb-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <img src={item.images?.[0] || item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                                            <p className="font-medium text-sm flex-1">{item.name} <span className="text-stone-400 text-xs">x{item.quantity || 1}</span></p>
                                            <p className="font-bold text-sm">₹{parseInt(item.price) * (item.quantity || 1)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-stone-100 dark:border-slate-700 pt-4 flex justify-between items-center mb-4">
                                    <span className="font-bold">{t('total')}: ₹{order.total}</span>
                                    <span className="text-xs text-stone-500 bg-stone-100 dark:bg-slate-700 px-2 py-1 rounded">{t('paidVia')} {order.paymentMethod?.toUpperCase()}</span>
                                </div>
                                <OrderTrackingTimeline status={order.status} />
                            </div>
                            <div className="flex flex-col justify-center gap-3 md:border-l md:border-stone-100 md:dark:border-slate-700 md:pl-6 min-w-[150px]">
                                {order.status === 'Delivered' && (
                                    <>
                                        <Button variant="outline" className="w-full text-sm py-2" onClick={() => handleOpenReview(order._id)}><Star size={16} /> {t('leaveReview')}</Button>
                                        <Button variant="secondary" className="w-full text-sm py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 shadow-none dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white" onClick={() => setReceiptOrder(order)}><FileText size={16} /> View Receipt</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'wishlist' && (
                <div className="animate-fade-in-up">
                    {wishlist.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                            <HeartOff size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                            <p className="text-xl font-bold text-stone-500">{t('wishlistEmpty')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {wishlist.map(product => (
                                <Card key={product._id} className="overflow-hidden group flex flex-col relative h-full">
                                    <div className="h-40 overflow-hidden relative">
                                        <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button aria-label="Remove from Wishlist" onClick={() => removeFromWishlist(product)} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:scale-110 transition-transform text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-base mb-1">{product.name}</h3>
                                        <p className="text-xs text-stone-500 uppercase font-bold mb-3">{product.farmerName}</p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-black text-green-800 dark:text-green-400">₹{product.price}</span>
                                            <AddToCartButton product={product} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'cart' && (
                <div className="animate-fade-in-up">
                    {cart.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                            <ShoppingBasket size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                            <p className="text-xl font-bold text-stone-500 mb-4">{t('cartEmpty')}</p>
                            <Button variant="outline" onClick={() => navigate('products')} className="mx-auto">{t('browseProducts')}</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm">
                                        <img src={item.images?.[0] || item.image} alt={item.name} loading="lazy" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-black dark:text-slate-100">{item.name}</h4>
                                            <p className="text-xs text-stone-500 dark:text-slate-400 uppercase font-semibold mt-1 mb-2">{item.farmerName}</p>
                                            <p className="text-green-700 dark:text-green-400 font-black text-lg">₹{item.price}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <button onClick={() => removeFromCart(item._id)} className="text-stone-400 hover:text-red-500 transition-colors p-1"><X size={20} /></button>
                                            <div className="flex items-center bg-stone-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-stone-200 dark:border-slate-600">
                                                <button onClick={() => updateCartQuantity(item._id, item.quantity - 1)} className="px-3 py-2 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors" disabled={item.quantity <= 1}><Minus size={14} /></button>
                                                <span className="px-3 py-2 font-bold text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(item._id, item.quantity + 1)} className="px-3 py-2 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <span className="text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">{t('total')}</span>
                                    <span className="text-4xl font-black text-green-700 dark:text-green-500">₹{cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0)}</span>
                                </div>
                                <Button className="w-full md:w-auto px-10 py-4 text-lg shadow-xl hover:-translate-y-1" onClick={() => setIsCheckoutOpen(true)}>{t('checkout')} <ArrowRight size={20} /></Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} orderId={selectedOrderId} />
            <ReceiptModal isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} order={receiptOrder} />
        </div>
    );
};

export default CustomerActivityView;
