import React from 'react';
import { X, Leaf, FileText, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const ReceiptModal = ({ isOpen, onClose, order }) => {
    const { addToast } = useAppContext();

    if (!isOpen || !order) return null;

    const handlePrint = () => { window.print(); };

    const handleDownload = () => {
        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FarmLink Receipt - #${order._id}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1c1917; line-height: 1.5; padding: 40px; background-color: #f5f5f4; margin: 0; }
            .receipt-box { max-width: 600px; margin: 0 auto; background: #fff; padding: 50px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e7e5e4; margin-bottom: 30px; }
            .header h1 { color: #15803d; margin: 0 0 5px 0; font-size: 32px; font-weight: 800; }
            .header p { color: #78716c; margin: 0; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; }
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .label { font-size: 11px; color: #a8a29e; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { font-size: 15px; font-weight: 800; color: #1c1917; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e7e5e4; color: #a8a29e; font-size: 12px; text-transform: uppercase; font-weight: 800; }
            td { padding: 16px 0; border-bottom: 1px solid #f5f5f4; }
            .total-section { display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #1c1917; padding-top: 24px; margin-bottom: 40px; }
            .total-label { font-size: 20px; font-weight: 900; }
            .total-value { font-size: 40px; font-weight: 900; color: #15803d; }
            .footer { background: #f0fdf4; color: #166534; padding: 20px; text-align: center; border-radius: 12px; font-weight: 800; font-size: 14px;}
        </style>
    </head>
    <body>
        <div class="receipt-box">
            <div class="header"><h1>🌱 FarmLink</h1><p>Official Order Receipt</p></div>
            <div class="details-grid">
                <div><span class="label">Order Details</span><span class="value" style="display:block">ID: #${order._id}</span><span class="value" style="display:block;font-weight:400">Date: ${order.date}</span></div>
                <div style="text-align:right"><span class="label">Delivered To</span><span class="value" style="display:block">${order.userName}</span><span class="value" style="display:block;font-weight:400">${order.address}</span></div>
            </div>
            <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
            <tbody>${order.items?.map(item => `<tr><td><strong>${item.name}</strong><br/><small>BY ${item.farmerName}</small></td><td style="text-align:center">${item.quantity || 1}</td><td style="text-align:right;font-weight:800">₹${parseInt(item.price) * (item.quantity || 1)}</td></tr>`).join('')}</tbody></table>
            <div class="total-section"><span class="total-label">Total Paid</span><span class="total-value">₹${order.total}</span></div>
            <div class="footer">Thank you for supporting local farmers! 🌱</div>
        </div>
        <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
    </body></html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FarmLink_Invoice_${order._id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast("Digital invoice downloaded!");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 print:p-0 print:bg-white print:block">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up print:shadow-none print:rounded-none print:w-full print:max-w-full print:text-black print:bg-white max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full print:hidden" aria-label="Close"><X size={20} /></button>

                <div className="border-b border-stone-200 dark:border-slate-700 pb-6 mb-6 text-center">
                    <h2 className="text-3xl font-black flex items-center justify-center gap-2 text-green-700 dark:text-green-500 mb-2">
                        <Leaf size={28} className="fill-current" /> FarmLink
                    </h2>
                    <p className="text-stone-500 dark:text-slate-400 text-sm font-medium">Official Order Receipt</p>
                </div>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Order Details</p>
                        <p className="font-bold text-black dark:text-white">ID: #{order._id}</p>
                        <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">Date: {order.date}</p>
                        <p className="text-sm text-stone-500 dark:text-slate-400 mt-1 uppercase">Payment: {order.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Delivered To</p>
                        <p className="font-bold text-black dark:text-white">{order.userName}</p>
                        <p className="text-sm text-stone-500 dark:text-slate-400 mt-1 max-w-[150px] leading-relaxed">{order.address}</p>
                    </div>
                </div>

                <table className="w-full text-left mb-6">
                    <thead>
                        <tr className="border-b border-stone-200 dark:border-slate-700 text-stone-400 text-xs uppercase tracking-wider">
                            <th className="py-2 pb-3 font-bold">Item</th>
                            <th className="py-2 pb-3 text-center font-bold">Qty</th>
                            <th className="py-2 pb-3 text-right font-bold">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-slate-700/50">
                        {order.items?.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-4 text-sm">
                                    <p className="font-bold text-black dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-stone-500 font-medium uppercase mt-0.5">By {item.farmerName}</p>
                                </td>
                                <td className="py-4 text-center text-sm font-bold text-stone-600 dark:text-slate-300">{item.quantity || 1}</td>
                                <td className="py-4 text-right font-black text-sm text-black dark:text-white">₹{parseInt(item.price) * (item.quantity || 1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t-2 border-stone-800 dark:border-slate-300 pt-6 flex justify-between items-center mb-8">
                    <span className="text-lg font-black text-black dark:text-white">Total Paid</span>
                    <span className="text-3xl font-black text-green-700 dark:text-green-500">₹{order.total}</span>
                </div>

                <div className="text-center bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-6 print:border print:border-stone-200 print:bg-transparent">
                    <p className="text-green-800 dark:text-green-400 font-bold text-sm">Thank you for supporting local farmers!</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                    <Button variant="outline" onClick={onClose} className="flex-1 py-3">Close</Button>
                    <Button variant="secondary" onClick={handleDownload} className="flex-1 py-3 flex items-center justify-center gap-2 shadow-none bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white">
                        <Download size={18} /> Download
                    </Button>
                    <Button onClick={handlePrint} className="flex-1 py-3 flex items-center justify-center gap-2">
                        <FileText size={18} /> Print
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
