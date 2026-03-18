import React, { useState } from 'react';
import { Leaf, User, Sprout, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAppContext } from '../context/AppContext';
import { apiCall } from '../api/apiCall';

const AuthView = () => {
    const { navigate, setUser, addToast, t, TRANSLATIONS } = useAppContext();
    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
    const [role, setRole] = useState('customer');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (mode === 'register' && !formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (mode !== 'forgot') {
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password?.length < 6) newErrors.password = t('passwordTooShort');
        }
        if (mode === 'register' && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        if (mode === 'forgot') {
            addToast(t('resetLinkSent'));
            setMode('login');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login' ? { email: formData.email, password: formData.password } : { name: formData.name, email: formData.email, password: formData.password, role };
            const { data } = await apiCall(endpoint, 'POST', payload);
            const userData = { ...data.user, token: data.token };
            setUser(userData);
            localStorage.setItem('farmlink_user', JSON.stringify(userData));
            addToast(`Welcome, ${data.user.name}!`);
            navigate(userData.role === 'customer' ? 'products' : 'dashboard');
        } catch (err) {
            // Fall back to offline demo mode if backend is offline, unreachable, or missing routes
            if (err.message === 'BACKEND_OFFLINE' || err.message === 'Failed to fetch' || err.message.includes('HTTP') || err.message.includes('Network') || err.message.includes('fetch failed')) {
                // Offline demo mode
                const mockUsers = [
                    { _id: 'u1', name: 'Demo Customer', email: 'customer@test.com', password: 'test123', role: 'customer' },
                    { _id: 'u2', name: 'Ramesh Kumar', email: 'farmer@test.com', password: 'test123', role: 'farmer', verified: true },
                    { _id: 'u3', name: 'Admin User', email: 'admin@test.com', password: 'test123', role: 'admin' },
                ];

                if (mode === 'login') {
                    const found = mockUsers.find(u => u.email === formData.email && u.password === formData.password);
                    if (found) {
                        const userToSet = { ...found, token: 'mock-jwt-token' };
                        setUser(userToSet);
                        localStorage.setItem('farmlink_user', JSON.stringify(userToSet));
                        addToast(`Welcome back, ${found.name}!`);
                        navigate(found.role === 'customer' ? 'products' : 'dashboard');
                    } else {
                        addToast('Demo: Use customer@test.com, farmer@test.com, or admin@test.com (pass: test123)');
                        setErrors({ email: 'Invalid demo credentials' });
                    }
                } else {
                    const newUser = { _id: `u${Date.now()}`, name: formData.name, email: formData.email, role, token: 'mock-jwt-token' };
                    setUser(newUser);
                    localStorage.setItem('farmlink_user', JSON.stringify(newUser));
                    addToast(`Account created! Welcome, ${formData.name}!`);
                    navigate(newUser.role === 'customer' ? 'products' : 'dashboard');
                }
            } else {
                setErrors({ email: err.message || t('authFailed') });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { id: 'customer', label: t('customer'), icon: User },
        { id: 'farmer', label: t('farmer'), icon: Sprout },
        { id: 'admin', label: t('admin'), icon: Shield },
    ];

    if (mode === 'forgot') {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-stone-50 dark:bg-slate-900">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-stone-100 dark:border-slate-700">
                    <button onClick={() => setMode('login')} className="flex items-center gap-2 text-stone-500 mb-6 hover:text-black dark:hover:text-white text-sm"><ArrowLeft size={16} /> {t('backToLogin')}</button>
                    <h2 className="text-2xl font-black text-black dark:text-white mb-2">{t('resetPassword')}</h2>
                    <p className="text-stone-500 text-sm mb-6">Enter your email address and we'll send you a link.</p>
                    <div className="space-y-4">
                        <Input label={t('email')} type="email" placeholder="you@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Button className="w-full py-3.5 mt-2" onClick={handleSubmit}>{isLoading ? <Loader2 className="animate-spin" size={20} /> : t('sendResetLink')}</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-stone-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-stone-100 dark:border-slate-700 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 text-2xl font-black text-green-700 dark:text-green-500 mb-2">
                        <Leaf size={28} className="fill-current" /> FarmLink
                    </div>
                    <h2 className="text-2xl font-black text-black dark:text-white mt-2">{mode === 'login' ? t('welcomeBack') : t('createAccount')}</h2>
                    <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">{mode === 'login' ? 'Sign in to continue' : 'Join the farming revolution'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <Input label={t('fullName')} placeholder="Ramesh Kumar" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={errors.name} required />
                    )}
                    <Input label={t('email')} type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={errors.email} required />
                    <Input label={t('password')} type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} error={errors.password} required />
                    {mode === 'register' && <Input label="Confirm Password" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} error={errors.confirmPassword} required />}

                    {mode === 'login' && (
                        <div className="text-right -mt-1">
                            <button type="button" onClick={() => setMode('forgot')} className="text-xs text-green-700 dark:text-green-500 hover:underline font-semibold">{t('forgotPassword')}</button>
                        </div>
                    )}

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-slate-300 mb-2">{t('registerAs')}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {roles.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id} type="button" onClick={() => setRole(id)}
                                        aria-pressed={role === id}
                                        className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all font-bold text-sm ${role === id ? 'border-green-600 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'border-stone-200 dark:border-slate-600 text-stone-500 hover:border-stone-300'}`}
                                    >
                                        <Icon size={20} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full py-4 text-lg mt-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={22} /> : mode === 'login' ? t('login') : t('createAccount')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
                        className="text-sm text-stone-500 dark:text-slate-400"
                    >
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <span className="text-green-700 dark:text-green-500 font-bold hover:underline">
                            {mode === 'login' ? t('register') : t('login')}
                        </span>
                    </button>
                </div>

                {mode === 'login' && (
                    <div className="mt-4 p-4 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">Demo Accounts (pass: test123)</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {[
                                { email: 'customer@test.com', label: 'Customer' },
                                { email: 'farmer@test.com', label: 'Farmer' },
                                { email: 'admin@test.com', label: 'Admin' },
                            ].map(({ email, label }) => (
                                <button key={email} type="button" onClick={() => setFormData({ ...formData, email, password: 'test123' })} className="text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 px-3 py-1.5 rounded-md font-bold text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors">
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthView;
