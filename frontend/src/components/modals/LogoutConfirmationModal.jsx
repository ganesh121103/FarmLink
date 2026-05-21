import React from 'react';
import { LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const { user, t } = useAppContext();
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-stone-100 dark:border-slate-700 transform transition-all duration-300 ease-out animate-fade-in-up">
                <div className="h-2 bg-gradient-to-r from-red-500 to-rose-600" />
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl text-red-500 dark:text-red-400 mb-5">
                        <LogOut size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                        {t('Logout?')}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-slate-400 mb-6">
                        Are you sure you want to sign out of your account?
                    </p>

                    {user && (
                        <div className="w-full flex items-center gap-3 p-3 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-100 dark:border-slate-700/50 mb-6">
                            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-stone-800 dark:text-slate-200 truncate">{user.name}</h4>
                                <p className="text-xs text-stone-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border border-stone-200 dark:border-slate-700 font-bold text-sm text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-red-600/30 transition-all active:scale-[0.98]"
                        >
                            Yes, Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;
