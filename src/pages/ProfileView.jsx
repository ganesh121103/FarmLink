import React, { useState } from 'react';
import { User, CheckCircle, Mail, Phone, MapPin, Sprout, LocateFixed, LogOut, Edit, Loader2, BadgeCheck, Calendar } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import UserAvatar from '../components/ui/UserAvatar';
import EditProfileModal from '../components/modals/EditProfileModal';
import VerificationModal from '../components/modals/VerificationModal';
import { ShieldAlert } from '../components/ui/CustomIcons';
import { useAppContext } from '../context/AppContext';
import { apiCall } from '../api/apiCall';

const ProfileView = ({ BackBtn, setFarmers }) => {
    const { user, setUser, t, handleLogout, addToast } = useAppContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async (newData) => {
        setIsSaving(true);
        try {
            const { data } = await apiCall(`/users/${user._id}`, 'PUT', newData);
            const updatedUser = { ...user, ...data, token: user.token };
            setUser(updatedUser);
            if (setFarmers) {
                setFarmers(prev => prev.map(f => f._id === user._id ? { ...f, ...data } : f));
            }
            localStorage.setItem('farmlink_user', JSON.stringify(updatedUser));
            addToast('Profile updated successfully!');
            setIsEditModalOpen(false);
        } catch (err) {
            addToast(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerificationSubmit = () => {
        setUser({ ...user, verificationStatus: 'Pending' });
        if (setFarmers) {
            setFarmers(prev => prev.map(f => (f._id === user._id || f.name === user.name) ? { ...f, verificationStatus: 'Pending' } : f));
        }
    };

    return (
        <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto">
            <BackBtn />
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-stone-100 dark:border-slate-700 p-8 md:p-10">
                <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <UserAvatar
                                name={user?.name}
                                image={user?.image}
                                size="w-32 h-32"
                                textSize="text-5xl"
                                rounded="rounded-full"
                                className="shadow-inner border-4 border-white dark:border-slate-800"
                            />
                        <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="bg-white dark:bg-slate-800"><Edit size={16} /> {t('editProfile')}</Button>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-black dark:text-white mb-2 flex items-center gap-3">
                            {user?.name}
                            {user?.verified && <BadgeCheck size={28} className="text-blue-500 fill-blue-50 dark:fill-blue-950" title="Verified Farmer" />}
                        </h1>
                        <Badge color="bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300">{user?.role === 'farmer' ? t('farmer') : t('customer')}</Badge>
                    </div>

                    {user?.role === 'farmer' && (
                        <div className="mb-10">
                            {/* Verified ✅ */}
                            {(user?.verified || user?.verificationStatus === 'Verified') && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-5 flex items-center gap-4">
                                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-bold text-green-800 dark:text-green-400">Profile Verified ✅</h4>
                                        <p className="text-sm text-green-700 dark:text-green-500 mt-1">Your profile has been verified by the admin. Customers can trust your listings.</p>
                                    </div>
                                </div>
                            )}
                            {/* Pending ⏳ */}
                            {user?.verificationStatus === 'Pending' && !user?.verified && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-5 flex items-center gap-4">
                                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
                                    <div>
                                        <h4 className="font-bold text-blue-800 dark:text-blue-400">{t('verificationPending')}</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">Your documents are currently under review by our Admin team.</p>
                                    </div>
                                </div>
                            )}
                            {/* Rejected ❌ */}
                            {user?.verificationStatus === 'Rejected' && !user?.verified && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2">❌ Verification Rejected</h4>
                                        <p className="text-sm text-red-700 dark:text-red-500 mt-1">Your documents were rejected. Please re-upload clear, valid documents.</p>
                                    </div>
                                    <Button onClick={() => setIsVerifyModalOpen(true)} variant="secondary" className="shrink-0 font-bold px-8 shadow-md">Re-Submit</Button>
                                </div>
                            )}
                            {/* Not started */}
                            {!user?.verified && user?.verificationStatus !== 'Pending' && user?.verificationStatus !== 'Verified' && user?.verificationStatus !== 'Rejected' && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2"><ShieldAlert size={18} /> Unverified Profile</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">Upload your official documents to get verified and build trust with customers.</p>
                                    </div>
                                    <Button onClick={() => setIsVerifyModalOpen(true)} variant="secondary" className="shrink-0 font-bold px-8 shadow-md">Get Verified</Button>
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
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-stone-400" />
                                    <span className="font-medium text-sm">
                                        {user?.createdAt
                                            ? <>Member since <span className="font-bold text-black dark:text-white">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span></>
                                            : 'Member since unknown'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user?.role === 'farmer' && (
                            <div>
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Farm Information</h3>
                                <div className="bg-[#f0fdf4] dark:bg-green-900/20 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start gap-3"><Sprout size={18} className="text-green-700 mt-1" /><div className="font-medium text-sm"><span className="block text-green-800 dark:text-green-400 mt-0.5 mb-1">Specialization</span><span className="text-black dark:text-white font-bold">{user?.specialization || 'Mixed Crops'}</span></div></div>
                                    <div className="flex items-start gap-3"><LocateFixed size={18} className="text-green-700 mt-1" /><div className="font-medium text-sm"><span className="block text-green-800 dark:text-green-400 mt-0.5 mb-1">Bio / Description</span><span className="text-black dark:text-white font-bold">{user?.bio || 'No description provided.'}</span></div></div>
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
            <VerificationModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} onVerificationSubmit={handleVerificationSubmit} />
        </div>
    );
};

export default ProfileView;
