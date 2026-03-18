import React, { useState } from 'react';
import { User, CheckCircle, Mail, Phone, MapPin, Sprout, LocateFixed, LogOut, Edit, Loader2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import EditProfileModal from '../components/modals/EditProfileModal';
import FarmerVerificationModal from '../components/modals/FarmerVerificationModal';
import { ShieldAlert } from '../components/ui/CustomIcons';
import { useAppContext } from '../context/AppContext';

const ProfileView = ({ BackBtn, setFarmers }) => {
    const { user, setUser, t, handleLogout } = useAppContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = (newData) => {
        setIsSaving(true);
        setTimeout(() => {
            setUser({ ...user, ...newData });
            setIsSaving(false);
            setIsEditModalOpen(false);
        }, 1000);
    };

    const handleVerificationSubmit = (docs) => {
        setUser({ ...user, verificationStatus: 'Pending', documents: docs });
        if (setFarmers) {
            setFarmers(prev => prev.map(f => (f._id === user._id || f.name === user.name) ? { ...f, verificationStatus: 'Pending', documents: docs } : f));
        }
    };

    return (
        <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto">
            <BackBtn />
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-stone-100 dark:border-slate-700">
                <div className="h-32 md:h-48 bg-gradient-to-r from-green-700 to-green-500 relative"></div>
                <div className="px-8 pb-8 relative">
                    <div className="flex justify-between items-end -mt-16 mb-6">
                        <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                            <User size={64} className="text-stone-300 dark:text-slate-600" />
                        </div>
                        <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="mb-4 bg-white dark:bg-slate-800"><Edit size={16} /> {t('editProfile')}</Button>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-black dark:text-white mb-2 flex items-center gap-3">
                            {user?.name}
                            {user?.verified && <CheckCircle size={24} className="text-blue-500" title="Verified Farmer" />}
                        </h1>
                        <Badge color="bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300">{user?.role === 'farmer' ? t('farmer') : t('customer')}</Badge>
                    </div>

                    {user?.role === 'farmer' && (
                        <div className="mb-8">
                            {!user?.verified && user?.verificationStatus !== 'Pending' && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2"><ShieldAlert size={18} /> Unverified Profile</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">Upload your official documents to get verified and build trust with customers.</p>
                                    </div>
                                    <Button onClick={() => setIsVerifyModalOpen(true)} variant="secondary" className="shrink-0">{t('getVerified')}</Button>
                                </div>
                            )}
                            {user?.verificationStatus === 'Pending' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-5 flex items-center gap-4">
                                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
                                    <div>
                                        <h4 className="font-bold text-blue-800 dark:text-blue-400">{t('verificationPending')}</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">Your documents are currently under review by our Admin team.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">{t('personalDetails')}</h3>
                            <div className="bg-stone-50 dark:bg-slate-900 rounded-xl p-4 border border-stone-100 dark:border-slate-700 space-y-3">
                                <div className="flex items-center gap-3"><Mail size={18} className="text-stone-400" /><span className="font-medium text-sm">{user?.email}</span></div>
                                <div className="flex items-center gap-3"><Phone size={18} className="text-stone-400" /><span className="font-medium text-sm">{user?.phone || 'Not provided'}</span></div>
                                <div className="flex items-center gap-3"><MapPin size={18} className="text-stone-400" /><span className="font-medium text-sm">{user?.address || user?.location || 'Not provided'}</span></div>
                            </div>
                        </div>

                        {user?.role === 'farmer' && (
                            <div>
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Farm Information</h3>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30 space-y-3">
                                    <div className="flex items-start gap-3"><Sprout size={18} className="text-green-600 mt-1" /><div className="font-medium text-sm"><span className="block text-green-800 dark:text-green-400 mb-1">{t('specialization')}</span>{user?.specialization || 'Mixed Crops'}</div></div>
                                    <div className="flex items-start gap-3"><LocateFixed size={18} className="text-green-600 mt-1" /><div className="font-medium text-sm"><span className="block text-green-800 dark:text-green-400 mb-1">{t('bio')}</span>{user?.bio || 'No description provided.'}</div></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 pt-6 border-t border-stone-200 dark:border-slate-700 flex justify-end">
                        <Button variant="danger" onClick={handleLogout} className="px-8"><LogOut size={18} /> {t('logout')}</Button>
                    </div>
                </div>
            </div>
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveProfile} isLoading={isSaving} />
            <FarmerVerificationModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} onSave={handleVerificationSubmit} />
        </div>
    );
};

export default ProfileView;
