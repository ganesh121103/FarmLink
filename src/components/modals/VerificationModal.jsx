import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { apiCall } from '../../api/apiCall';

const VerificationModal = ({ isOpen, onClose, onVerificationSubmit }) => {
    const { user, setUser, addToast } = useAppContext();
    const [idProof, setIdProof] = useState(null);
    const [landRecord, setLandRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast("File is too large. Max 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => { setFile(reader.result); };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idProof || !landRecord) {
            addToast("Please upload both ID Proof and Land Record");
            return;
        }

        setIsLoading(true);
        try {
            await apiCall(`/farmers/${user._id}/documents`, 'PUT', { idProof, landRecord });

            // Sync user context and localStorage so profile badge updates immediately
            const updatedUser = { ...user, verificationStatus: 'Pending' };
            setUser(updatedUser);
            localStorage.setItem('farmlink_user', JSON.stringify(updatedUser));

            addToast("Documents submitted! Awaiting admin review.");
            if (onVerificationSubmit) onVerificationSubmit();
            onClose();
        } catch (error) {
            addToast(error.message || "Failed to submit documents");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700">
                    <X size={20} className="text-stone-500" />
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-green-600" size={28} />
                    <h3 className="text-2xl font-black text-black dark:text-white">Verification</h3>
                </div>
                
                <p className="text-stone-500 mb-6 text-sm">
                    Upload official documents to earn your verified badge and increase customer trust.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-slate-300 mb-2">ID Proof (Aadhar/PAN)</label>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-green-200">
                                Choose file
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setIdProof)} />
                            </label>
                            <span className="text-sm text-stone-500 truncate max-w-[200px]">
                                {idProof ? "File selected" : "No file chosen"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black dark:text-slate-300 mb-2">Land Record (7/12 Extract)</label>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-green-200">
                                Choose file
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setLandRecord)} />
                            </label>
                            <span className="text-sm text-stone-500 truncate max-w-[200px]">
                                {landRecord ? "File selected" : "No file chosen"}
                            </span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full py-3.5 mt-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Submit for Verification"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default VerificationModal;
