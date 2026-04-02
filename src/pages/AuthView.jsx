import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiCall } from '../api/apiCall';
import { registerWithEmail, loginWithEmail, loginWithGoogle } from '../auth/firebaseAuth';

const AuthView = ({ initialMode = 'login' }) => {
    const { navigate, setUser, addToast } = useAppContext();

    const [mode, setMode] = useState(initialMode);
    
    // Sync mode when initialMode prop changes (e.g., clicking Register from Navbar while on Login)
    React.useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const [role, setRole] = useState('customer');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

    // Helper: build user data from Firebase user + sync with backend
    const syncFirebaseUserWithBackend = async (firebaseUser, extraData = {}) => {
        const userData = {
            firebaseUid: firebaseUser.uid,
            name: extraData.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            role: extraData.role || role,
            image: extraData.image || firebaseUser.photoURL || '',
            password: extraData.password || undefined,
        };

        try {
            // Determine the right endpoint:
            // - /register for email/password registration
            // - /login for email/password login
            // - /firebase-auth for Google sign-in (find-or-create by firebaseUid)
            let endpoint;
            if (extraData.isRegister) {
                endpoint = '/users/register';
            } else if (extraData.password) {
                endpoint = '/users/login';
            } else {
                endpoint = '/users/firebase-auth';
            }

            const { data } = await apiCall(endpoint, 'POST', userData);
            return data;
        } catch {
            // If backend is down, use Firebase user data as fallback
            return {
                _id: firebaseUser.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                image: userData.image,
                firebaseUser: true,
            };
        }
    };

    // ─── Email/Password Submit ─────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setIsLoading(true);
        try {
            let firebaseResult;

            if (mode === 'register') {
                // Step 1: Register with Firebase
                firebaseResult = await registerWithEmail(formData.email, formData.password, formData.name);
                if (firebaseResult.error) {
                    setErrors({ form: firebaseResult.error });
                    return;
                }
                // Step 2: Sync with backend
                const userData = await syncFirebaseUserWithBackend(firebaseResult.user, {
                    name: formData.name,
                    role,
                    image: formData.image,
                    password: formData.password,
                    isRegister: true,
                });
                setUser(userData);
                localStorage.setItem('farmlink_user', JSON.stringify(userData));
                addToast(`Welcome, ${userData.name}! 🎉`);
                navigate('dashboard');
            } else {
                // Step 1: Login with Firebase
                firebaseResult = await loginWithEmail(formData.email, formData.password);
                if (firebaseResult.error) {
                    setErrors({ form: firebaseResult.error });
                    return;
                }
                // Step 2: Sync with backend
                const userData = await syncFirebaseUserWithBackend(firebaseResult.user, { role, password: formData.password });
                setUser(userData);
                localStorage.setItem('farmlink_user', JSON.stringify(userData));
                addToast(`Welcome back, ${userData.name}! 👋`);
                navigate('dashboard');
            }
        } catch (err) {
            setErrors({ form: err.message || 'Authentication failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const [showRoleModal, setShowRoleModal] = useState(false);

    // ─── Google Sign-In ────────────────────────────────────────────────────
    const handleGoogleSignInClick = () => {
        // explicitly ask the user for their role before popping up Google
        setShowRoleModal(true);
    };

    const confirmGoogleSignIn = async (selectedRole) => {
        setShowRoleModal(false);
        setIsGoogleLoading(true);
        setErrors({});
        try {
            const { user: firebaseUser, error } = await loginWithGoogle();
            if (error) {
                setErrors({ form: error });
                return;
            }
            if (!firebaseUser) return; // User closed popup

            // Google sign-in uses the explicitly selected role
            const userData = await syncFirebaseUserWithBackend(firebaseUser, { role: selectedRole });
            // If the user already has an account, the backend will return their actual role
            setUser(userData);
            localStorage.setItem('farmlink_user', JSON.stringify(userData));
            addToast(`Welcome, ${userData.name}! 🎉`);
            navigate('dashboard');
        } catch (err) {
            setErrors({ form: err.message || 'Google sign-in failed' });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const roles = [
        { id: 'customer', label: 'Customer' },
        { id: 'farmer', label: 'Farmer' },
        { id: 'admin', label: 'Admin' },
    ];

    const inputBase =
        'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400';
    const errorText = 'text-red-500 text-xs mt-1';

    return (
        <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-white dark:bg-slate-900 transition-colors duration-300">

            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 transition-colors duration-300">

                    {/* Title */}
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6 tracking-tight">
                        {mode === 'login' ? 'Login' : 'Register'}
                    </h2>

                    {/* Role Tabs */}
                    <div className="flex bg-gray-100 dark:bg-slate-700 rounded-2xl p-1 mb-6 gap-1 transition-colors duration-300">
                        {roles.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                    role === r.id
                                        ? 'bg-white dark:bg-slate-600 text-green-700 dark:text-green-400 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Full Name</label>
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
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                                className={inputBase}
                                autoComplete="off"
                            />
                            {errors.email && <p className={errorText}>{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                                    className={`${inputBase} pr-12`}
                                    autoComplete="new-password"
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
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Confirm Password</label>
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
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Profile Picture (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleImage(e.target.files[0])}
                                    className="w-full text-sm text-gray-500 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 dark:file:bg-slate-700/50 file:text-green-700 dark:file:text-green-400 file:font-semibold hover:file:bg-green-100 dark:hover:file:bg-slate-700 transition"
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
                                disabled={isLoading || isGoogleLoading}
                                className="relative z-10 w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-base rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                            >
                                {isLoading
                                    ? <><Loader2 size={18} className="animate-spin" /> Please wait...</>
                                    : mode === 'login' ? 'Login' : 'Create Account'
                                }
                            </button>
                        </div>
                    </form>

                    {/* Social login divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">Or continue with</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                    </div>

                    {/* Google Sign-In Button */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleGoogleSignInClick}
                            disabled={isLoading || isGoogleLoading}
                            className="relative z-10 w-full flex items-center justify-center gap-3 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 active:scale-95 transition-all duration-200 text-sm font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-60"
                        >
                            {isGoogleLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.7 2.1 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.9 6.1C12.5 13.3 17.8 9.5 24 9.5z"/>
                                        <path fill="#4285F4" d="M46.5 24.5c0-1.5-.1-3-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.7 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17z"/>
                                        <path fill="#FBBC05" d="M10.6 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6L2.7 13.3C1 16.5 0 20.1 0 24s1 7.5 2.7 10.7l7.9-6.1z"/>
                                        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.3-4.5 2.1-7.7 2.1-6.2 0-11.5-3.8-13.4-9.2l-7.9 6.1C6.7 42.6 14.7 48 24 48z"/>
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>
                    </div>

                    {/* Toggle mode */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 relative z-10">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
                            className="text-green-600 dark:text-green-500 font-semibold hover:text-green-800 dark:hover:text-green-400 transition ml-1"
                        >
                            {mode === 'login' ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>

                {/* Bottom branding */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 relative z-10">
                    🌿 FarmLink – Connecting farmers directly with communities
                </p>
            </div>

            {/* Google Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                            Select Your Role
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                            How do you want to use FarmLink?
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => confirmGoogleSignIn('customer')}
                                className="w-full py-3.5 px-4 bg-green-50 hover:bg-green-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-green-700 dark:text-white font-semibold rounded-2xl transition"
                            >
                                Shop as Customer
                            </button>
                            <button
                                onClick={() => confirmGoogleSignIn('farmer')}
                                className="w-full py-3.5 px-4 bg-orange-50 hover:bg-orange-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-orange-700 dark:text-white font-semibold rounded-2xl transition"
                            >
                                Sell as Farmer
                            </button>
                            <button
                                onClick={() => confirmGoogleSignIn('admin')}
                                className="w-full py-3.5 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-blue-700 dark:text-white font-semibold rounded-2xl transition"
                            >
                                Enter as Admin
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowRoleModal(false)}
                            className="mt-6 w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthView;