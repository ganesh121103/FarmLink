import React, { useState } from 'react';
import { Package, Heart, ShoppingBasket, TrendingUp, Star, ArrowLeft, IndianRupee, CheckCircle2, Trash2, MessageSquare, Loader2, QrCode } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Button, AddToCartButton } from '../../components/ui/Button';
import { OrderTrackingTimeline } from '../../components/ui/Timeline';
import { ConversationSkeleton } from '../../components/ui/Skeletons';
import ReviewModal from '../../components/modals/ReviewModal';
import ReceiptModal from '../../components/modals/ReceiptModal';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import TransparencyModal from '../../components/modals/TransparencyModal';
import { useAppContext } from '../../context/AppContext';
import { apiCall } from '../../api/apiCall';

const CustomerDashboard = ({ orders, setOrders, BackBtn, setIsCheckoutOpen }) => {
    const { user, t, wishlist, removeFromWishlist, cart, navigate, openChat, addToast } = useAppContext();
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);
    const [receiptOrder, setReceiptOrder] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeDrilldown, setActiveDrilldown] = useState(null); // 'orders' | 'spent' | 'wishlist' | 'delivered' | 'messages'
    const [transparencyProduct, setTransparencyProduct] = useState(null);
    
    // --- Messaging State ---
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);

    React.useEffect(() => {
        if (activeDrilldown === 'messages' && user?._id) {
            setLoadingConversations(true);
            apiCall(`/chat/conversations?userId=${user._id}`)
                .then(({ data }) => setConversations(data || []))
                .catch(console.error)
                .finally(() => setLoadingConversations(false));
        }
    }, [activeDrilldown, user?._id]);

    const deleteConversation = async (conversationId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this chat history?")) return;
        try {
            await apiCall(`/chat/conversation/${conversationId}?userId=${user._id}`, 'DELETE');
            setConversations(prev => prev.filter(c => c._id !== conversationId));
            addToast("Chat deleted successfully");
        } catch(err) {
            console.error(err);
            addToast("Failed to delete chat");
        }
    };

    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalSpent = validOrders.reduce((sum, o) => sum + parseInt(o.total || 0), 0);
    const deliveredOrdersList = orders.filter(o => o.status === 'Delivered');
    const deliveredOrders = deliveredOrdersList.length;

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await apiCall(`/orders/${orderId}/cancel`, 'PUT');
            if (setOrders) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
            }
            addToast("Order cancelled successfully");
        } catch (err) {
            console.error(err);
            addToast("Failed to cancel order");
        }
    };

    // --- Drilldown Back Button ---
    const DrilldownBackBtn = () => (
        <button
            onClick={() => setActiveDrilldown(null)}
            className="flex items-center gap-2 mb-6 text-stone-500 hover:text-green-700 dark:hover:text-green-400 font-bold transition-colors group"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
        </button>
    );

    // --- Drilldown: Orders List ---
    const OrdersDrilldown = () => (
        <div className="animate-fade-in-up">
            <DrilldownBackBtn />
            <h2 className="text-2xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
                <Package size={28} className="text-green-600" /> All Orders ({orders.length})
            </h2>
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                    <Package size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                    <p className="text-stone-500 text-xl font-bold mb-4">{t('noOrders')}</p>
                    <Button onClick={() => navigate('products')} variant="outline">{t('startShopping')}</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md hover:border-green-200 dark:hover:border-green-900/40 transition-all"
                            onClick={() => setSelectedOrder(order)}
                        >
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
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {order.items?.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-stone-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-xs font-bold text-stone-600 dark:text-slate-300 whitespace-nowrap flex-shrink-0">
                                        <img src={item.images?.[0] || item.image} alt={item.name} className="w-5 h-5 rounded-md object-cover" />
                                        {item.name} ×{item.quantity || 1}
                                    </div>
                                ))}
                                {(order.items?.length || 0) > 4 && (
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center px-2">+{order.items.length - 4} more</span>
                                )}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-3 flex items-center gap-1">Tap to view full details →</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // --- Drilldown: Total Spent Breakdown ---
    const SpentDrilldown = () => (
        <div className="animate-fade-in-up">
            <DrilldownBackBtn />
            <h2 className="text-2xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
                <IndianRupee size={28} className="text-yellow-500" /> Spending Breakdown
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm mb-6">
                <div className="text-center mb-6">
                    <p className="text-sm text-stone-500 font-bold uppercase mb-1">Total Spent</p>
                    <p className="text-5xl font-black text-green-700 dark:text-green-400">₹{totalSpent}</p>
                    <p className="text-sm text-stone-400 mt-1">{validOrders.length} valid orders placed</p>
                </div>
            </div>
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                    <p className="text-stone-500 text-lg font-bold">No spending yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-stone-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm text-black dark:text-white">Order #{order._id?.slice(-6)}</p>
                                <p className="text-xs text-stone-400">{order.date}</p>
                                <p className="text-xs text-stone-500 mt-1">{order.items?.length || 0} items • {order.paymentMethod?.toUpperCase() || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-lg text-green-700 dark:text-green-400">₹{order.total}</p>
                                <Badge color={order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}>{order.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // --- Drilldown: Wishlist ---
    const WishlistDrilldown = () => (
        <div className="animate-fade-in-up">
            <DrilldownBackBtn />
            <h2 className="text-2xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
                <Heart size={28} className="text-blue-500" /> {t('wishlist')} ({wishlist.length})
            </h2>
            {wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                    <Heart size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                    <p className="text-stone-500 text-xl font-bold mb-4">{t('wishlistEmpty') || 'Your wishlist is empty'}</p>
                    <Button onClick={() => navigate('products')} variant="outline">Browse Products</Button>
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
                                <button
                                    onClick={e => { e.stopPropagation(); setTransparencyProduct(product); }}
                                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform hover:text-green-600 dark:hover:text-green-400"
                                    title="Scan for Manufacturing Details"
                                >
                                    <QrCode size={14} />
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
    );

    // --- Drilldown: Delivered Orders ---
    const DeliveredDrilldown = () => (
        <div className="animate-fade-in-up">
            <DrilldownBackBtn />
            <h2 className="text-2xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
                <CheckCircle2 size={28} className="text-purple-500" /> Delivered Orders ({deliveredOrders})
            </h2>
            {deliveredOrders === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                    <CheckCircle2 size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                    <p className="text-stone-500 text-xl font-bold">No delivered orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {deliveredOrdersList.map((order, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-stone-500 font-bold mb-1">Order #{order._id}</p>
                                    <p className="text-xs text-stone-400">{order.date}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-black text-green-700 dark:text-green-400">₹{order.total}</p>
                                    <Badge color="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Delivered</Badge>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <img src={item.images?.[0] || item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                                        <p className="font-medium text-sm flex-1 text-black dark:text-white">{item.name} <span className="text-stone-400 text-xs">x{item.quantity || 1}</span></p>
                                        <p className="font-bold text-sm text-black dark:text-white">₹{parseInt(item.price) * (item.quantity || 1)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="text-sm py-2 bg-stone-100 text-stone-800 shadow-none dark:bg-slate-700 dark:text-white" onClick={() => setReceiptOrder(order)}>Receipt</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // --- Drilldown: Messages ---
    const MessagesDrilldown = () => (
        <div className="animate-fade-in-up">
            <DrilldownBackBtn />
            <h2 className="text-2xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
                <MessageSquare size={28} className="text-indigo-500" /> My Messages
            </h2>
            {loadingConversations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <ConversationSkeleton key={i} />)}
                </div>
            ) : conversations.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-stone-300 dark:border-slate-600">
                    <MessageSquare size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                    <p className="text-stone-500 text-xl font-bold mb-4">No messages yet</p>
                    <Button onClick={() => navigate('farmers')} variant="outline">Find Farmers</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conversations.map(conv => {
                        const otherId = conv.senderId === user._id ? conv.receiverId : conv.senderId;
                        const otherName = conv.senderId === user._id ? (conv.receiverName || 'Farmer') : conv.senderName;
                        const otherRole = conv.senderId === user._id ? 'farmer' : conv.senderRole;
                        const otherImage = conv.otherUserImage;
                        
                        return (
                            <Card 
                                key={conv._id} 
                                className="p-5 cursor-pointer hover:border-green-400 transition-colors relative group"
                                onClick={() => openChat({ _id: otherId, name: otherName, role: otherRole, image: otherImage })}
                            >
                                <button
                                    className="absolute top-3 right-3 p-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={(e) => deleteConversation(conv._id, e)}
                                    title="Delete Conversation"
                                >
                                    <Trash2 size={16} />
                                </button>
                                {conv.unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                                        {conv.unreadCount}
                                    </span>
                                )}
                                <div className="flex items-center gap-4 mb-3 pr-8">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 font-black text-lg overflow-hidden flex-shrink-0">
                                        {otherImage ? (
                                            <img src={otherImage} alt={otherName} className="w-full h-full object-cover" />
                                        ) : (
                                            otherName.charAt(0)?.toUpperCase() || 'F'
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-black dark:text-white truncate">{otherName}</h4>
                                        <p className="text-[10px] text-stone-400 uppercase font-bold">{otherRole}</p>
                                    </div>
                                    <div className="text-[10px] text-stone-400 whitespace-nowrap">
                                        {new Date(conv.lastTime).toLocaleDateString()}
                                    </div>
                                </div>
                                <p className="text-sm text-stone-600 dark:text-slate-300 line-clamp-2 italic bg-stone-50 dark:bg-slate-900/50 p-3 rounded-xl border border-stone-100 dark:border-slate-700">
                                    "{conv.lastMessage}"
                                </p>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // --- If a drilldown is active, show it ---
    if (activeDrilldown) {
        return (
            <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
                {activeDrilldown === 'orders' && <OrdersDrilldown />}
                {activeDrilldown === 'spent' && <SpentDrilldown />}
                {activeDrilldown === 'wishlist' && <WishlistDrilldown />}
                {activeDrilldown === 'delivered' && <DeliveredDrilldown />}
                {activeDrilldown === 'messages' && <MessagesDrilldown />}
                <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} product={selectedReviewProduct} />
                <ReceiptModal isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} order={receiptOrder} />
                <TransparencyModal isOpen={!!transparencyProduct} onClose={() => setTransparencyProduct(null)} product={transparencyProduct} />
            </div>
        );
    }

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-black dark:text-white mb-1">
                    Welcome back, <span className="text-green-700 dark:text-green-400">{user?.name?.split(' ')[0]}!</span>
                </h1>
                <p className="text-stone-500 font-medium">Here's a summary of your FarmLink activity.</p>
            </div>

            {/* Stats - Clickable */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                <Card className="p-5 text-center border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => setActiveDrilldown('orders')}>
                    <div className="text-3xl font-black text-black dark:text-white">{validOrders.length}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('orders')}</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => setActiveDrilldown('spent')}>
                    <div className="text-3xl font-black text-green-700 dark:text-green-400">₹{totalSpent}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">Total Spent</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => setActiveDrilldown('wishlist')}>
                    <div className="text-3xl font-black text-black dark:text-white">{wishlist.length}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('wishlist')}</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => setActiveDrilldown('delivered')}>
                    <div className="text-3xl font-black text-black dark:text-white">{deliveredOrders}</div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">Delivered</p>
                </Card>
                <Card className="p-5 text-center border-l-4 border-l-indigo-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all bg-indigo-50/50 dark:bg-indigo-900/10" onClick={() => setActiveDrilldown('messages')}>
                    <div className="flex justify-center mb-1 text-indigo-500"><MessageSquare size={32} /></div>
                    <p className="text-xs text-stone-500 font-bold uppercase mt-1">Messages</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <div onClick={() => navigate('activity')} className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform"><Package size={28} /></div>
                    <div><h3 className="font-bold text-black dark:text-white">{t('orderHistory')}</h3><p className="text-sm text-stone-500">{validOrders.length} valid orders</p></div>
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
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md hover:border-green-200 dark:hover:border-green-900/40 transition-all"
                        onClick={() => setSelectedOrder(order)}
                    >
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
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {order.items?.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-stone-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-xs font-bold text-stone-600 dark:text-slate-300 whitespace-nowrap flex-shrink-0">
                                    <img src={item.images?.[0] || item.image} alt={item.name} className="w-5 h-5 rounded-md object-cover" />
                                    {item.name} ×{item.quantity || 1}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-3">Tap to view details →</p>
                    </div>
                ))}
                {orders.length > 3 && (
                    <div className="text-center">
                        <Button variant="outline" onClick={() => setActiveDrilldown('orders')} className="mx-auto">View all {orders.length} orders</Button>
                    </div>
                )}
            </div>

            <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} product={selectedReviewProduct} />
            <ReceiptModal isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} order={receiptOrder} />
            <OrderDetailModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                onReview={(productData) => { setSelectedReviewProduct(productData); setReviewModalOpen(true); }}
                onReceipt={(o) => setReceiptOrder(o)}
                onCancel={handleCancelOrder}
            />
            <TransparencyModal isOpen={!!transparencyProduct} onClose={() => setTransparencyProduct(null)} product={transparencyProduct} />
        </div>
    );
};

export default CustomerDashboard;
