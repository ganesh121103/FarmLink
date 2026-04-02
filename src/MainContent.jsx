import React, { useState, useEffect } from 'react';
import { BackButton } from './components/ui/BackButton';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWidget from './components/chat/ChatWidget';
import PaymentGatewayModal from './components/modals/PaymentGatewayModal';
import HomeView from './pages/HomeView';
import AboutView from './pages/AboutView';
import FarmersListView from './pages/FarmersListView';
import ProductsView from './pages/ProductsView';
import CustomerActivityView from './pages/CustomerActivityView';
import ProfileView from './pages/ProfileView';
import AuthView from './pages/AuthView';
import { PrivacyView, TermsView } from './pages/LegalPages';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import { apiCall } from './api/apiCall';
import { useAppContext } from './context/AppContext';
import { mockFarmers, mockInitialProducts as mockProducts } from './constants';

const MainContent = () => {
    const { user, view, history, setHistory, setView, navigate, cart, addToast, t } = useAppContext();

    const [farmers, setFarmers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const fetchFarmers = async () => {
        try {
            const { data } = await apiCall('/farmers');
            setFarmers(data || []);
        } catch {
            setFarmers(mockFarmers);
        } finally {
            setIsLoadingFarmers(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await apiCall('/products');
            setProducts(data || []);
        } catch {
            setProducts(mockProducts);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const fetchOrders = async () => {
        if (!user) { setOrders([]); return; }
        try {
            const { data } = await apiCall('/orders');
            setOrders(data || []);
        } catch {
            setOrders([]);
        }
    };

    useEffect(() => { fetchFarmers(); fetchProducts(); }, []);
    useEffect(() => { fetchOrders(); }, [user]);

    const goBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            setHistory(newHistory);
            setView(newHistory[newHistory.length - 1]);
            window.scrollTo(0, 0);
        } else {
            navigate('home');
        }
    };

    const handlePlaceOrder = async (details) => {
        const cartTotal = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);
        const orderItems = cart.map(item => ({ productId: item._id, name: item.name, price: item.price, quantity: item.quantity, farmerName: item.farmerName, farmer: item.farmer, image: item.images?.[0] || item.image }));
        const orderPayload = { items: orderItems, total: cartTotal, address: details.address, paymentMethod: details.paymentMethod, userId: user._id, userName: user.name || 'Customer' };
        try {
            const { data } = await apiCall('/orders', 'POST', orderPayload);
            setOrders(prev => [data, ...prev]);
        } catch {
            const localOrder = { _id: `ord_${Date.now()}`, status: 'Placed', date: new Date().toLocaleDateString(), ...orderPayload };
            setOrders(prev => [localOrder, ...prev]);
        }
        setIsCheckoutOpen(false);
        document.dispatchEvent(new CustomEvent('clear-cart'));
    };

    const BackBtn = () => <BackButton onClick={goBack} />;

    return (
        <>
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} setSelectedFarmer={setSelectedFarmer} />
            <PaymentGatewayModal
                isCheckoutOpen={isCheckoutOpen}
                setIsCheckoutOpen={setIsCheckoutOpen}
                handlePlaceOrder={handlePlaceOrder}
                cartTotal={cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0)}
            />
            <ChatWidget />

            <main className="flex-grow">
                {view === 'home' && <HomeView />}
                {view === 'about' && <AboutView BackBtn={BackBtn} farmers={farmers} setSelectedFarmer={setSelectedFarmer} />}
                {view === 'farmers' && <FarmersListView BackBtn={BackBtn} farmers={farmers} products={products} setSelectedFarmer={setSelectedFarmer} isLoading={isLoadingFarmers} />}
                {view === 'products' && (
                    <ProductsView
                        selectedFarmer={null}
                        filterByLocation={null}
                        showBack={true}
                        BackBtn={BackBtn}
                        farmers={farmers}
                        products={products}
                        setProducts={setProducts}
                        isLoading={isLoadingProducts}
                    />
                )}
                {view === 'farmer-details' && (
                    <ProductsView
                        selectedFarmer={selectedFarmer}
                        filterByLocation={null}
                        showBack={true}
                        BackBtn={BackBtn}
                        farmers={farmers}
                        products={products}
                        setProducts={setProducts}
                        isLoading={isLoadingProducts}
                    />
                )}
                {(view === 'login' || view === 'register') && <AuthView initialMode={view} />}
                {view === 'activity' && (!user || user?.role !== 'admin') && (
                    <CustomerActivityView orders={orders} BackBtn={BackBtn} setIsCheckoutOpen={setIsCheckoutOpen} />
                )}
                {view === 'profile' && <ProfileView BackBtn={BackBtn} setFarmers={setFarmers} />}
                {view === 'dashboard' && user?.role === 'farmer' && (
                    <FarmerDashboard products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} />
                )}
                {view === 'dashboard' && user?.role === 'customer' && (
                    <CustomerDashboard orders={orders} BackBtn={BackBtn} setIsCheckoutOpen={setIsCheckoutOpen} />
                )}
                {view === 'dashboard' && user?.role === 'admin' && (
                    <AdminDashboard products={products} setProducts={setProducts} farmers={farmers} orders={orders} setOrders={setOrders} />
                )}
                {view === 'privacy' && <PrivacyView BackBtn={BackBtn} />}
                {view === 'terms' && <TermsView BackBtn={BackBtn} />}
            </main>

            <Footer />
        </>
    );
};

export default MainContent;
