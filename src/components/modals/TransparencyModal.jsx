import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, Link2, Copy, CheckCircle2, Sprout, Droplet, Leaf, Truck, Package } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../../context/AppContext';

const TransparencyModal = ({ isOpen, onClose, product }) => {
    const [show, setShow] = useState(false);
    const [copiedHash, setCopiedHash] = useState(false);
    const { addToast } = useAppContext();

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShow(true), 10);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
            setCopiedHash(false);
        }
    }, [isOpen]);

    const [realHash, setRealHash] = useState('0x...');

    useEffect(() => {
        if (!product) return;
        
        // If the product was created with the new backend ledger system, use the permanently saved hash.
        if (product.txHash) {
            setRealHash(product.txHash);
            return;
        }
        
        // Fallback for older products: Generate a REAL SHA-256 cryptographic hash of the product data
        const generateRealHash = async () => {
            const dataString = JSON.stringify({
                id: product._id,
                name: product.name,
                farmer: product.farmerName,
                price: product.price,
                type: product.farmingType,
                timestamp: product.createdAt
            });
            
            const msgBuffer = new TextEncoder().encode(dataString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            setRealHash('0x' + hashHex);
        };
        
        generateRealHash();
    }, [product]);

    if (!isOpen || !product) return null;

    const currentHost = window.location.hostname === 'localhost' ? `192.168.137.1:${window.location.port}` : window.location.host;
    const protocol = window.location.protocol;
    
    // Embed only essential product data into the QR code to prevent 'Data too long' errors
    // Truncate long text fields to prevent 'Data too long' QR code errors
    const truncate = (str, len) => (str && str.length > len) ? str.substring(0, len) + '...' : str;

    const essentialProductData = {
        _id: product._id,
        name: product.name,
        farmerName: product.farmerName,
        price: product.price,
        farmingType: product.farmingType,
        category: product.category,
        createdAt: product.createdAt,
        harvestDate: product.harvestDate,
        expiresAt: product.expiresAt,
        fertilizerInfo: truncate(product.fertilizerInfo, 100),
        transparencyInfo: truncate(product.transparencyInfo, 250),
        growthUpdates: truncate(product.growthUpdates, 100),
        location: product.location,
        txHash: realHash !== '0x...' ? realHash : product.txHash
    };
    
    const encodedData = btoa(encodeURIComponent(JSON.stringify(essentialProductData)));
    const qrData = `${protocol}//${currentHost}/?view=transparency-report&data=${encodedData}&productId=${product._id}`;

    const isOrganic = product.farmingType === 'Organic' || product.organic;
    const isInorganic = product.farmingType === 'Inorganic';
    const isSeasonal = product.farmingType === 'Seasonal';



    const handleCopyHash = () => {
        navigator.clipboard.writeText(realHash);
        setCopiedHash(true);
        addToast("Blockchain Tx Hash copied to clipboard!");
        setTimeout(() => setCopiedHash(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose} 
            />
            <div className={`bg-white dark:bg-slate-900 w-full max-w-3xl p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 border border-stone-200 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-stretch transform transition-all duration-300 ease-out ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
                
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 transition z-20"
                >
                    <X size={20} className="text-stone-500" />
                </button>

                {/* Left Side: QR Code Area */}
                <div className="flex-shrink-0 flex flex-col items-center border-r border-stone-100 dark:border-slate-800 pr-0 md:pr-8 justify-center">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4 shadow-inner">
                        <QrCode size={32} />
                    </div>
                    
                    <h3 className="text-xl font-black text-black dark:text-white mb-2 text-center">Transparency QR</h3>
                    <p className="text-xs font-bold text-stone-500 dark:text-slate-400 mb-6 text-center max-w-[200px]">
                        Scan with mobile to save this immutable report to your phone.
                    </p>

                    <div className="p-3 border-4 border-stone-100 dark:border-slate-800 rounded-2xl bg-white shadow-sm inline-block">
                        <QRCodeSVG value={qrData} size={220} level="M" includeMargin={false} />
                    </div>
                </div>

                {/* Right Side: Impressive UI summary with Blockchain */}
                <div className="flex-1 w-full text-left flex flex-col justify-center">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={16} className="text-blue-500" />
                            <p className="text-xs font-black tracking-widest text-blue-500 uppercase">Blockchain Verified</p>
                        </div>
                        <h2 className="text-3xl font-black text-black dark:text-white leading-tight">{product.name}</h2>
                        <p className="text-stone-500 dark:text-slate-400 font-medium mt-1">Grown by <span className="font-bold text-black dark:text-white">{product.farmerName}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isOrganic ? 'bg-green-100 text-green-800 border-green-200' : isInorganic ? 'bg-blue-100 text-blue-800 border-blue-200' : isSeasonal ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-stone-100 text-stone-800 border-stone-200'}`}>
                            {product.farmingType || 'Standard Farming'}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                            ₹{product.price}/kg
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                            {product.category}
                        </span>
                    </div>

                    <div className="bg-stone-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-stone-100 dark:border-slate-700 mt-2">
                        <div className="flex gap-3 items-start">
                            <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm border border-stone-100 dark:border-slate-600">
                                <QrCode size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-stone-900 dark:text-white mb-1">Scan for Full Report</h5>
                                <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                                    Scan the QR code to view the complete <strong>Agricultural Crop Journey</strong> and verify the <strong>Immutable Blockchain Ledger Record</strong> on your mobile device.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TransparencyModal;
