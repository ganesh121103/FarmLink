import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { useAppContext } from '../../context/AppContext';

const EditProfileModal = ({ isOpen, onClose, onSave, isLoading }) => {
    const { user, t, addToast } = useAppContext();

    // ✅ FIX: use "image" instead of profilePicture
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        specialization: '',
        bio: '',
        image: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                specialization: user.specialization || '',
                bio: user.bio || '',
                image: user.image || '' // ✅ FIXED
            });
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast("File is too large. Max 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result }); // ✅ FIXED
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white dark:bg-slate-800 w-full max-w-lg p-6 rounded-xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{t('editProfile')}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                {/* IMAGE */}
                <div className="mb-6 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {formData.image ? (
                            <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs">No Image</span>
                        )}
                    </div>

                    <label className="cursor-pointer bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-bold transition-colors px-5 py-2.5 rounded-full text-sm">
                        {t('uploadImage') || 'Upload Picture'}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                {/* FORM */}
                <div className="space-y-4">
                    <Input label="Name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                    <Input label="Email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                    <Input label="Phone" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                    <Input label="Address" value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                    {user?.role === 'farmer' && (
                        <>
                            <Input label="Specialization"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-black dark:text-slate-300">{t('bio')}</label>
                                <textarea
                                    className="w-full border border-stone-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-green-600 outline-none bg-white dark:bg-slate-800 text-black dark:text-white"
                                    rows="3"
                                    placeholder={t('bio') || "Bio"}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <Button
                        onClick={() => onSave(formData)}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;