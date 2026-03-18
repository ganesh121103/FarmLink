import React from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

const AdminDocumentReviewModal = ({ isOpen, onClose, selectedUser, onVerify }) => {
    if (!isOpen || !selectedUser) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-3xl p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up max-h-[95vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full"><X size={20} /></button>
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-black dark:text-white flex items-center gap-2">Review Verification</h3>
                    <p className="text-stone-500 dark:text-slate-400 font-medium">Farmer: <span className="text-black dark:text-white font-bold">{selectedUser.name}</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="border border-stone-200 dark:border-slate-700 rounded-2xl p-2 bg-stone-50 dark:bg-slate-900">
                        <h4 className="font-bold text-xs mb-2 text-center text-stone-500 uppercase">Aadhar Card</h4>
                        <div className="h-48 rounded-xl overflow-hidden bg-stone-200 dark:bg-slate-800 flex items-center justify-center">
                            {selectedUser.documents?.aadharCard ? <img src={selectedUser.documents.aadharCard} className="w-full h-full object-cover" /> : <FileText size={32} className="text-stone-400" />}
                        </div>
                    </div>
                    <div className="border border-stone-200 dark:border-slate-700 rounded-2xl p-2 bg-stone-50 dark:bg-slate-900">
                        <h4 className="font-bold text-xs mb-2 text-center text-stone-500 uppercase">PAN Card</h4>
                        <div className="h-48 rounded-xl overflow-hidden bg-stone-200 dark:bg-slate-800 flex items-center justify-center">
                            {selectedUser.documents?.panCard ? <img src={selectedUser.documents.panCard} className="w-full h-full object-cover" /> : <FileText size={32} className="text-stone-400" />}
                        </div>
                    </div>
                    <div className="border border-stone-200 dark:border-slate-700 rounded-2xl p-2 bg-stone-50 dark:bg-slate-900">
                        <h4 className="font-bold text-xs mb-2 text-center text-stone-500 uppercase">Passbook</h4>
                        <div className="h-48 rounded-xl overflow-hidden bg-stone-200 dark:bg-slate-800 flex items-center justify-center">
                            {selectedUser.documents?.passbook ? <img src={selectedUser.documents.passbook} className="w-full h-full object-cover" /> : <FileText size={32} className="text-stone-400" />}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 py-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onVerify(selectedUser._id, false)}>
                        {selectedUser.verified ? 'Revoke Verification' : 'Reject'}
                    </Button>
                    <Button className="flex-1 py-4" onClick={() => onVerify(selectedUser._id, true)} disabled={selectedUser.verified}>
                        {selectedUser.verified ? 'Already Verified' : 'Approve & Verify'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentReviewModal;
