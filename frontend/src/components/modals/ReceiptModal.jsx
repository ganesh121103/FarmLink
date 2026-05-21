import React from 'react';
import { X, Leaf, FileText, Download, MapPin, CreditCard, Calendar, Hash, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const ReceiptModal = ({ isOpen, onClose, order }) => {
    const { addToast } = useAppContext();

    if (!isOpen || !order) return null;

    // ── Normalise address ───────────────────────────────────────────
    const deliveryAddress = (order.address || order.deliveryAddress || '').trim() || 'Address not provided';
    const paymentLabel   = (order.paymentMethod || 'N/A').toUpperCase();
    const orderDate      = order.date || new Date(order.createdAt).toLocaleDateString('en-IN') || 'N/A';
    const customerName   = order.userName || 'Customer';

    const handlePrint = () => window.print();

    const handleDownload = () => {
        const rows = order.items?.map(item => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        ${item.image || item.images?.[0]
                            ? `<img src="${item.images?.[0] || item.image}" alt="${item.name}" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0"/>`
                            : ''}
                        <div>
                            <strong>${item.name}</strong>
                            <div style="font-size:11px;color:#a8a29e;font-weight:600;text-transform:uppercase;margin-top:2px">BY ${item.farmerName || 'Farmer'}</div>
                        </div>
                    </div>
                </td>
                <td style="text-align:center">${item.quantity || 1}</td>
                <td style="text-align:right;font-weight:800">₹${parseInt(item.price) * (item.quantity || 1)}</td>
            </tr>`).join('') || '';

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmLink Receipt — #${order._id}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #1c1917; line-height: 1.5; padding: 40px; background: #f5f5f4; }
        .receipt-box { max-width: 640px; margin: 0 auto; background: #fff; padding: 50px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .header { text-align: center; padding-bottom: 28px; border-bottom: 2px solid #e7e5e4; margin-bottom: 32px; }
        .header h1 { color: #15803d; font-size: 32px; font-weight: 900; margin-bottom: 4px; }
        .header p { color: #78716c; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px; }
        .meta-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px 20px; }
        .meta-label { font-size: 10px; color: #a8a29e; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px; }
        .meta-value { font-size: 14px; font-weight: 800; color: #1c1917; }
        .meta-sub { font-size: 13px; color: #57534e; font-weight: 500; margin-top: 3px; }
        .address-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 36px; }
        .address-label { font-size: 10px; color: #166534; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .address-name { font-size: 15px; font-weight: 800; color: #15803d; margin-bottom: 4px; }
        .address-text { font-size: 13px; color: #166534; font-weight: 500; line-height: 1.6; white-space: pre-line; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e7e5e4; color: #a8a29e; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
        td { padding: 16px 0; border-bottom: 1px solid #f5f5f4; vertical-align: middle; }
        .total-section { display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #1c1917; padding-top: 24px; margin-bottom: 36px; }
        .total-label { font-size: 18px; font-weight: 900; }
        .total-value { font-size: 36px; font-weight: 900; color: #15803d; }
        .footer { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 20px; text-align: center; border-radius: 12px; font-weight: 800; font-size: 14px; }
        .payment-badge { display: inline-block; background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: #57534e; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
    </style>
</head>
<body>
    <div class="receipt-box">
        <div class="header">
            <h1>🌱 FarmLink</h1>
            <p>Official Order Receipt</p>
        </div>

        <div class="meta-grid">
            <div class="meta-box">
                <div class="meta-label">Order ID</div>
                <div class="meta-value">#${order._id?.slice(-8) || order._id}</div>
                <div class="meta-sub">${orderDate}</div>
                <div class="payment-badge">💳 ${paymentLabel}</div>
            </div>
            <div class="meta-box">
                <div class="meta-label">Status</div>
                <div class="meta-value" style="color:${order.status === 'Delivered' ? '#15803d' : '#2563eb'}">${order.status || 'Placed'}</div>
                <div class="meta-sub">${order.items?.length || 0} item(s) ordered</div>
            </div>
        </div>

        <div class="address-box">
            <div class="address-label">📍 Delivery Address</div>
            <div class="address-name">${customerName}</div>
            <div class="address-text">${deliveryAddress}</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align:center">Qty</th>
                    <th style="text-align:right">Amount</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>

        <div class="total-section">
            <span class="total-label">Total Paid</span>
            <span class="total-value">₹${order.total}</span>
        </div>

        <div class="footer">🌱 Thank you for supporting local farmers, ${customerName.split(' ')[0]}!</div>
    </div>
    <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `FarmLink_Receipt_${order._id?.slice(-8) || order._id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('Digital receipt downloaded!');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 print:p-0 print:bg-white print:block">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={onClose} />

            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 animate-fade-in-up print:shadow-none print:rounded-none print:w-full print:max-w-full print:bg-white max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">

                {/* ── Header ── */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-stone-200 dark:border-slate-700 px-6 pt-6 pb-5 z-10 rounded-t-3xl text-center print:static">
                    <button onClick={onClose} className="absolute top-5 right-5 p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors print:hidden" aria-label="Close">
                        <X size={20} />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-500 mb-1">
                        <Leaf size={28} className="fill-current" />
                        <h2 className="text-2xl font-black">FarmLink</h2>
                    </div>
                    <p className="text-xs text-stone-400 dark:text-slate-500 font-bold uppercase tracking-widest">Official Order Receipt</p>
                </div>

                <div className="p-6 md:p-8 space-y-6">

                    {/* ── Order meta row ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-50 dark:bg-slate-900/50 border border-stone-100 dark:border-slate-700 rounded-2xl p-4">
                            <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider mb-2 flex items-center gap-1">
                                <Hash size={10} /> Order Details
                            </p>
                            <p className="font-black text-sm text-black dark:text-white truncate">#{order._id?.slice(-8) || order._id}</p>
                            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <Calendar size={10} /> {orderDate}
                            </p>
                            <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-slate-300 rounded-md uppercase tracking-wide">
                                💳 {paymentLabel}
                            </span>
                        </div>

                        <div className="bg-stone-50 dark:bg-slate-900/50 border border-stone-100 dark:border-slate-700 rounded-2xl p-4">
                            <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider mb-2 flex items-center gap-1">
                                <User size={10} /> Customer
                            </p>
                            <p className="font-black text-sm text-black dark:text-white truncate">{customerName}</p>
                            <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-md ${
                                order.status === 'Delivered'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                                {order.status || 'Placed'}
                            </span>
                        </div>
                    </div>

                    {/* ── Delivery Address ── */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-4">
                        <p className="text-[10px] text-green-700 dark:text-green-500 uppercase font-black tracking-wider mb-2 flex items-center gap-1.5">
                            <MapPin size={11} /> Delivery Address
                        </p>
                        <p className="font-black text-sm text-green-900 dark:text-green-300 mb-1">{customerName}</p>
                        <p className="text-sm text-green-800 dark:text-green-400 font-medium leading-relaxed whitespace-pre-line">
                            {deliveryAddress}
                        </p>
                    </div>

                    {/* ── Items table ── */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-stone-200 dark:border-slate-700 text-stone-400 text-[10px] uppercase tracking-wider">
                                <th className="pb-3 font-black">Item</th>
                                <th className="pb-3 text-center font-black">Qty</th>
                                <th className="pb-3 text-right font-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-slate-700/40">
                            {order.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            {(item.images?.[0] || item.image) && (
                                                <img
                                                    src={item.images?.[0] || item.image}
                                                    alt={item.name}
                                                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-stone-100 dark:border-slate-700"
                                                />
                                            )}
                                            <div>
                                                <p className="font-bold text-black dark:text-white leading-tight">{item.name}</p>
                                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">
                                                    By {item.farmerName || 'Farmer'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-center text-sm font-black text-stone-600 dark:text-slate-300">
                                        ×{item.quantity || 1}
                                    </td>
                                    <td className="py-3 text-right font-black text-sm text-black dark:text-white">
                                        ₹{parseInt(item.price) * (item.quantity || 1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ── Total ── */}
                    <div className="border-t-2 border-stone-800 dark:border-slate-300 pt-5 flex justify-between items-center">
                        <span className="text-base font-black text-black dark:text-white">Total Paid</span>
                        <span className="text-3xl font-black text-green-700 dark:text-green-400">₹{order.total}</span>
                    </div>

                    {/* ── Footer note ── */}
                    <div className="text-center bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 p-4 rounded-2xl print:border print:border-stone-200 print:bg-transparent">
                        <p className="text-green-800 dark:text-green-400 font-bold text-sm">
                            🌱 Thank you for supporting local farmers, {customerName.split(' ')[0]}!
                        </p>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                        <Button variant="outline" onClick={onClose} className="flex-1 py-3">Close</Button>
                        <Button
                            variant="secondary"
                            onClick={handleDownload}
                            className="flex-1 py-3 flex items-center justify-center gap-2 shadow-none bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                        >
                            <Download size={16} /> Download
                        </Button>
                        <Button onClick={handlePrint} className="flex-1 py-3 flex items-center justify-center gap-2">
                            <FileText size={16} /> Print
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
