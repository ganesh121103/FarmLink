import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { parseSpeechCommand } from '../../utils/speechParser';

const VoiceAssistant = ({ products }) => {
    const { language, setLanguage, navigate, addToCart, addToast } = useAppContext();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        // Map language to speech recognition locales
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'mr': 'mr-IN'
        };
        recognition.lang = langMap[language] || 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error !== 'no-speech') {
                addToast('Voice recognition error: ' + event.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // Don't process immediately in onend if we are processing in handleResult
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    // Process transcript when listening stops and we have text
    useEffect(() => {
        let timeoutId;
        if (!isListening && transcript.trim()) {
            processCommand(transcript);
            // Clear transcript after a brief delay so user can read what was recognized
            timeoutId = setTimeout(() => {
                setTranscript('');
            }, 2500);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isListening, transcript]);

    const processCommand = (text) => {
        const { intent, view, product, query, langCode } = parseSpeechCommand(text, products);
        
        switch (intent) {
            case 'change_language': {
                setLanguage(langCode);
                const langName = langCode === 'hi' ? 'Hindi' : (langCode === 'mr' ? 'Marathi' : 'English');
                addToast(`Language changed to ${langName}`);
                break;
            }
            case 'navigate':
                navigate(view);
                addToast(`Navigating to ${view}...`);
                break;
            case 'add_to_cart':
                addToCart(product);
                // addToast is handled inside addToCart
                break;
            case 'search':
                navigate('products');
                // We will emit a custom event to update the search query globally
                window.dispatchEvent(new CustomEvent('farmlink:voice-search', { detail: query }));
                addToast(`Searching for "${query}"...`);
                break;
            default:
                addToast('Command not recognized. Try "Go to cart" or "Add tomato to cart".');
                break;
        }
    };

    const toggleListening = () => {
        if (!isSupported) {
            addToast('Voice recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error(e);
            }
        }
    };



    return (
        <>
            <style>{`
                @keyframes siriWave {
                    0%, 100% { transform: scaleY(0.2); opacity: 0.7; }
                    50% { transform: scaleY(1); opacity: 1; }
                }
                .siri-bar {
                    width: 6px;
                    border-radius: 9999px;
                    background: linear-gradient(to top, #4ade80, #059669);
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
                    animation: siriWave 1.2s ease-in-out infinite;
                }
                @media (min-width: 768px) {
                    .siri-bar { width: 8px; }
                }
            `}</style>

            <div className="relative group flex items-center">
                <button
                    onClick={toggleListening}
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                        isListening 
                            ? 'bg-green-50 text-green-500 dark:bg-green-900/30 dark:text-green-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                    aria-label={isListening ? "Listening..." : "Voice command"}
                    title="Voice Command"
                >
                    {isListening ? <Mic size={22} className="animate-pulse" /> : <Mic size={22} />}
                    {isListening && (
                        <span className="absolute inset-0 rounded-lg bg-green-400 opacity-25 animate-ping" />
                    )}
                </button>
            </div>

            {/* Premium Full-Screen Overlay */}
            {isListening && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-stone-950/85 backdrop-blur-xl transition-all duration-500"
                    onClick={(e) => {
                        // Close if clicked on background
                        if (e.target === e.currentTarget) {
                            recognitionRef.current?.stop();
                            setIsListening(false);
                            setTranscript('');
                        }
                    }}
                >
                    <button 
                        onClick={() => {
                            recognitionRef.current?.stop();
                            setIsListening(false);
                            setTranscript('');
                        }}
                        className="absolute top-6 right-6 text-white/50 hover:text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors shadow-lg"
                    >
                        <X size={28} />
                    </button>

                    <div className="flex flex-col items-center gap-12 max-w-4xl w-full px-6">
                        {/* Audio Wave Visualization */}
                        <div className="flex items-center justify-center gap-3 h-40">
                            {isListening ? (
                                <>
                                    <div className="siri-bar h-16" style={{ animationDelay: '0.1s' }} />
                                    <div className="siri-bar h-24" style={{ animationDelay: '0.3s' }} />
                                    <div className="siri-bar h-32" style={{ animationDelay: '0.0s' }} />
                                    <div className="siri-bar h-40" style={{ animationDelay: '0.4s' }} />
                                    <div className="siri-bar h-28" style={{ animationDelay: '0.2s' }} />
                                    <div className="siri-bar h-32" style={{ animationDelay: '0.5s' }} />
                                    <div className="siri-bar h-20" style={{ animationDelay: '0.15s' }} />
                                    <div className="siri-bar h-28" style={{ animationDelay: '0.35s' }} />
                                    <div className="siri-bar h-16" style={{ animationDelay: '0.25s' }} />
                                </>
                            ) : (
                                <div className="text-green-400 flex items-center justify-center h-full">
                                    <Loader2 size={64} className="animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Large Transcript Text */}
                        <p className="text-3xl md:text-5xl lg:text-6xl font-light text-white text-center leading-tight tracking-wide min-h-[160px] max-w-3xl px-4 filter drop-shadow-lg">
                            {transcript || (isListening ? 'Listening...' : 'Processing...')}
                        </p>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default VoiceAssistant;
