import React, { useState } from 'react';
import { Sprout, Package, TrendingUp, Activity, BarChart3, CloudSun, Droplets, Wind, PlusCircle, Edit, Trash2, Bot, Loader2, X, ImageIcon, Shield } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import CropScannerModal from '../../components/modals/CropScannerModal';
import VerificationModal from '../../components/modals/VerificationModal';
import { CATEGORIES, LOCATIONS } from '../../constants';

import { apiCall } from '../../api/apiCall';
import { useAppContext } from '../../context/AppContext';

const FarmerDashboard = ({ products, setProducts, orders, setOrders }) => {
    const { user, addToast, t } = useAppContext();
    const [activeTab, setActiveTab] = useState('inventory');
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Vegetables', location: user?.location || 'Satara', stock: '', images: [], image: null, description: '' });
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const myProducts = products.filter(p => p.farmer === user?._id || p.farmerName === user?.name);
    const myOrders = orders.filter(o => o.items?.some(item => item.farmerName === user?.name || item.farmer === user?._id));

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { addToast(`File ${file.name} is too large. Max 5MB.`); return; }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct(prev => {
                    const updated = [...(prev.images || []), reader.result];
                    return { ...prev, images: updated, image: prev.image || updated[0] };
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const removeUploadMedia = (index) => {
        setNewProduct(prev => {
            const imgs = [...(prev.images || [])];
            imgs.splice(index, 1);
            return { ...prev, images: imgs, image: imgs[0] || null };
        });
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = { ...newProduct, farmer: user._id, farmerName: user.name, image: newProduct.images?.[0] || "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=400", images: newProduct.images?.length > 0 ? newProduct.images : ["https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=400"] };
        try {
            if (editingId) {
                const { data } = await apiCall(`/products/${editingId}`, 'PUT', payload);
                setProducts(prev => prev.map(p => p._id === editingId ? data : p));
                addToast(t('productUpdated'));
            } else {
                const { data } = await apiCall('/products', 'POST', payload);
                setProducts(prev => [data, ...prev]);
                addToast("Product listed!");
            }
            setIsAddProductOpen(false);
        } catch (err) {
            if (err.message === 'BACKEND_OFFLINE') {
                const stripped = { ...payload, images: [payload.images[0]], image: payload.image };
                if (editingId) setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...stripped } : p));
                else setProducts(prev => [{ _id: `p_${Date.now()}`, ...stripped }, ...prev]);
                setIsAddProductOpen(false);
                addToast(editingId ? t('productUpdated') : "Product listed! (Offline Mode)");
            } else {
                addToast(err.message || "Failed to save product");
            }
        } finally {
            setIsLoading(false);
            setEditingId(null);
            setNewProduct({ name: '', price: '', category: 'Vegetables', location: user?.location || 'Satara', stock: '', images: [], image: null, description: '' });
        }
    };

    const handleAISuggestPrice = async () => {
        if (!newProduct.name) { addToast("Enter a product name first."); return; }
        setIsSuggestingPrice(true);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD3oKVXraHDSGB-57B2HbnHRDgsJzhNDSE";
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `Suggest a SINGLE fair wholesale price in Indian Rupees per kilogram for ${newProduct.name} in Maharashtra, India. Return ONLY the number. Example: 45` }] }] })
            });
            const data = await res.json();
            const suggested = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/[^0-9]/g, '');
            if (suggested) { setNewProduct(prev => ({ ...prev, price: suggested })); addToast(`AI suggested ₹${suggested}/kg for ${newProduct.name}`); }
        } catch { addToast("Could not connect to AI. Try again."); }
        setIsSuggestingPrice(false);
    };

    const handleDeleteProduct = async () => {
        try {
            await apiCall(`/products/${productToDelete}`, 'DELETE');
            setProducts(prev => prev.filter(p => p._id !== productToDelete));
            addToast(t('productDeleted'));
        } catch {
            setProducts(prev => prev.filter(p => p._id !== productToDelete));
            addToast(t('productDeleted'));
        } finally {
            setDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const openEdit = (p) => { setNewProduct({ name: p.name, price: p.price, category: p.category, location: p.location, stock: p.stock, images: p.images || (p.image ? [p.image] : []), image: p.image, description: p.description || '' }); setEditingId(p._id); setIsAddProductOpen(true); };
    const openDelete = (id) => { setProductToDelete(id); setDeleteModalOpen(true); };
    const tabClass = (tab) => `py-3 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-green-600 text-green-700 dark:text-green-400' : 'border-transparent text-stone-500 hover:text-black dark:hover:text-white'}`;

    const totalRevenue = myOrders.reduce((sum, o) => {
        const farmerItems = o.items?.filter(item => item.farmerName === user?.name || item.farmer === user?._id) || [];
        return sum + farmerItems.reduce((s, item) => s + (parseInt(item.price || 0) * (item.quantity || 1)), 0);
    }, 0);

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-black dark:text-white"><Sprout className="text-green-600" /> {t('farmerDashboard')}</h1>
                    <p className="text-stone-500 mt-1 font-medium">Welcome back, {user?.name?.split(' ')[0]}! {t('manageInventory')}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2"><Bot size={18} /> {t('cropScanner')}</Button>
                    <Button onClick={() => { setEditingId(null); setIsAddProductOpen(true); setNewProduct({ name: '', price: '', category: 'Vegetables', location: user?.location || 'Satara', stock: '', images: [], image: null, description: '' }); }} className="flex items-center gap-2"><PlusCircle size={20} /> {t('addProduct')}</Button>
                </div>
            </div>

            {!user?.verified && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-2xl p-5 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5" />
                            {user?.verificationStatus === 'Pending' ? 'Verification Pending' : 'Unverified Profile'}
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-600/80 text-sm">
                            {user?.verificationStatus === 'Pending' 
                                ? 'Your documents are currently under review by our team. This usually takes 1-2 business days.' 
                                : 'Upload your official documents to get verified and build trust with customers.'}
                        </p>
                    </div>
                    {user?.verificationStatus !== 'Pending' && (
                        <button 
                            onClick={() => setIsVerificationOpen(true)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap whitespace-nowrap"
                        >
                            Get Verified
                        </button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <Card className="p-5 border-l-4 border-l-green-500 text-center"><div className="text-3xl font-black text-black dark:text-white">{myProducts.length}</div><p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('activeProducts')}</p></Card>
                <Card className="p-5 border-l-4 border-l-yellow-500 text-center"><div className="text-3xl font-black text-green-700 dark:text-green-400">₹{totalRevenue}</div><p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('totalRevenue')}</p></Card>
                <Card className="p-5 border-l-4 border-l-blue-500 text-center"><div className="text-3xl font-black text-black dark:text-white">{myOrders.length}</div><p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('orders')}</p></Card>
                <Card className="p-5 border-l-4 border-l-red-500 text-center"><div className="text-3xl font-black text-black dark:text-white">{myProducts.filter(p => p.stock < 20).length}</div><p className="text-xs text-stone-500 font-bold uppercase mt-1">{t('lowStock')}</p></Card>
            </div>

            <div className="flex gap-4 mb-8 border-b border-stone-200 dark:border-slate-700">
                <button onClick={() => setActiveTab('inventory')} className={tabClass('inventory')}>{t('myStock')}</button>
                <button onClick={() => setActiveTab('orders')} className={tabClass('orders')}>{t('orders')} ({myOrders.length})</button>
                <button onClick={() => setActiveTab('weather')} className={tabClass('weather')}>Weather & Forecast</button>
            </div>

            {activeTab === 'inventory' && (
                <div className="animate-fade-in-up">
                    {myProducts.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-stone-300 dark:border-slate-600">
                            <Sprout size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-stone-500 mb-4">{t('noProducts')}</h3>
                            <div className="flex justify-center">
                                <Button onClick={() => setIsAddProductOpen(true)}><PlusCircle size={20} /> {t('listFirstProduct')}</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myProducts.map(p => (
                                <Card key={p._id} className="overflow-hidden flex flex-col">
                                    <div className="h-40 overflow-hidden relative">
                                        {(p.images?.[0] || p.image)?.includes('.mp4') ? <video src={p.images?.[0] || p.image} className="w-full h-full object-cover" muted /> : <img src={p.images?.[0] || p.image} alt={p.name} className="w-full h-full object-cover" />}
                                        <div className="absolute bottom-2 right-2"><Badge color={p.stock < 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>{p.stock}kg left</Badge></div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-base">{p.name}</h3>
                                            <Badge>{p.category}</Badge>
                                        </div>
                                        <p className="text-2xl font-black text-green-700 dark:text-green-500 mb-3">₹{p.price}/kg</p>
                                        <div className="flex gap-2 mt-auto">
                                            <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-stone-200 dark:border-slate-600 rounded-lg font-bold text-sm text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors"><Edit size={16} /> {t('edit')}</button>
                                            <button onClick={() => openDelete(p._id)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 dark:border-red-900/50 rounded-lg font-bold text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={16} /> {t('delete')}</button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-4 animate-fade-in-up">
                    {myOrders.length === 0 ? <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-stone-300 dark:border-slate-600"><Package size={48} className="mx-auto text-stone-300 dark:text-slate-600 mb-4" /><p className="text-stone-500 font-bold">No orders received yet.</p></div>
                        : myOrders.map((o, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                                <div>
                                    <p className="font-bold text-black dark:text-white">Order #{o._id} — <span className="text-stone-500 font-medium">{o.userName}</span></p>
                                    <p className="text-sm text-stone-500 mt-1">{o.items?.filter(i => i.farmerName === user?.name || i.farmer === user?._id).map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-black text-green-700 dark:text-green-400">₹{o.total}</p>
                                    <Badge color={o.status === 'Delivered' ? 'bg-green-100 text-green-800' : o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>{o.status}</Badge>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === 'weather' && (
                <div className="animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[{ icon: CloudSun, label: "Temperature", value: "28°C", tip: "Ideal for most vegetables", color: "text-yellow-500" }, { icon: Droplets, label: "Rainfall", value: "7mm", tip: "Low chance of rain today", color: "text-blue-500" }, { icon: Wind, label: "Wind Speed", value: "15 km/h", tip: "Calm conditions", color: "text-green-500" }].map(w => (
                            <Card key={w.label} className="p-6 flex items-center gap-5">
                                <div className={`p-4 bg-stone-50 dark:bg-slate-900 rounded-xl ${w.color}`}><w.icon size={28} /></div>
                                <div><p className="text-xs font-bold text-stone-400 uppercase mb-1">{w.label}</p><p className="text-2xl font-black text-black dark:text-white">{w.value}</p><p className="text-sm text-stone-500 mt-1">{w.tip}</p></div>
                            </Card>
                        ))}
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-6">
                        <h3 className="font-bold text-green-800 dark:text-green-400 mb-3 text-lg">This Week's Farming Tip</h3>
                        <p className="text-sm text-green-700 dark:text-green-500 leading-relaxed">Good conditions for spring planting. Soil moisture levels are optimal. Consider planting leafy greens and root vegetables. Mulching is recommended to retain moisture during the expected dry spell next week.</p>
                    </div>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {isAddProductOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddProductOpen(false)} />
                    <div className="bg-white dark:bg-slate-800 w-full max-w-xl p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsAddProductOpen(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700"><X size={20} className="text-stone-500" /></button>
                        <h3 className="text-2xl font-black mb-6 text-black dark:text-white">{editingId ? t('editProduct') : t('listNewProduct')}</h3>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <Input label={t('productName')} value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                            <div className="flex gap-3 items-end">
                                <Input label={t('priceKg')} type="number" className="flex-1" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                <Button type="button" variant="outline" onClick={handleAISuggestPrice} disabled={isSuggestingPrice} className="h-[50px] px-3 text-xs whitespace-nowrap flex-shrink-0">
                                    {isSuggestingPrice ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />} AI Price
                                </Button>
                            </div>
                            <Input label={t('stockKg')} type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-black dark:text-slate-300">{t('category')}</label><select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white dark:bg-slate-800 text-black dark:text-white">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                                <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-black dark:text-slate-300">{t('locationTag')}</label><select value={newProduct.location} onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })} className="w-full px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white dark:bg-slate-800 text-black dark:text-white">{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-black dark:text-slate-300">{t('productImage')}</label>
                                <label className="cursor-pointer flex items-center justify-center gap-3 border-2 border-dashed border-stone-300 dark:border-slate-600 rounded-xl p-5 hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleImageChange} />
                                    <ImageIcon size={24} className="text-stone-400" /><div className="text-sm text-stone-500"><span className="font-bold text-green-700 dark:text-green-400">Click to upload</span> (Multi-select supported. Max 5MB each)</div>
                                </label>
                                {newProduct.images?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newProduct.images.map((img, i) => (
                                            <div key={i} className="relative w-20 h-20">
                                                {img?.includes('.mp4') || img?.startsWith('data:video') ? <video src={img} className="w-full h-full object-cover rounded-lg" /> : <img src={img} className="w-full h-full object-cover rounded-lg" />}
                                                <button type="button" onClick={() => removeUploadMedia(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-black dark:text-slate-300">{t('description')}</label><textarea className="w-full border border-stone-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-green-600 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" rows="3" placeholder={t('productDescPlaceholder')} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} /></div>
                            <Button type="submit" className="w-full py-3.5 mt-2" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" size={20} /> : editingId ? t('updateProduct') : t('addProduct')}</Button>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteProduct} isLoading={isLoading} />
            <CropScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
            <VerificationModal 
                isOpen={isVerificationOpen} 
                onClose={() => setIsVerificationOpen(false)} 
                onVerificationSubmit={() => {
                   // Optional: refresh user or show some update
                }} 
            />
        </div>
    );
};

export default FarmerDashboard;
