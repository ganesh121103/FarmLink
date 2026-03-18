import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { useAppContext } from '../../context/AppContext';

const EditProfileModal = ({ isOpen, onClose, onSave, isLoading }) => {
    const { user, t } = useAppContext();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', specialization: '', bio: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                specialization: user.specialization || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg p-6 rounded-xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-black dark:text-white">{t('editProfile')}</h3><button onClick={onClose} aria-label="Close"><X size={24} className="text-stone-500" /></button></div>
                <div className="space-y-4">
                    <Input label={t('fullName')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <Input label={t('email')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <Input label={t('phone')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    <Input label={t('address')} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    {user?.role === 'farmer' && (
                        <>
                            <Input label={t('specialization')} value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
                            <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-black dark:text-slate-300">{t('bio')}</label><textarea className="w-full px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" rows="3" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></div>
                        </>
                    )}
                    <Button onClick={() => onSave(formData)} disabled={isLoading} className="w-full mt-4">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : t('saveChanges')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
