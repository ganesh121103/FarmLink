import React, { useState } from 'react';
import { X, Star, Loader2, ImageIcon } from 'lucide-react';
import { apiCall } from '../../api/apiCall';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const ReviewModal = ({ isOpen, onClose, product }) => {
    const { t, addToast } = useAppContext();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setRating(0); setHoverRating(0); setComment(""); setImages([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { addToast(`File ${file.name} is too large. Max 5MB.`); return; }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!product || !product.productId) return;
        setIsSubmitting(true);
        try {
            await apiCall(`/products/${product.productId}/reviews`, "POST", { 
                rating, 
                comment,
                images
            });
            addToast("Review submitted successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            addToast(err.message || "Failed to submit review.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 md:p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close"><X size={20} /></button>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{t('leaveReview')}</h3>
                <p className="text-sm text-stone-500 dark:text-slate-400 mb-6">Product: {product?.name}</p>

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

                <div className="mb-6">
                    <label className="cursor-pointer inline-flex items-center gap-2 border border-stone-300 dark:border-slate-600 rounded-lg px-4 py-2 hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors">
                        <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleImageChange} />
                        <ImageIcon size={18} className="text-stone-500" />
                        <span className="text-sm font-bold text-stone-600 dark:text-slate-300">Add Photos</span>
                    </label>
                    
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 p-3 bg-stone-50 dark:bg-slate-900/50 rounded-xl border border-stone-100 dark:border-slate-700">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-16 h-16">
                                    {img?.includes('.mp4') || img?.startsWith('data:video') ? (
                                        <video src={img} className="w-full h-full object-cover rounded-lg border border-stone-200 dark:border-slate-600" />
                                    ) : (
                                        <img src={img} alt="Upload preview" className="w-full h-full object-cover rounded-lg border border-stone-200 dark:border-slate-600" />
                                    )}
                                    <button 
                                        onClick={() => removeImage(i)} 
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full py-3.5 text-lg">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('submitReview')}
                </Button>
            </div>
        </div>
    );
};

export default ReviewModal;
