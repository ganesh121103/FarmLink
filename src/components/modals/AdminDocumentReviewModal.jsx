import React from 'react';
import { X, FileText, CheckCircle, XCircle, Mail, MapPin, Sprout } from 'lucide-react';
import { Button } from '../ui/Button';
import Badge from '../ui/Badge';

const AdminDocumentReviewModal = ({ isOpen, onClose, selectedUser, onVerify }) => {
    if (!isOpen || !selectedUser) return null;

    const statusColor = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Verified: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
        Unverified: 'bg-stone-100 text-stone-600',
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-3xl p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up max-h-[95vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-black dark:text-white">Review Verification Request</h3>
                    <p className="text-stone-500 dark:text-slate-400 text-sm mt-1">Review submitted documents and approve or reject the farmer's verification.</p>
                </div>

                {/* Farmer Info Card */}
                <div className="bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-black text-2xl flex-shrink-0">
                        {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h4 className="text-xl font-black text-black dark:text-white">{selectedUser.name}</h4>
                            <Badge color={statusColor[selectedUser.verificationStatus] || statusColor.Unverified}>
                                {selectedUser.verificationStatus || 'Unverified'}
                            </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-stone-500 dark:text-slate-400">
                            <p className="flex items-center gap-2"><Mail size={14} /> {selectedUser.email}</p>
                            {(selectedUser.location || selectedUser.address) && (
                                <p className="flex items-center gap-2"><MapPin size={14} /> {selectedUser.location || selectedUser.address}</p>
                            )}
                            {selectedUser.specialization && (
                                <p className="flex items-center gap-2"><Sprout size={14} /> {selectedUser.specialization}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Document Previews */}
                <h4 className="font-black text-black dark:text-white mb-3">Submitted Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* ID Proof */}
                    <div className="border border-stone-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-stone-50 dark:bg-slate-900">
                        <div className="px-4 py-2 border-b border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <h5 className="font-bold text-xs uppercase text-stone-500 tracking-wider">ID Proof (Aadhar / PAN)</h5>
                        </div>
                        <div className="h-52 flex items-center justify-center p-2">
                            {selectedUser.documents?.idProof ? (
                                <img
                                    src={selectedUser.documents.idProof}
                                    alt="ID Proof"
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-stone-400">
                                    <FileText size={36} />
                                    <span className="text-sm">No document uploaded</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Land Record */}
                    <div className="border border-stone-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-stone-50 dark:bg-slate-900">
                        <div className="px-4 py-2 border-b border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <h5 className="font-bold text-xs uppercase text-stone-500 tracking-wider">Land Record (7/12 Extract)</h5>
                        </div>
                        <div className="h-52 flex items-center justify-center p-2">
                            {selectedUser.documents?.landRecord ? (
                                <img
                                    src={selectedUser.documents.landRecord}
                                    alt="Land Record"
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-stone-400">
                                    <FileText size={36} />
                                    <span className="text-sm">No document uploaded</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 py-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2"
                        onClick={() => onVerify(selectedUser._id, false)}
                    >
                        <XCircle size={18} />
                        {selectedUser.verified ? 'Revoke Verification' : 'Reject'}
                    </Button>
                    <Button
                        className="flex-1 py-4 flex items-center justify-center gap-2"
                        onClick={() => onVerify(selectedUser._id, true)}
                        disabled={selectedUser.verified || selectedUser.verificationStatus === 'Verified'}
                    >
                        <CheckCircle size={18} />
                        {selectedUser.verified || selectedUser.verificationStatus === 'Verified' ? 'Already Verified' : 'Approve & Verify'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentReviewModal;
