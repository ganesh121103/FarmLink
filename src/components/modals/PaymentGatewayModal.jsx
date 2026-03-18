import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Banknote, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Landmark, Wallet, ScanLine } from '../ui/CustomIcons';
import { useAppContext } from '../../context/AppContext';

const PaymentGatewayModal = ({ isCheckoutOpen, setIsCheckoutOpen, handlePlaceOrder, cartTotal }) => {
    const { t, addToast } = useAppContext();
    const [step, setStep] = useState(1);
    const [details, setDetails] = useState({ address: '', paymentMethod: 'upi' });

    if (!isCheckoutOpen) return null;

    const processPayment = () => {
        if (!details.address.trim()) { addToast(t('enterAddress')); return; }
        setStep(2);
        setTimeout(async () => {
            await handlePlaceOrder(details);
            setStep(1);
            setDetails({ ...details, paymentMethod: 'upi' });
        }, 2500);
    };

    const PaymentOption = ({ id, icon: Icon, title, children }) => {
        const isSelected = details.paymentMethod === id;
        return (
            <div className={`border ${isSelected ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-stone-200 dark:border-slate-700'} rounded-lg mb-3 overflow-hidden transition-colors`}>
                <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-slate-700/50"
                    onClick={() => setDetails({ ...details, paymentMethod: id })}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-green-600' : 'border-stone-400'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                    </div>
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Icon size={20} />
                    </div>
                    <span className={`font-bold text-sm ${isSelected ? 'text-green-800 dark:text-green-400' : 'text-stone-700 dark:text-slate-300'}`}>{title}</span>
                </div>
                <div className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${isSelected ? 'max-h-[400px] opacity-100 border-t border-stone-200 dark:border-slate-700' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 bg-white dark:bg-slate-800">
                        {children}
                        <Button onClick={processPayment} className="w-full mt-5 py-3.5 text-base shadow-lg">
                            Pay ₹{cartTotal}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => step === 1 && setIsCheckoutOpen(false)} />

            {step === 1 && (
                <div className="bg-stone-50 dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col md:flex-row" role="dialog" aria-modal="true">
                    <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 p-2 z-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close"><X size={20} /></button>

                    <div className="w-full md:w-2/5 bg-white dark:bg-slate-800 p-6 md:p-8 border-b md:border-b-0 md:border-r border-stone-200 dark:border-slate-700 flex flex-col">
                        <h2 className="text-2xl font-black mb-6 text-black dark:text-white">Order Summary</h2>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex justify-between items-center border border-green-100 dark:border-green-900/30 mb-8">
                            <span className="font-bold text-green-800 dark:text-green-400">Total Amount</span>
                            <span className="text-2xl font-black text-green-700 dark:text-green-500">₹{cartTotal}</span>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-bold text-stone-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">Delivery Address</label>
                            <textarea className="w-full border border-stone-300 dark:border-slate-600 p-4 rounded-xl bg-stone-50 dark:bg-slate-900 text-black dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-inner resize-none" rows="4" placeholder="Enter complete address (House No, Street, Landmark, Pincode)..." value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} />
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-xs text-stone-400 font-medium">
                            <ShieldCheck size={16} className="text-green-600" />
                            100% Safe and Secure Payments
                        </div>
                    </div>

                    <div className="w-full md:w-3/5 p-6 md:p-8 bg-stone-50 dark:bg-slate-900">
                        <h2 className="text-lg font-bold mb-4 text-stone-800 dark:text-slate-200 uppercase tracking-wider">Payment Options</h2>

                        <PaymentOption id="upi" icon={ScanLine} title="UPI (Google Pay, PhonePe, Paytm)">
                            <div className="space-y-3">
                                <p className="text-sm text-stone-500 dark:text-slate-400 mb-2">Enter your UPI ID to receive a payment request.</p>
                                <Input placeholder="example@okhdfcbank" />
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">Google Pay</Badge>
                                    <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">PhonePe</Badge>
                                    <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">Paytm</Badge>
                                </div>
                            </div>
                        </PaymentOption>

                        <PaymentOption id="wallets" icon={Wallet} title="Wallets">
                            <select className="w-full px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 dark:bg-slate-900 text-sm font-medium cursor-pointer">
                                <option>Paytm Wallet</option><option>Amazon Pay</option><option>PhonePe Wallet</option><option>MobiKwik</option>
                            </select>
                        </PaymentOption>

                        <PaymentOption id="card" icon={CreditCard} title="Credit / Debit / ATM Card">
                            <div className="space-y-4">
                                <Input placeholder="Card Number (XXXX XXXX XXXX XXXX)" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="Valid Thru (MM/YY)" />
                                    <Input placeholder="CVV" type="password" />
                                </div>
                            </div>
                        </PaymentOption>

                        <PaymentOption id="netbanking" icon={Landmark} title="Net Banking">
                            <select className="w-full px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 dark:bg-slate-900 text-sm font-medium cursor-pointer">
                                <option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option>
                            </select>
                        </PaymentOption>

                        <PaymentOption id="cod" icon={Banknote} title="Cash on Delivery">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex gap-3">
                                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
                                <p className="text-sm text-yellow-800 dark:text-yellow-500 font-medium">You can pay via Cash or UPI when the order is delivered to your doorstep.</p>
                            </div>
                        </PaymentOption>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white dark:bg-slate-800 w-full max-w-md p-10 rounded-2xl shadow-2xl relative z-10 flex flex-col items-center text-center animate-fade-in-up">
                    <div className="w-16 h-16 border-4 border-stone-100 dark:border-slate-700 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin mb-6" />
                    <h3 className="text-2xl font-black text-black dark:text-white mb-2">Processing Payment</h3>
                    <p className="text-stone-500 dark:text-slate-400 text-sm font-medium">Please do not close this window or press back.</p>
                    <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                        <Shield size={16} className="text-green-600" />
                        <span className="text-xs uppercase tracking-widest font-bold">Secured via MockPay</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentGatewayModal;
