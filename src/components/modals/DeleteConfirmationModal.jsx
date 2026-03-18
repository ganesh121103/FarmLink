import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const { t } = useAppContext();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-xl shadow-2xl relative z-10 animate-fade-in-up" role="dialog" aria-modal="true">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400"><AlertTriangle size={32} /></div>
                    <div><h3 className="text-lg font-bold text-black dark:text-slate-100 mb-2">{t('confirmDeleteTitle')}</h3><p className="text-sm text-stone-500 dark:text-slate-400">{t('confirmDelete')}</p></div>
                    <div className="flex gap-3 w-full mt-2">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-slate-600 font-medium text-black dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">{t('cancel')}</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition-colors flex justify-center items-center gap-2">
                            {isLoading && <Loader2 size={16} className="animate-spin" />} {t('delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
