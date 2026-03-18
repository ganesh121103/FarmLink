import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const ReviewModal = ({ isOpen, onClose, orderId }) => {
    const { t, addToast } = useAppContext();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            addToast(t('reviewSuccess'));
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 md:p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close"><X size={20} /></button>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{t('leaveReview')}</h3>
                <p className="text-sm text-stone-500 dark:text-slate-400 mb-6">Order #{orderId}</p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star size={36} className={`transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-stone-300 dark:text-slate-600'}`} />
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <label className="text-sm font-bold text-black dark:text-slate-300 block mb-2">Feedback (Optional)</label>
                    <textarea
                        className="w-full border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 text-black dark:text-white"
                        rows="4"
                        placeholder="Tell us about the freshness and quality..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full py-3.5 text-lg">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('submitReview')}
                </Button>
            </div>
        </div>
    );
};

export default ReviewModal;
