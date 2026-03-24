import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiCall } from '../api/apiCall';

const AuthView = () => {
    const { navigate, setUser, addToast } = useAppContext();

    const [mode, setMode] = useState('login');
    const [role, setRole] = useState('customer');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        image: '',
    });

    const [errors, setErrors] = useState({});

    const handleImage = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setFormData(f => ({ ...f, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const e = {};
        if (mode === 'register' && !formData.name.trim()) e.name = 'Name is required';
        if (!formData.email.trim()) e.email = 'Email is required';
        if (!formData.password) e.password = 'Password is required';
        else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
        if (mode === 'register' && formData.password !== formData.confirmPassword)
            e.confirmPassword = 'Passwords do not match';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setIsLoading(true);
        try {
            const endpoint = mode === 'login' ? '/users/login' : '/users/register';
            const payload = mode === 'login'
                ? { email: formData.email, password: formData.password, role }
                : { name: formData.name, email: formData.email, password: formData.password, role, image: formData.image };

            const { data } = await apiCall(endpoint, 'POST', payload);
            setUser(data);
            localStorage.setItem('farmlink_user', JSON.stringify(data));
            addToast(`Welcome, ${data.name}!`);
            navigate('dashboard');
        } catch (err) {
            setErrors({ form: err.message || 'Authentication failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { id: 'customer', label: 'Customer' },
        { id: 'farmer', label: 'Farmer' },
        { id: 'admin', label: 'Admin' },
    ];

    const inputBase =
        'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 placeholder-gray-400';
    const errorText = 'text-red-500 text-xs mt-1';

    return (
        <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-white">

            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

                    {/* Title */}
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">
                        {mode === 'login' ? 'Login' : 'Register'}
                    </h2>

                    {/* Role Tabs */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1">
                        {roles.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                    role === r.id
                                        ? 'bg-white text-green-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name (register only) */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                    className={inputBase}
                                />
                                {errors.name && <p className={errorText}>{errors.name}</p>}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                                className={inputBase}
                            />
                            {errors.email && <p className={errorText}>{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                                    className={`${inputBase} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className={errorText}>{errors.password}</p>}
                        </div>

                        {/* Confirm Password (register only) */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData(f => ({ ...f, confirmPassword: e.target.value }))}
                                    className={inputBase}
                                />
                                {errors.confirmPassword && <p className={errorText}>{errors.confirmPassword}</p>}
                            </div>
                        )}

                        {/* Profile Image (register only) */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Profile Picture (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleImage(e.target.files[0])}
                                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold hover:file:bg-green-100"
                                />
                            </div>
                        )}

                        {/* Forgot Password (login only) */}
                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => addToast('Password reset link will be sent to your email (coming soon!)')}
                                    className="text-sm font-semibold text-green-600 hover:text-green-800 transition"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {/* Global form error */}
                        {errors.form && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                                {errors.form}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="relative">
                            {/* Glow */}
                            <div className="absolute inset-0 rounded-2xl bg-green-500 blur-md opacity-40 translate-y-2 pointer-events-none" />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-base rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                            >
                                {isLoading
                                    ? <><Loader2 size={18} className="animate-spin" /> Please wait...</>
                                    : mode === 'login' ? 'Login' : 'Create Account'
                                }
                            </button>
                        </div>
                    </form>

                    {/* Social login (login mode only) */}
                    {mode === 'login' && (
                        <>
                            <div className="flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Or continue with</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="space-y-3">
                                {/* Google */}
                                <button
                                    type="button"
                                    onClick={() => addToast('Google login coming soon!')}
                                    className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all duration-200 text-sm font-semibold text-gray-700"
                                >
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.7 2.1 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.9 6.1C12.5 13.3 17.8 9.5 24 9.5z"/>
                                        <path fill="#4285F4" d="M46.5 24.5c0-1.5-.1-3-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.7 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17z"/>
                                        <path fill="#FBBC05" d="M10.6 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6L2.7 13.3C1 16.5 0 20.1 0 24s1 7.5 2.7 10.7l7.9-6.1z"/>
                                        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.3-4.5 2.1-7.7 2.1-6.2 0-11.5-3.8-13.4-9.2l-7.9 6.1C6.7 42.6 14.7 48 24 48z"/>
                                    </svg>
                                    Continue with Google
                                </button>

                                {/* Facebook */}
                                <button
                                    type="button"
                                    onClick={() => addToast('Facebook login coming soon!')}
                                    className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all duration-200 text-sm font-semibold text-gray-700"
                                >
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#1877F2" d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24c0 12 8.8 21.9 20.2 23.7V30.9h-6.1V24h6.1v-5.3c0-6.1 3.6-9.4 9.1-9.4 2.6 0 5.4.5 5.4.5v5.9h-3c-3 0-3.9 1.9-3.9 3.8V24h6.6l-1.1 6.9h-5.6v16.8C39.2 45.9 48 36 48 24z"/>
                                        <path fill="#fff" d="M33.4 30.9l1.1-6.9h-6.6v-4.5c0-1.9.9-3.8 3.9-3.8h3v-5.9s-2.7-.5-5.4-.5c-5.5 0-9.1 3.3-9.1 9.4V24h-6.1v6.9h6.1v16.8c1.2.2 2.5.3 3.8.3s2.5-.1 3.8-.3V30.9h5.5z"/>
                                    </svg>
                                    Continue with Facebook
                                </button>
                            </div>
                        </>
                    )}

                    {/* Toggle mode */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
                            className="text-green-600 font-semibold hover:text-green-800 transition"
                        >
                            {mode === 'login' ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>

                {/* Bottom branding */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    🌿 FarmLink – Connecting farmers directly with communities
                </p>
            </div>
        </div>
    );
};

export default AuthView;