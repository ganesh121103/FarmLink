import React from 'react';
import { X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const TransparencyModal = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) return null;

    // We encode the full specific data needed into the URL payload.
    // This removes the need for the mobile phone to securely connect to your backend!
    const payload = {
        name: product.name,
        farmerName: product.farmerName,
        price: product.price,
        category: product.category,
        farmingType: product.farmingType,
        transparencyInfo: product.transparencyInfo,
        location: product.location,
        organic: product.organic
    };
    
    // Safely encode unicode text like rupees and emojis
    const safeEncodedData = btoa(encodeURIComponent(JSON.stringify(payload)));
    
    // Use the Cloudflare URL established previously
    const qrData = `https://southampton-allocated-handheld-released.trycloudflare.com/?view=transparency-report&data=${safeEncodedData}`;

    const isOrganic = product.farmingType === 'Organic' || product.organic;
    const isInorganic = product.farmingType === 'Inorganic';
    const isSeasonal = product.farmingType === 'Seasonal';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up border border-stone-200 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-center">
                
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 transition z-20"
                >
                    <X size={20} className="text-stone-500" />
                </button>

                {/* Left Side: QR Code Area */}
                <div className="flex-shrink-0 flex flex-col items-center border-r border-stone-100 dark:border-slate-800 pr-0 md:pr-8">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4 shadow-inner">
                        <QrCode size={32} />
                    </div>
                    
                    <h3 className="text-xl font-black text-black dark:text-white mb-2 text-center">Transparency QR</h3>
                    <p className="text-xs font-bold text-stone-500 dark:text-slate-400 mb-6 text-center max-w-[200px]">
                        Scan with mobile to save this report directly to your phone.
                    </p>

                    <div className="p-3 border-4 border-stone-100 dark:border-slate-800 rounded-2xl bg-white shadow-sm inline-block">
                        <QRCodeSVG value={qrData} size={180} level="L" includeMargin={false} />
                    </div>
                </div>

                {/* Right Side: Impressive UI summary */}
                <div className="flex-1 w-full text-left">
                    <div className="mb-4">
                        <p className="text-xs font-black tracking-widest text-green-600 dark:text-green-400 uppercase mb-1">Certified Report</p>
                        <h2 className="text-3xl font-black text-black dark:text-white leading-tight">{product.name}</h2>
                        <p className="text-stone-500 dark:text-slate-400 font-medium">By {product.farmerName}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isOrganic ? 'bg-green-100 text-green-800 border-green-200' : isInorganic ? 'bg-blue-100 text-blue-800 border-blue-200' : isSeasonal ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-stone-100 text-stone-800 border-stone-200'}`}>
                            {product.farmingType || 'Standard Farming'}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                            ₹{product.price}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                            {product.category}
                        </span>
                    </div>

                    <div className="bg-stone-50 dark:bg-slate-800/50 p-4 rounded-xl border border-stone-100 dark:border-slate-700">
                        <h5 className="font-bold text-sm text-stone-900 dark:text-white mb-2">Manufacturing & Pesticide Info</h5>
                        <p className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {product.transparencyInfo || 'No explicit details provided by the farmer for this product.'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TransparencyModal;
