import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const FarmerVerificationModal = ({ isOpen, onClose, onSave }) => {
    const { t } = useAppContext();
    const [docs, setDocs] = useState({ aadharCard: null, panCard: null, passbook: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setDocs(prev => ({ ...prev, [type]: reader.result })); };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSave(docs);
            setIsSubmitting(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full"><X size={20} /></button>
                <h3 className="text-2xl font-black mb-2 text-black dark:text-white flex items-center gap-2"><ShieldCheck className="text-green-600" /> {t('verification')}</h3>
                <p className="text-stone-500 dark:text-slate-400 mb-6 text-sm">Upload official documents to earn your verified badge and increase customer trust.</p>

                <div className="space-y-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-black dark:text-slate-300">{t('docAadhar')}</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharCard')} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/30 dark:file:text-green-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-black dark:text-slate-300">{t('docPan')}</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'panCard')} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/30 dark:file:text-green-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-black dark:text-slate-300">{t('docPassbook')}</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'passbook')} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/30 dark:file:text-green-400" />
                    </div>
                </div>

                <Button onClick={handleSubmit} disabled={isSubmitting || !docs.aadharCard || !docs.panCard || !docs.passbook} className="w-full mt-8 py-3.5">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : t('submitVerification')}
                </Button>
            </div>
        </div>
    );
};

export default FarmerVerificationModal;
