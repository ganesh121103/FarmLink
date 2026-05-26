import React, { useState, useRef } from 'react';
import { X, Upload, Video, Loader2 } from 'lucide-react';
import { apiCall } from '../../api/apiCall';
import { useAppContext } from '../../context/AppContext';

const UploadStoryModal = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useAppContext();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        // Check if it's a video
        if (!selected.type.startsWith('video/')) {
            addToast("Please select a video file.");
            return;
        }

        // Limit size to 10MB to be safe with MongoDB 16MB limit after Base64 encoding
        if (selected.size > 10 * 1024 * 1024) {
            addToast("Video is too large. Max size is 10MB.");
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            addToast("Please select a video.");
            return;
        }

        setLoading(true);
        try {
            const videoBase64 = await convertToBase64(file);
            
            await apiCall('/stories', 'POST', {
                videoUrl: videoBase64,
                caption
            });

            addToast("Story uploaded successfully!");
            onSuccess();
            onClose();
            
            // Reset
            setFile(null);
            setPreview(null);
            setCaption('');
        } catch (err) {
            addToast(err.message || "Failed to upload story.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-white flex items-center gap-2">
                        <Video className="text-green-600" />
                        Post a Story
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {/* Video Upload Area */}
                    {!preview ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-[9/16] max-h-[300px] border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-stone-700 dark:text-stone-300">Upload Video</p>
                                <p className="text-sm text-stone-500 mt-1">MP4, WebM (Max 10MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[9/16] max-h-[300px] rounded-2xl overflow-hidden relative bg-black">
                            <video src={preview} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                            <button 
                                type="button"
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Caption</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Describe your farm, crop, or process..."
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none text-stone-800 dark:text-white"
                            rows="3"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing & Uploading...
                            </>
                        ) : (
                            "Post Story"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadStoryModal;
