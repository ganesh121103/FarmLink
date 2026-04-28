import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Users, Package, Sprout, Sparkles, X, FileText, CheckCircle, Clock, BadgeCheck, Search, Calendar, AlertTriangle, CreditCard, IndianRupee, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import AdminDocumentReviewModal from '../../components/modals/AdminDocumentReviewModal';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import { apiCall } from '../../api/apiCall';
import { useAppContext } from '../../context/AppContext';

const AdminDashboard = ({ products, setProducts, farmers, orders, setOrders }) => {
    const { addToast, t } = useAppContext();
    const [activeTab, setActiveTab] = useState('overview');
    const [userFilter, setUserFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [reviewingUser, setReviewingUser] = useState(null);
    const [previewProduct, setPreviewProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    // ── Payments tab state ──────────────────────────────────────────
    const [payments, setPayments] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState(null);
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [refundingId, setRefundingId] = useState(null);
    // ───────────────────────────────────────────────────────────────

    // Fetch all users (customers + admins)
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const { data } = await apiCall('/users');
                setAllUsers(data);
            } catch {
                const mockCustomers = [
                    { _id: 'c1', name: 'Amit Patel', email: 'amit.p@gmail.com', role: 'customer', location: 'Pune', status: 'Active' },
                    { _id: 'c2', name: 'Neha Sharma', email: 'neha.s@yahoo.com', role: 'customer', location: 'Mumbai', status: 'Active' },
                ];
                const enrichedFarmers = (farmers || []).map(f => ({ ...f, role: 'farmer', status: 'Active' }));
                setAllUsers([...enrichedFarmers, ...mockCustomers]);
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchAllUsers();
    }, []);

    // Fetch all farmers (including verificationStatus + documents)
    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const { data } = await apiCall('/farmers');
                setAllFarmers(data);
            } catch {
                // Fallback to prop farmers
                setAllFarmers((farmers || []).map(f => ({ ...f, role: 'farmer' })));
            }
        };
        fetchFarmers();
    }, []);

    // Fetch payment transactions (admin only)
    const fetchPayments = async (statusFilter = 'all') => {
        setIsLoadingPayments(true);
        try {
            const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const { data } = await apiCall(`/payment/transactions${query}`);
            setPayments(data.orders || []);
            setPaymentSummary(data.summary || null);
        } catch (err) {
            addToast('Failed to load payment data');
        } finally {
            setIsLoadingPayments(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'payments') fetchPayments(paymentFilter);
    }, [activeTab]);

    const handlePaymentFilterChange = (f) => {
        setPaymentFilter(f);
        fetchPayments(f);
    };

    const handleRefund = async (order) => {
        if (!window.confirm(`Refund ₹${order.total} for order #${order._id?.slice(-6).toUpperCase()}?`)) return;
        setRefundingId(order._id);
        try {
            await apiCall('/payment/refund', 'POST', { orderId: order._id });
            addToast('✅ Refund issued successfully');
            fetchPayments(paymentFilter);
        } catch (err) {
            addToast(err.message || 'Refund failed');
        } finally {
            setRefundingId(null);
        }
    };

    // Merge allFarmers into allUsers for the Manage Users tab
    const mergedUsers = useMemo(() => {
        const farmerEmails = new Set(allFarmers.map(f => f.email));
        const nonFarmerUsers = allUsers.filter(u => !farmerEmails.has(u.email));
        return [...allFarmers, ...nonFarmerUsers];
    }, [allUsers, allFarmers]);

    // Pending verifications
    const pendingVerifications = useMemo(
        () => allFarmers.filter(f => f.verificationStatus === 'Pending'),
        [allFarmers]
    );

    const insights = useMemo(() => {
        const cat = {};
        products.forEach(p => { cat[p.category] = (cat[p.category] || 0) + 1; });
        const topCat = Object.keys(cat).length > 0 ? Object.keys(cat).reduce((a, b) => cat[a] > cat[b] ? a : b) : 'Produce';
        const topCatPct = products.length ? Math.round((cat[topCat] / products.length) * 100) : 0;
        const locCounts = {};
        mergedUsers.forEach(u => { if (u.location) locCounts[u.location] = (locCounts[u.location] || 0) + 1; });
        const topLoc = Object.keys(locCounts).length > 0 ? Object.keys(locCounts).reduce((a, b) => locCounts[a] > locCounts[b] ? a : b) : 'Local';
        return [
            { id: 1, title: `High Demand: ${topCat}`, desc: `${topCat} accounts for ${topCatPct}% of listings. Consider notifying farmers to stock more.`, color: "text-yellow-400" },
            { id: 2, title: "Farmer Retention", desc: "Farmers using AI Crop Scanner have 3x higher 30-day retention. Promote the feature.", color: "text-green-400" },
            { id: 3, title: "Logistics Alert", desc: `Average delivery in ${topLoc} increased by 1.2h. Flagged for review.`, color: "text-red-400" },
        ];
    }, [products, mergedUsers]);

    const handleVerifyUser = async (id, approve) => {
        try {
            await apiCall(`/farmers/${id}/verify`, 'PUT', { approve });
            const updated = { verified: approve, verificationStatus: approve ? 'Verified' : 'Rejected' };
            setAllFarmers(prev => prev.map(u => u._id === id ? { ...u, ...updated } : u));
            setAllUsers(prev => prev.map(u => u._id === id ? { ...u, ...updated } : u));
            addToast(approve ? "✅ Farmer Verified!" : "❌ Verification Rejected");
            setReviewingUser(null);
        } catch (error) {
            addToast(error.message || "Failed to update verification status");
        }
    };

    const handleDeleteProduct = (id) => { setProducts(prev => prev.filter(p => p._id !== id)); addToast(t('productDeleted')); };
    const handleSuspendUser = (id) => {
        setAllUsers(prev => prev.map(u => u._id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
        addToast("User status updated");
    };

    const tabClass = (tab) => `py-3 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-purple-600 text-purple-700 dark:text-purple-400' : 'border-transparent text-stone-500 hover:text-black dark:hover:text-white'}`;

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-black dark:text-white">
                        <Shield className="text-purple-600" /> {t('adminDashboard')}
                    </h1>
                    <p className="text-stone-500 mt-2 font-medium">Platform Overview & Management</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-stone-200 dark:border-slate-700 overflow-x-auto pb-1">
                <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>Overview & Stats</button>
                <button onClick={() => setActiveTab('verifications')} className={`${tabClass('verifications')} flex items-center gap-2`}>
                    Verifications
                    {pendingVerifications.length > 0 && (
                        <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center px-1 animate-pulse">
                            {pendingVerifications.length}
                        </span>
                    )}
                </button>
                <button onClick={() => setActiveTab('users')} className={`${tabClass('users')} flex items-center gap-2`}>
                    {t('manageUsers')} ({mergedUsers.length})
                </button>
                <button onClick={() => setActiveTab('products')} className={tabClass('products')}>{t('manageProducts')} ({products.length})</button>
                <button onClick={() => setActiveTab('orders')} className={tabClass('orders')}>Orders ({orders?.length || 0})</button>
                <button onClick={() => setActiveTab('payments')} className={`${tabClass('payments')} flex items-center gap-2`}>
                    <CreditCard size={15} /> Payments
                </button>
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card onClick={() => { setActiveTab('users'); setUserFilter('customer'); }} className="p-6 flex items-center gap-5 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"><div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl text-purple-600"><Users size={28} /></div><div><p className="text-xs font-bold uppercase mb-1 text-stone-500">{t('totalUsers')}</p><p className="text-3xl font-black text-black dark:text-white">{mergedUsers.length}</p></div></Card>
                        <Card onClick={() => { setActiveTab('users'); setUserFilter('farmer'); }} className="p-6 flex items-center gap-5 border-l-4 border-l-green-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"><div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl text-green-600"><Sprout size={28} /></div><div><p className="text-xs font-bold uppercase mb-1 text-stone-500">{t('farmers')}</p><p className="text-3xl font-black text-black dark:text-white">{allFarmers.length}</p></div></Card>
                        <Card onClick={() => setActiveTab('verifications')} className="p-6 flex items-center gap-5 border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"><div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl text-yellow-600"><Clock size={28} /></div><div><p className="text-xs font-bold uppercase mb-1 text-stone-500">Pending Reviews</p><p className="text-3xl font-black text-black dark:text-white">{pendingVerifications.length}</p></div></Card>
                        <Card onClick={() => setActiveTab('products')} className="p-6 flex items-center gap-5 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"><div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl text-blue-600"><Package size={28} /></div><div><p className="text-xs font-bold uppercase mb-1 text-stone-500">{t('activeProducts')}</p><p className="text-3xl font-black text-black dark:text-white">{products.length}</p></div></Card>
                    </div>

                    {/* Pending verifications quick-access */}
                    {pendingVerifications.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-5">
                            <h3 className="font-black text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                                <Clock size={18} /> {pendingVerifications.length} Farmer(s) Awaiting Verification
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {pendingVerifications.map(f => (
                                    <button key={f._id}
                                        onClick={() => { setReviewingUser(f); }}
                                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-2 text-sm font-bold text-amber-800 dark:text-amber-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-stone-900 dark:bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <h3 className="text-2xl font-bold mb-2 relative z-10 flex items-center gap-2"><Sparkles className="text-purple-400" /> AI Platform Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mt-4">
                            {insights.map(i => (
                                <div key={i.id} className="bg-white/10 border border-white/20 p-5 rounded-2xl">
                                    <h4 className={`font-bold mb-2 ${i.color}`}>{i.title}</h4>
                                    <p className="text-sm text-stone-300">{i.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
                <div className="animate-fade-in-up space-y-4">
                    {allFarmers.filter(f => f.verificationStatus === 'Pending' || f.documents?.idProof).length === 0 ? (
                        <div className="text-center py-16 text-stone-400">
                            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                            <p className="font-bold text-lg">No pending verifications</p>
                            <p className="text-sm mt-1">All farmer verification requests will appear here.</p>
                        </div>
                    ) : (
                        allFarmers
                            .filter(f => f.verificationStatus === 'Pending' || f.documents?.idProof)
                            .map(farmer => (
                                <div key={farmer._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-black text-lg">
                                            {farmer.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-black dark:text-white">{farmer.name}</p>
                                            <p className="text-xs text-stone-500">{farmer.email}</p>
                                            <p className="text-xs text-stone-400 mt-0.5">{farmer.location || farmer.address || 'Location not set'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {farmer.verificationStatus === 'Pending' && (
                                            <Badge color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                ⏳ Pending Review
                                            </Badge>
                                        )}
                                        {farmer.verificationStatus === 'Verified' && (
                                            <Badge color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                ✅ Verified
                                            </Badge>
                                        )}
                                        {farmer.verificationStatus === 'Rejected' && (
                                            <Badge color="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                ❌ Rejected
                                            </Badge>
                                        )}
                                        <Button
                                            className="text-sm py-2 px-4"
                                            variant={farmer.verificationStatus === 'Pending' ? 'primary' : 'outline'}
                                            onClick={() => setReviewingUser(farmer)}
                                        >
                                            {farmer.verificationStatus === 'Pending' ? '🔍 Review Docs' : 'View Docs'}
                                        </Button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}

            {/* MANAGE USERS TAB */}
            {activeTab === 'users' && (
                <div className="animate-fade-in-up flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2">
                            <button onClick={() => setUserFilter('all')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${userFilter === 'all' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>All Users</button>
                            <button onClick={() => setUserFilter('customer')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${userFilter === 'customer' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>Customers & Admins</button>
                            <button onClick={() => setUserFilter('farmer')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${userFilter === 'farmer' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>Farmers</button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-black dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-stone-200 dark:border-slate-700 text-xs uppercase text-stone-400 tracking-wider"><th className="py-3 pr-4">User</th><th className="py-3 pr-4">Role</th><th className="py-3 pr-4">Location</th><th className="py-3 pr-4">Status</th><th className="py-3">Action</th></tr></thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-slate-700/50">
                                {mergedUsers
                                    .filter(u => userFilter === 'all' ? true : userFilter === 'farmer' ? u.role === 'farmer' : u.role !== 'farmer')
                                    .filter(u => userSearch === '' || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                                    .map(user => (
                                <tr key={user._id} className="group">
                                    <td className="py-4 pr-4"><div className="font-bold text-black dark:text-white flex items-center gap-1.5">{user.name} {user.role === 'farmer' && user.verified && <BadgeCheck size={16} className="text-blue-500 fill-blue-50 dark:fill-blue-950" />}</div><p className="text-xs text-stone-500">{user.email}</p></td>
                                    <td className="py-4 pr-4"><Badge color={user.role === 'farmer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400'}>{user.role}</Badge></td>
                                    <td className="py-4 pr-4 text-sm text-stone-600 dark:text-slate-400">{user.location || user.address || 'N/A'}</td>
                                    <td className="py-4 pr-4 text-sm">
                                        {user.verificationStatus === 'Pending'
                                            ? <Badge color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending Review</Badge>
                                            : user.verified || user.verificationStatus === 'Verified'
                                                ? <Badge color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Verified</Badge>
                                                : <Badge color={user.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-600'}>{user.status || 'Active'}</Badge>}
                                    </td>
                                    <td className="py-4">
                                            <div className="flex gap-2 items-center">
                                                {user.role === 'farmer' && (
                                                    <Button 
                                                        className="text-[10px] sm:text-xs py-1 px-2 sm:py-1.5 sm:px-3 whitespace-nowrap" 
                                                        variant={user.verificationStatus === 'Verified' ? 'outline' : 'primary'} 
                                                        onClick={() => handleVerifyUser(user._id, user.verificationStatus !== 'Verified')}
                                                    >
                                                        {user.verificationStatus === 'Verified' ? 'Remove Badge' : 'Give Badge'}
                                                    </Button>
                                                )}
                                                {user.role === 'farmer' && (user.documents?.idProof || user.verificationStatus === 'Pending') && (
                                                    <Button className="text-[10px] sm:text-xs py-1 px-2 sm:py-1.5 sm:px-3 whitespace-nowrap" variant="outline" onClick={() => setReviewingUser(user)}>
                                                        {user.verificationStatus === 'Pending' ? t('reviewDocs') : 'View Docs'}
                                                    </Button>
                                                )}
                                                {user.role !== 'admin' && <button onClick={() => handleSuspendUser(user._id)} className={`text-[10px] sm:text-xs py-1 px-2 sm:py-1.5 sm:px-3 font-bold rounded-lg border transition-colors whitespace-nowrap ${user.status === 'Suspended' ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>{user.status === 'Suspended' ? 'Reinstate' : t('suspendUser')}</button>}
                                            </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="animate-fade-in-up overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-stone-200 dark:border-slate-700 text-xs uppercase text-stone-400 tracking-wider"><th className="py-3 pr-4">Product</th><th className="py-3 pr-4">Farmer</th><th className="py-3 pr-4">Category</th><th className="py-3 pr-4">Price</th><th className="py-3 pr-4">Stock</th><th className="py-3 pr-4">Added / Expires</th><th className="py-3">Action</th></tr></thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                            {products.map(product => {
                                const now = new Date();
                                const expiresAt = product.expiresAt ? new Date(product.expiresAt) : null;
                                const msLeft = expiresAt ? expiresAt - now : null;
                                const daysLeft = msLeft !== null ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : null;
                                const addedDaysAgo = product.createdAt ? Math.floor((now - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)) : null;
                                const isExpiringSoon = daysLeft !== null && daysLeft <= 1;
                                const isExpired = daysLeft !== null && daysLeft <= 0;
                                return (
                                <tr key={product._id} className={`group transition-colors cursor-pointer ${ isExpired ? 'bg-red-50/50 dark:bg-red-900/10' : isExpiringSoon ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'hover:bg-stone-50 dark:hover:bg-slate-800/50'}`} onClick={() => setPreviewProduct(product)}>
                                    <td className="py-4 pr-4 flex items-center gap-3"><img src={product.images?.[0] || product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" /><div className="font-bold text-black dark:text-white text-sm">{product.name}</div></td>
                                    <td className="py-4 pr-4 text-sm text-stone-600 dark:text-slate-400">{product.farmerName}</td>
                                    <td className="py-4 pr-4"><Badge>{product.category}</Badge></td>
                                    <td className="py-4 pr-4 font-bold text-sm">₹{product.price}/kg</td>
                                    <td className="py-4 pr-4"><span className={`text-sm font-bold ${product.stock < 20 ? 'text-red-500' : 'text-green-600'}`}>{product.stock}kg</span></td>
                                    <td className="py-4 pr-4">
                                        <div className="flex flex-col gap-1">
                                            {addedDaysAgo !== null && (
                                                <span className="flex items-center gap-1 text-[10px] text-stone-400 font-bold">
                                                    <Calendar size={10} /> {addedDaysAgo === 0 ? 'Added today' : `Added ${addedDaysAgo}d ago`}
                                                </span>
                                            )}
                                            {expiresAt ? (
                                                <span className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded w-fit ${
                                                    isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    isExpiringSoon ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                }`}>
                                                    {isExpired ? <AlertTriangle size={9} /> : <Clock size={9} />}
                                                    {isExpired ? 'Expired' : daysLeft === 1 ? 'Expires today' : `${daysLeft}d left`}
                                                </span>
                                            ) : <span className="text-[10px] text-stone-300">No expiry set</span>}
                                        </div>
                                    </td>
                                    <td className="py-4" onClick={(e) => e.stopPropagation()}><button onClick={() => handleDeleteProduct(product._id)} className="text-xs py-1.5 px-3 font-bold border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">{t('removeProduct')}</button></td>
                                </tr>);
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-slate-700 text-xs font-bold uppercase text-stone-500 tracking-wider">
                                    <th className="p-5">Order ID</th>
                                    <th className="p-5">Customer</th>
                                    <th className="p-5">Items</th>
                                    <th className="p-5">Total</th>
                                    <th className="p-5">Tracking Status</th>
                                    <th className="p-5">Update Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-slate-700/50">
                                {orders?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-stone-500 text-center py-12">No orders on the platform yet.</td>
                                    </tr>
                                ) : orders?.map((o, i) => (
                                    <tr key={i} className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                                        <td className="p-5">
                                            <span className="font-bold text-stone-800 dark:text-stone-200">#{o._id?.startsWith('ord_') ? o._id : 'ord_' + o._id?.slice(-5)}</span>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-black dark:text-white">{o.userName || 'Customer'}</p>
                                            <p className="text-xs text-stone-500 mt-0.5">{o.address?.substring(0, 30) || 'Address not provided'}{o.address?.length > 30 ? '...' : ''}</p>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-2">
                                                {o.items?.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/24'} className="w-6 h-6 rounded-md object-cover" alt="" />
                                                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{item.name} <span className="text-stone-400 text-xs font-bold ml-1">x{item.quantity}</span></span>
                                                    </div>
                                                ))}
                                                {o.items?.length > 2 && <span className="text-xs font-bold text-purple-600">+{o.items.length - 2} more items</span>}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-black text-green-700 dark:text-green-400">₹{o.total}</span>
                                        </td>
                                        <td className="p-5">
                                            <Badge color={
                                                o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }>
                                                {o.status?.toUpperCase() || 'PLACED'}
                                            </Badge>
                                        </td>
                                        <td className="p-5" onClick={e => e.stopPropagation()}>
                                            <select
                                                className="border border-stone-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold bg-white dark:bg-slate-700 text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                                                value={o.status || 'Placed'}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        const cleanId = o._id.startsWith('ord_') ? o._id.replace('ord_', '') : o._id;
                                                        if (cleanId.length === 24) {
                                                            await apiCall(`/orders/${cleanId}`, 'PUT', { status: newStatus });
                                                        }
                                                    } catch (err) {
                                                        console.error("Failed to update status on backend:", err);
                                                    }
                                                    setOrders(prev => prev.map(ord => ord._id === o._id ? { ...ord, status: newStatus } : ord));
                                                    addToast("Order status updated!");
                                                }}
                                            >
                                                <option value="Placed">Placed</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
                <div className="animate-fade-in-up space-y-6">

                    {/* Summary Cards */}
                    {paymentSummary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="col-span-2 bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-xl"><IndianRupee size={26} /></div>
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-80">Total Revenue</p>
                                    <p className="text-3xl font-black">₹{paymentSummary.totalRevenue?.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-xl text-green-600"><CheckCircle size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase">Paid</p>
                                    <p className="text-2xl font-black text-black dark:text-white">{paymentSummary.paidOrders}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2.5 rounded-xl text-yellow-600"><Clock size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase">Pending</p>
                                    <p className="text-2xl font-black text-black dark:text-white">{paymentSummary.pendingOrders}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-xl text-red-500"><AlertTriangle size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase">Failed</p>
                                    <p className="text-2xl font-black text-black dark:text-white">{paymentSummary.failedOrders}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl text-purple-600"><RefreshCw size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase">Refunded</p>
                                    <p className="text-2xl font-black text-black dark:text-white">{paymentSummary.refundedOrders}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {['all','paid','pending','failed','refunded','cod'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => handlePaymentFilterChange(f)}
                                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors capitalize ${
                                        paymentFilter === f
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >{f === 'all' ? 'All Transactions' : f}</button>
                            ))}
                        </div>
                        <button
                            onClick={() => fetchPayments(paymentFilter)}
                            className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {/* Transaction Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            {isLoadingPayments ? (
                                <div className="flex items-center justify-center py-16 gap-3 text-stone-400">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="font-medium">Loading transactions…</span>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="flex flex-col items-center py-16 text-stone-400">
                                    <CreditCard size={40} className="mb-3 opacity-30" />
                                    <p className="font-bold">No transactions found</p>
                                    <p className="text-sm mt-1">Payments will appear here once customers complete checkout.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-200 dark:border-slate-700 text-xs font-bold uppercase text-stone-500 tracking-wider">
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Method</th>
                                            <th className="p-4">Payment Status</th>
                                            <th className="p-4">Razorpay ID</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-slate-700/50">
                                        {payments.map(p => (
                                            <tr key={p._id} className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-black text-stone-700 dark:text-stone-300 text-xs">
                                                        #{p._id?.slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-black dark:text-white text-sm">{p.userName || 'Customer'}</p>
                                                    <p className="text-xs text-stone-400">{p.items?.length || 0} item(s)</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-black text-green-700 dark:text-green-400">₹{p.total?.toLocaleString('en-IN')}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-bold text-stone-500 uppercase">{p.paymentMethod || 'upi'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                                                        p.paymentStatus === 'paid'     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        p.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        p.paymentStatus === 'failed'   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        p.paymentStatus === 'cod'      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                        {p.paymentStatus === 'paid'     ? '✓ PAID' :
                                                         p.paymentStatus === 'refunded' ? '↩ REFUNDED' :
                                                         p.paymentStatus === 'failed'   ? '✗ FAILED' :
                                                         p.paymentStatus === 'cod'      ? '💵 COD' : '⏳ PENDING'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs text-stone-400 font-mono">
                                                        {p.razorpayPaymentId ? p.razorpayPaymentId.substring(0, 14) + '…' : '—'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs text-stone-500">
                                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {(p.paymentStatus === 'paid' && p.razorpayPaymentId) ? (
                                                        <button
                                                            onClick={() => handleRefund(p)}
                                                            disabled={refundingId === p._id}
                                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {refundingId === p._id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                                            Refund
                                                        </button>
                                                    ) : <span className="text-xs text-stone-300">—</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <AdminDocumentReviewModal isOpen={!!reviewingUser} onClose={() => setReviewingUser(null)} selectedUser={reviewingUser} onVerify={handleVerifyUser} />
            <OrderDetailModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} />

            {/* Product Details Modal */}
            {previewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slide-up my-auto no-scrollbar">
                        <button onClick={() => setPreviewProduct(null)} className="absolute top-4 right-4 p-2 bg-stone-100/20 hover:bg-white/40 dark:bg-slate-800/80 text-white hover:text-black dark:hover:text-white rounded-full transition-colors z-20 backdrop-blur-sm border border-white/20">
                            <X size={20} />
                        </button>
                        
                        <div className="relative h-48 sm:h-64 w-full bg-stone-100 dark:bg-slate-800">
                            <img src={previewProduct.images?.[0] || previewProduct.image || 'https://via.placeholder.com/600x400'} alt={previewProduct.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge color="bg-white/20 text-white backdrop-blur-md border border-white/30">{previewProduct.category}</Badge>
                                    {(previewProduct.organic || previewProduct.isOrganic) && <Badge color="bg-green-500/80 text-white backdrop-blur-md border border-green-400">100% Organic</Badge>}
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black">{previewProduct.name}</h2>
                                <p className="text-stone-300 flex items-center gap-2 mt-1">
                                    <Sprout size={16} /> By {previewProduct.farmerName || 'Unknown Farmer'}
                                </p>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-stone-100 dark:border-slate-700">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase mb-1">Price</p>
                                    <p className="text-xl sm:text-2xl font-black text-green-600 dark:text-green-400">₹{previewProduct.price}<span className="text-xs sm:text-sm text-stone-500 font-bold ml-1">/ {previewProduct.unit || 'kg'}</span></p>
                                </div>
                                <div className="h-10 w-px bg-stone-200 dark:bg-slate-700 hidden sm:block" />
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase mb-1">Available Stock</p>
                                    <p className={`text-xl sm:text-2xl font-black ${previewProduct.stock < 10 ? 'text-orange-500' : 'text-black dark:text-white'}`}>{previewProduct.stock} <span className="text-sm font-bold ml-1">{previewProduct.unit || 'kg'}</span></p>
                                </div>
                                <div className="h-10 w-px bg-stone-200 dark:bg-slate-700 hidden sm:block" />
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase mb-1">Status</p>
                                    <Badge color={previewProduct.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{previewProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}</Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                                    <FileText className="text-purple-500" size={18} /> Product Description
                                </h3>
                                <p className="text-stone-600 dark:text-slate-400 leading-relaxed text-sm">
                                    {previewProduct.description || "No detailed description provided by the farmer for this product."}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-stone-100 dark:border-slate-700 flex justify-end gap-3 pb-1">
                                <Button variant="outline" onClick={() => setPreviewProduct(null)}>Close</Button>
                                <Button 
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => {
                                        handleDeleteProduct(previewProduct._id);
                                        setPreviewProduct(null);
                                    }}
                                >
                                    <X size={18} className="mr-2" /> Remove Product
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
