import React, { useState, useCallback } from 'react';
import {
  X, ShieldCheck, CreditCard, Banknote, AlertTriangle, Shield,
  CheckCircle, XCircle, RefreshCw, Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Landmark, Wallet, ScanLine } from '../ui/CustomIcons';
import { useAppContext } from '../../context/AppContext';
import { apiCall } from '../../api/apiCall';

/* ──────────────────────────────────────────────────────────────────
   Dynamically load the Razorpay checkout script (only once)
   ────────────────────────────────────────────────────────────────── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ──────────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────────── */
const PaymentGatewayModal = ({ isCheckoutOpen, setIsCheckoutOpen, handlePlaceOrder, cartTotal }) => {
  const { user, navigate, t, addToast, cart } = useAppContext();

  // step: 1 = form | 2 = processing | 3 = success | 4 = failed
  const [step, setStep] = useState(1);
  const [details, setDetails]     = useState({ address: '', paymentMethod: 'upi' });
  const [errorMsg, setErrorMsg]   = useState('');
  const [paidOrder, setPaidOrder] = useState(null);

  const resetModal = () => {
    setStep(1);
    setErrorMsg('');
    setPaidOrder(null);
    setDetails({ address: '', paymentMethod: 'upi' });
  };

  /* ── COD path (unchanged behaviour) ─────────────────────────────── */
  const handleCOD = async () => {
    if (!details.address.trim()) {
      addToast(t('enterAddress') || 'Please enter delivery address');
      return;
    }
    if (!user) { addToast('Please login first'); navigate('login'); return; }
    setStep(2);
    await handlePlaceOrder({ ...details, paymentMethod: 'cod', paymentStatus: 'cod' });
    setIsCheckoutOpen(false);
    resetModal();
  };

  /* ── Razorpay online payment path ────────────────────────────────── */
  const handleOnlinePay = useCallback(async () => {
    if (!details.address.trim()) {
      addToast(t('enterAddress') || 'Please enter delivery address');
      return;
    }
    if (!user) { addToast('Please login to complete payment'); navigate('login'); return; }

    setStep(2);
    setErrorMsg('');

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Could not load Razorpay. Check your internet connection.');

      // 2. Create Razorpay order on backend
      const { data: orderData } = await apiCall('/payment/create-order', 'POST', {
        amount: cartTotal,
      });

      // 3. Razorpay checkout options
      const options = {
        key:           orderData.key,
        amount:        orderData.amount,        // paise
        currency:      orderData.currency,
        name:          'FarmLink',
        description:   'Fresh from Farm to you',
        image:         'https://api.dicebear.com/7.x/shapes/svg?seed=FarmLink&backgroundColor=16a34a', // Using a public avatar so CORS loopback doesn't fail
        order_id:      orderData.razorpayOrderId,
        prefill: {
          name:  user.name  || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: () => {
            setStep(4);
            setErrorMsg('Payment was cancelled. You can try again.');
          },
        },

        /* ── Success handler ─────────────────────────────────────── */
        handler: async (response) => {
          try {
            const cartTotal = cart.reduce(
              (s, i) => s + parseInt(i.price) * i.quantity, 0
            );
            const orderItems = cart.map(item => ({
              productId:  item._id,
              name:       item.name || 'Product',
              price:      item.price || 0,
              quantity:   item.quantity || 1,
              farmerName: item.farmerName || 'FarmLink Farmers',
              farmer:     (item.farmer && item.farmer._id) ? item.farmer._id : (item.farmer || item._id),
              image:      item.images?.[0] || item.image || '',
            }));

            // 4. Verify signature + create order in MongoDB
            const { data } = await apiCall('/payment/verify', 'POST', {
              razorpayOrderId:   orderData.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items:         orderItems,
              address:       details.address,
              paymentMethod: details.paymentMethod,
              total:         cartTotal,
              userName:      user.name || 'Customer',
            });

            setPaidOrder(data.order);
            setStep(3);

            // Clear cart & update parent orders list
            document.dispatchEvent(new CustomEvent('clear-cart'));
            if (handlePlaceOrder) {
              // notify parent without re-creating the order (pass null to skip API call)
              await handlePlaceOrder(null, data.order);
            }
          } catch (verifyErr) {
            setStep(4);
            setErrorMsg(
              verifyErr.message ||
              'Payment was captured but verification failed. Please contact support with your payment ID: ' +
              response.razorpay_payment_id
            );
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setStep(4);
        setErrorMsg(resp?.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setStep(4);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  }, [details, user, cartTotal, cart, navigate, addToast, t, handlePlaceOrder]);

  /* ── Payment option card ─────────────────────────────────────────── */
  const PaymentOption = ({ id, icon: Icon, title, children, onPayClick, isCod }) => {
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
        <div className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${isSelected ? 'max-h-[300px] opacity-100 border-t border-stone-200 dark:border-slate-700' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 bg-white dark:bg-slate-800">
            {children}
            {isCod ? (
              <Button onClick={handleCOD} className="w-full mt-5 py-3.5 text-base shadow-lg bg-amber-500 hover:bg-amber-600">
                Confirm Order (Pay on Delivery)
              </Button>
            ) : (
              <Button onClick={handleOnlinePay} className="w-full mt-5 py-3.5 text-base shadow-lg" id={`pay-btn-${id}`}>
                Pay ₹{cartTotal} with Razorpay
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── STEP 1: Payment Form ──────────────────────────────────────── */
  const StepForm = () => (
    <div className="bg-stone-50 dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col md:flex-row" role="dialog" aria-modal="true">
      <button
        onClick={() => { setIsCheckoutOpen(false); resetModal(); }}
        className="absolute top-4 right-4 p-2 z-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* Left panel — Order summary */}
      <div className="w-full md:w-2/5 bg-white dark:bg-slate-800 p-6 md:p-8 border-b md:border-b-0 md:border-r border-stone-200 dark:border-slate-700 flex flex-col">
        <h2 className="text-2xl font-black mb-6 text-black dark:text-white">Order Summary</h2>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex justify-between items-center border border-green-100 dark:border-green-900/30 mb-6">
          <span className="font-bold text-green-800 dark:text-green-400">Total Amount</span>
          <span className="text-2xl font-black text-green-700 dark:text-green-500">₹{cartTotal}</span>
        </div>

        {/* Cart items preview */}
        {cart.length > 0 && (
          <div className="mb-6 space-y-2 max-h-36 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item._id} className="flex items-center gap-3 text-sm">
                <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                <span className="font-medium text-stone-700 dark:text-slate-300 flex-1 truncate">{item.name}</span>
                <span className="font-bold text-stone-500 text-xs">x{item.quantity}</span>
                <span className="font-black text-green-700 dark:text-green-400 text-xs">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1">
          <label className="text-sm font-bold text-stone-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">
            Delivery Address <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-stone-300 dark:border-slate-600 p-4 rounded-xl bg-stone-50 dark:bg-slate-900 text-black dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-inner resize-none"
            rows="4"
            placeholder="House No, Street, Landmark, Pincode..."
            value={details.address}
            onChange={(e) => setDetails({ ...details, address: e.target.value })}
          />
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
            <ShieldCheck size={14} className="text-green-600" />
            Payments secured via Razorpay
          </div>
          <div className="flex items-center gap-3">
            <img src="https://razorpay.com/favicon.ico" alt="Razorpay" className="w-4 h-4" />
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Powered by Razorpay</span>
          </div>
        </div>
      </div>

      {/* Right panel — Payment options */}
      <div className="w-full md:w-3/5 p-6 md:p-8 bg-stone-50 dark:bg-slate-900">
        <h2 className="text-lg font-bold mb-4 text-stone-800 dark:text-slate-200 uppercase tracking-wider">Payment Options</h2>

        {PaymentOption({ id: "upi", icon: ScanLine, title: "UPI (Google Pay, PhonePe, Paytm)", children: (
          <div className="space-y-3">
            <p className="text-sm text-stone-500 dark:text-slate-400">
              Razorpay will launch your UPI app securely.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">Google Pay</Badge>
              <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">PhonePe</Badge>
              <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">Paytm</Badge>
              <Badge color="bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">BHIM</Badge>
            </div>
          </div>
        )})}

        {PaymentOption({ id: "card", icon: CreditCard, title: "Credit / Debit Card", children: (
          <div className="space-y-2">
            <p className="text-sm text-stone-500 dark:text-slate-400">
              All major cards accepted — Visa, Mastercard, RuPay.
            </p>
            <p className="text-xs text-green-600 font-medium">🔒 3D Secure — bank-verified checkout</p>
          </div>
        )})}

        {PaymentOption({ id: "wallets", icon: Wallet, title: "Wallets", children: (
          <div className="space-y-2">
            <p className="text-sm text-stone-500 dark:text-slate-400">
              Paytm Wallet, Amazon Pay, PhonePe Wallet, Mobikwik & more.
            </p>
          </div>
        )})}

        {PaymentOption({ id: "netbanking", icon: Landmark, title: "Net Banking", children: (
          <div className="space-y-2">
            <p className="text-sm text-stone-500 dark:text-slate-400">
              50+ banks supported — SBI, HDFC, ICICI, Axis & more.
            </p>
          </div>
        )})}

        {PaymentOption({ id: "cod", icon: Banknote, title: "Cash on Delivery", isCod: true, children: (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg flex gap-3">
            <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-500 font-medium">
              Pay via Cash or UPI when your order arrives at your doorstep.
            </p>
          </div>
        )})}
      </div>
    </div>
  );

  /* ── STEP 2: Processing ──────────────────────────────────────────── */
  const StepProcessing = () => (
    <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-10 rounded-2xl shadow-2xl relative z-10 flex flex-col items-center text-center animate-fade-in-up">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
          <Loader2 size={40} className="text-green-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-black dark:text-white mb-2">Opening Razorpay…</h3>
      <p className="text-stone-500 dark:text-slate-400 text-sm font-medium">Please complete the payment in the Razorpay window.</p>
      <div className="mt-8 flex items-center justify-center gap-2 opacity-60">
        <Shield size={14} className="text-green-600" />
        <span className="text-xs uppercase tracking-widest font-bold">Secured by Razorpay</span>
      </div>
    </div>
  );

  /* ── STEP 3: Success ─────────────────────────────────────────────── */
  const StepSuccess = () => (
    <div className="bg-white dark:bg-slate-800 w-full max-w-md p-10 rounded-2xl shadow-2xl relative z-10 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={44} className="text-green-500" />
      </div>
      <h3 className="text-2xl font-black text-black dark:text-white mb-1">Payment Successful! 🎉</h3>
      {paidOrder && (
        <p className="text-stone-500 dark:text-slate-400 text-sm mt-1 mb-4">
          Order #{paidOrder._id?.slice(-6).toUpperCase()} placed for <span className="font-black text-green-700 dark:text-green-400">₹{paidOrder.total}</span>
        </p>
      )}
      <div className="w-full bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800 rounded-xl p-4 text-left mb-6 space-y-1">
        {paidOrder?.razorpayPaymentId && (
          <p className="text-xs text-stone-600 dark:text-slate-300"><span className="font-bold text-stone-800 dark:text-white">Payment ID:</span> {paidOrder.razorpayPaymentId}</p>
        )}
        <p className="text-xs text-stone-600 dark:text-slate-300"><span className="font-bold text-stone-800 dark:text-white">Status:</span> <span className="text-green-600 dark:text-green-400 font-bold">PAID ✓</span></p>
        <p className="text-xs text-stone-600 dark:text-slate-300"><span className="font-bold text-stone-800 dark:text-white">Delivery to:</span> {paidOrder?.address?.substring(0, 50)}{paidOrder?.address?.length > 50 ? '...' : ''}</p>
      </div>
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => { 
            setIsCheckoutOpen(false); 
            resetModal(); 
            document.dispatchEvent(new CustomEvent('open-orders-tab'));
            navigate('activity'); 
          }}
        >
          Track Order
        </Button>
        <Button
          className="flex-1"
          onClick={() => { setIsCheckoutOpen(false); resetModal(); navigate('products'); }}
        >
          Shop More
        </Button>
      </div>
    </div>
  );

  /* ── STEP 4: Failed ──────────────────────────────────────────────── */
  const StepFailed = () => (
    <div className="bg-white dark:bg-slate-800 w-full max-w-md p-10 rounded-2xl shadow-2xl relative z-10 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <XCircle size={44} className="text-red-500" />
      </div>
      <h3 className="text-2xl font-black text-black dark:text-white mb-2">Payment Failed</h3>
      <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 max-w-xs">
        {errorMsg || 'Something went wrong. Your money has NOT been deducted. Please try again.'}
      </p>
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => { setIsCheckoutOpen(false); resetModal(); }}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={() => { setStep(1); setErrorMsg(''); }}
        >
          <RefreshCw size={16} /> Try Again
        </Button>
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────── */
  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={() => { if (step === 1) { setIsCheckoutOpen(false); resetModal(); } }}
      />
      {step === 1 && StepForm()}
      {step === 2 && StepProcessing()}
      {step === 3 && StepSuccess()}
      {step === 4 && StepFailed()}
    </div>
  );
};

export default PaymentGatewayModal;
