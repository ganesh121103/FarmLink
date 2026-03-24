import React, { useState } from 'react';
import { Package, Heart, ShoppingBasket, TrendingUp, Star } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderTrackingTimeline } from '../../components/ui/Timeline';
import ReviewModal from '../../components/modals/ReviewModal';
import ReceiptModal from '../../components/modals/ReceiptModal';
import { useAppContext } from '../../context/AppContext';

const CustomerDashboard = ({ orders, BackBtn, setIsCheckoutOpen }) => {
    const { user, t, wishlist, cart, navigate } = useAppContext();
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [receiptOrder, setReceiptOrder] = useState(null);

    const totalSpent = orders.reduce((sum, o) => sum + parseInt(o.total || 0), 0);
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-black dark:text-white mb-1">
                    Welcome back, <span className="text-green-700 dark:text-green-400">{user?.name?.split(' ')[0]}!</span>
                </h1>
                <p className="text-stone-500 font-medium">Here's a summary of your FarmLink activity.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <Card className="p-5 text-center border-l-4 border-l-green-500">
                    <div className="text-3xl font-black text-black dark:text-white">{orders.length}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('orders')}</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-yellow-500">
                    <div className="text-3xl font-black text-green-700 dark:text-green-400">₹{totalSpent}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">Total Spent</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-blue-500">
                    <div className="text-3xl font-black text-black dark:text-white">{wishlist.length}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('wishlist')}</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-purple-500">
                    <div className="text-3xl font-black text-black dark:text-white">{deliveredOrders}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">Delivered</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <div onClick={() => navigate('activity')} className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform"><Package size={28} /></div>
                    <div><h3 className="font-bold text-black dark:text-white">{t('orderHistory')}</h3><p className="text-sm text-stone-500">{orders.length} orders</p></div>
                </div>
                <div onClick={() => { window.location.hash = 'wishlist'; navigate('activity'); }} className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-500 group-hover:scale-110 transition-transform"><Heart size={28} /></div>
                    <div><h3 className="font-bold text-black dark:text-white">{t('wishlist')}</h3><p className="text-sm text-stone-500">{wishlist.length} items saved</p></div>
                </div>
                <div onClick={() => navigate('products')} className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-500 group-hover:scale-110 transition-transform"><ShoppingBasket size={28} /></div>
                    <div><h3 className="font-bold text-black dark:text-white">{t('marketplace')}</h3><p className="text-sm text-stone-500">Browse fresh produce</p></div>
                </div>
            </div>

            {/* Recent Orders */}
            <h2 className="text-2xl font-black text-black dark:text-white mb-6">Recent Orders</h2>
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                        <Package size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                        <p className="text-stone-500 text-xl font-bold mb-4">{t('noOrders')}</p>
                        <Button onClick={() => navigate('products')} variant="outline">{t('startShopping')}</Button>
                    </div>
                ) : orders.slice(0, 3).map((order, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-stone-500 font-bold mb-1">Order #{order._id}</p>
                                <p className="text-xs text-stone-400">{order.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="font-black text-green-700 dark:text-green-400">₹{order.total}</p>
                                <Badge color={order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}>{order.status}</Badge>
                            </div>
                        </div>
                        <OrderTrackingTimeline status={order.status} />
                        {order.status === 'Delivered' && (
                            <div className="flex gap-3 mt-8">
                                <Button variant="outline" className="text-sm py-2" onClick={() => { setSelectedOrderId(order._id); setReviewModalOpen(true); }}><Star size={16} /> Review</Button>
                                <Button variant="secondary" className="text-sm py-2 bg-stone-100 text-stone-800 shadow-none dark:bg-slate-700 dark:text-white" onClick={() => setReceiptOrder(order)}>Receipt</Button>
                            </div>
                        )}
                    </div>
                ))}
                {orders.length > 3 && (
                    <div className="text-center">
                        <Button variant="outline" onClick={() => navigate('activity')} className="mx-auto">View all {orders.length} orders</Button>
                    </div>
                )}
            </div>

            <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} orderId={selectedOrderId} />
            <ReceiptModal isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} order={receiptOrder} />
        </div>
    );
};

export default CustomerDashboard;
