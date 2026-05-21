import React from 'react';
import {
    X, Package, MapPin, CreditCard, Sprout, CheckCircle2,
    Truck, Clock, ShoppingBag, Star, FileText, Copy, Check
} from 'lucide-react';
import Badge from '../ui/Badge';

/* ── Status step config (Flipkart-style progress) ───────────── */
const STEPS = [
    { key: 'Placed',    label: 'Order Placed',    icon: ShoppingBag },
    { key: 'Confirmed', label: 'Confirmed',        icon: CheckCircle2 },
    { key: 'Shipped',   label: 'Shipped',          icon: Truck },
    { key: 'Delivered', label: 'Delivered',        icon: Package },
];

const statusOrder = { Placed: 0, Confirmed: 1, Shipped: 2, Delivered: 3 };

const statusColors = {
    Delivered: { bg: 'bg-green-500',  ring: 'ring-green-200 dark:ring-green-900/40',  text: 'text-green-700 dark:text-green-400',  badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    Shipped:   { bg: 'bg-blue-500',   ring: 'ring-blue-200 dark:ring-blue-900/40',    text: 'text-blue-700 dark:text-blue-400',    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    Confirmed: { bg: 'bg-purple-500', ring: 'ring-purple-200 dark:ring-purple-900/40', text: 'text-purple-700 dark:text-purple-400', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    Placed:    { bg: 'bg-amber-500',  ring: 'ring-amber-200 dark:ring-amber-900/40',  text: 'text-amber-700 dark:text-amber-400',  badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
};

/* ── Copy-to-clipboard helper ────────────────────────────────── */
const useCopyId = () => {
    const [copied, setCopied] = React.useState(false);
    const copy = (text) => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return { copied, copy };
};

/* ════════════════════════════════════════════════════════════════
   OrderDetailModal
   Props:
     isOpen   — boolean
     onClose  — fn()
     order    — order object
     onReview — fn(orderId) optional
     onReceipt— fn(order)   optional
   ════════════════════════════════════════════════════════════════ */
const OrderDetailModal = ({ isOpen, onClose, order, onReview, onReceipt, onCancel }) => {
    const { copied, copy } = useCopyId();

    if (!isOpen || !order) return null;

    const currentStep = statusOrder[order.status] ?? 0;
    const colors      = statusColors[order.status] || statusColors.Placed;

    const subtotal     = order.items?.reduce((s, i) => s + parseInt(i.price || 0) * (i.quantity || 1), 0) || 0;
    const deliveryFee  = 0; // free delivery
    const total        = parseInt(order.total || subtotal);

    const orderId   = order._id || '';
    const shortId   = orderId.startsWith('ord_') ? orderId : `#ord_${orderId.slice(-5)}`;
    const orderDate = order.date || order.createdAt
        ? new Date(order.date || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    // Group items by farmer
    const byFarmer = {};
    (order.items || []).forEach(item => {
        const fname = item.farmerName || 'FarmLink Seller';
        if (!byFarmer[fname]) byFarmer[fname] = [];
        byFarmer[fname].push(item);
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-gray-950 sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header banner ── */}
                <div className={`relative p-5 sm:p-6 bg-gradient-to-br from-green-700 to-emerald-800 text-white flex-shrink-0`}>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Status badge */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30`}>
                            {order.status === 'Cancelled' && <X size={13} />}
                            {order.status === 'Delivered' && <CheckCircle2 size={13} />}
                            {order.status === 'Shipped'   && <Truck size={13} />}
                            {order.status === 'Placed'    && <Clock size={13} />}
                            {order.status?.toUpperCase() || 'PLACED'}
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black">Order Details</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-green-100 text-sm font-mono">{shortId}</p>
                        <button
                            onClick={() => copy(orderId)}
                            className="p-1 rounded hover:bg-white/20 transition-colors"
                            title="Copy order ID"
                        >
                            {copied ? <Check size={13} className="text-green-300" /> : <Copy size={13} className="text-green-200" />}
                        </button>
                    </div>
                    <p className="text-green-200 text-xs mt-0.5">{orderDate}</p>
                </div>

                {/* ── Body ── */}
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800/80">

                    {/* Progress tracker */}
                    <div className="px-5 sm:px-6 py-5">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Order Progress</h3>
                        <div className="relative">
                            {/* Track line */}
                            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-800 mx-[calc(8%)]" />
                            <div
                                className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-700 mx-[calc(8%)]"
                                style={{ width: `${(currentStep / (STEPS.length - 1)) * 84}%` }}
                            />
                            <div className="relative flex justify-between">
                                {STEPS.map((step, idx) => {
                                    const done    = idx <= currentStep;
                                    const current = idx === currentStep;
                                    const Icon    = step.icon;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
                                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                                                done
                                                    ? `bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/30 ${current ? 'ring-4 ring-green-100 dark:ring-green-900/50' : ''}`
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                                            }`}>
                                                <Icon size={18} />
                                                {current && (
                                                    <span className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
                                                )}
                                            </div>
                                            <p className={`text-[10px] font-bold text-center leading-tight ${done ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Items — grouped by farmer */}
                    <div className="px-5 sm:px-6 py-5">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                            Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-5">
                            {Object.entries(byFarmer).map(([farmerName, items]) => (
                                <div key={farmerName}>
                                    {/* Farmer label */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sprout size={14} className="text-green-600 dark:text-green-400" />
                                        <span className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wide">
                                            {farmerName}
                                        </span>
                                    </div>
                                    <div className="space-y-3 pl-4 border-l-2 border-green-100 dark:border-green-900/40">
                                        {items.map((item, idx) => {
                                            const itemTotal = parseInt(item.price || 0) * (item.quantity || 1);
                                            return (
                                                <div key={idx} className="flex gap-3 items-start">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                        <img
                                                            src={item.images?.[0] || item.image || 'https://via.placeholder.com/64'}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{item.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.category || 'Fresh Produce'}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                                    Qty: {item.quantity || 1}
                                                                </span>
                                                                <span className="text-xs text-gray-400">× ₹{item.price}/kg</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {onReview && order.status === 'Delivered' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onClose(); onReview({ productId: item.productId, name: item.name }); }}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                                                    >
                                                                        <Star size={13} /> Review
                                                                    </button>
                                                                )}
                                                                <span className="text-sm font-black text-gray-900 dark:text-white">₹{itemTotal}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery address */}
                    {order.address && (
                        <div className="px-5 sm:px-6 py-5">
                            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Delivery Address</h3>
                            <div className="flex gap-3 items-start bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <MapPin size={18} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{order.userName || 'Customer'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{order.address}</p>
                                    {order.pincode && <p className="text-xs text-gray-400 mt-0.5">PIN: {order.pincode}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment summary */}
                    <div className="px-5 sm:px-6 py-5">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Payment Summary</h3>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Items ({order.items?.length || 0})</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Delivery</span>
                                <span className="text-green-600 dark:text-green-400 font-bold">FREE</span>
                            </div>
                            {order.paymentMethod && (
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5"><CreditCard size={13} /> Payment</span>
                                    <span className="font-bold uppercase">{order.paymentMethod}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between">
                                <span className="font-black text-gray-900 dark:text-white">Total</span>
                                <span className="font-black text-xl text-green-700 dark:text-green-400">₹{total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 sm:px-6 py-4 flex flex-wrap gap-3 bg-white dark:bg-gray-950">
                    {onReceipt && (
                        <button
                            onClick={() => { onClose(); onReceipt(order); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FileText size={16} /> Receipt
                        </button>
                    )}

                    {onCancel && ['Placed', 'Processing', 'Confirmed'].includes(order.status) && (
                        <button
                            onClick={() => { onCancel(order._id); onClose(); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <X size={16} /> Cancel Order
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
