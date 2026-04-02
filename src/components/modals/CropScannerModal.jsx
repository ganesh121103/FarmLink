import React, { useState, useRef } from 'react';
import { X, Camera, Bot, AlertTriangle, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const CropScannerModal = ({ isOpen, onClose }) => {
    const { t, addToast } = useAppContext();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [scanError, setScanError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 800;
                    let width = img.width;
                    let height = img.height;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    setSelectedImage(compressedBase64);
                    handleScan(compressedBase64, 'image/jpeg');
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async (base64Data, mimeType) => {
        setScanning(true); setResult(null); setScanError(null);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD3oKVXraHDSGB-57B2HbnHRDgsJzhNDSE";
        const base64Clean = base64Data.split(',')[1];
        const prompt = `Analyze this image carefully. Task 1: Determine if the image contains a plant, leaf, crop, fruit, or vegetable. If it does NOT, return EXACTLY: {"error": "NOT_A_PLANT"}. Task 2: If it DOES contain a plant, analyze its health and return EXACTLY: {"disease": "Name or 'Healthy'", "confidence": "e.g. '92%'", "treatment": "Short actionable advice"}`;

        let success = false, attempt = 0, apiResult = null, lastError = '';
        const delays = [1000, 2000];
        while (!success && attempt < 2) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Clean } }] }] })
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    throw new Error(lastError);
                }
                const data = await res.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("Empty response from AI");
                text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                apiResult = JSON.parse(text); success = true;
            } catch (err) { lastError = err.message; attempt++; if (attempt < 2) await new Promise(r => setTimeout(r, delays[attempt - 1])); }
        }
        setScanning(false);
        if (success && apiResult) {
            if (apiResult.error === "NOT_A_PLANT" || apiResult.error) {
                setScanError("No plant or crop detected. Please upload a clear photo of a leaf, plant, or vegetable.");
            } else {
                setResult({ disease: apiResult.disease || "Unknown Status", confidence: apiResult.confidence || "N/A", treatment: apiResult.treatment || "Consult an agricultural expert." });
                addToast("AI Analysis Complete!");
            }
        } else { setScanError(`AI analysis failed: ${lastError || 'Unable to reach servers. Check your API key.'}`) }
    };

    const handleClose = () => { setScanning(false); setResult(null); setSelectedImage(null); setScanError(null); onClose(); };
    const resetScanner = () => { setResult(null); setSelectedImage(null); setScanError(null); };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full"><X size={20} /></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><Bot size={24} /></div>
                    <h2 className="text-2xl font-black text-black dark:text-white">{t('cropScanner')}</h2>
                </div>

                {!result && !scanning && !scanError && (
                    <div className="border-2 border-dashed border-stone-300 dark:border-slate-600 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                        <Camera size={48} className="text-stone-400 mb-4" />
                        <p className="font-bold text-stone-700 dark:text-slate-300 mb-1">Tap to Upload Photo</p>
                        <p className="text-xs text-stone-500">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                )}

                {scanning && (
                    <div className="py-16 flex flex-col items-center justify-center text-center relative rounded-2xl overflow-hidden border border-stone-100 dark:border-slate-700">
                        {selectedImage && <img src={selectedImage} alt="Crop Upload" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />}
                        <div className="relative z-10 mb-6">
                            <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                            <Bot size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-black dark:text-white animate-pulse relative z-10">{t('aiScanning')}</h3>
                    </div>
                )}

                {scanError && (
                    <div className="space-y-4 animate-fade-in-up text-center">
                        {selectedImage && <div className="h-32 w-full rounded-2xl overflow-hidden relative mb-4 border border-stone-200 dark:border-slate-700 shadow-sm opacity-50 grayscale"><img src={selectedImage} alt="Rejected upload" className="w-full h-full object-cover" /></div>}
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-lg mb-2">Invalid Image</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300">{scanError}</p>
                        </div>
                        <Button onClick={resetScanner} variant="outline" className="w-full mt-4">Try Another Photo</Button>
                    </div>
                )}

                {result && (
                    <div className="space-y-4 animate-fade-in-up">
                        {selectedImage && (
                            <div className="h-32 w-full rounded-2xl overflow-hidden relative mb-4 border border-stone-200 dark:border-slate-700 shadow-sm">
                                <img src={selectedImage} alt="Scanned Crop" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <span className="text-white text-sm font-bold flex items-center gap-2"><Sparkles size={14} /> Analyzed Crop Photo</span>
                                </div>
                            </div>
                        )}
                        <div className={`p-5 rounded-2xl border ${result.disease.toLowerCase() === 'healthy' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold uppercase tracking-wider ${result.disease.toLowerCase() === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>Detected Status</span>
                                <Badge color={result.disease.toLowerCase() === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{result.confidence} Match</Badge>
                            </div>
                            <p className={`font-black text-lg ${result.disease.toLowerCase() === 'healthy' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{result.disease}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-stone-100 dark:border-slate-700">
                            <span className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-2 block">AI Suggested Treatment</span>
                            <p className="text-sm font-medium text-stone-800 dark:text-slate-300 leading-relaxed">{result.treatment}</p>
                        </div>
                        <Button onClick={resetScanner} variant="outline" className="w-full mt-4">Scan Another Plant</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropScannerModal;
