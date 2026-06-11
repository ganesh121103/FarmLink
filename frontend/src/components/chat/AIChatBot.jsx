import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Bot, X, Send, ChevronDown, Sparkles, RotateCcw, Minimize2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
    resolveResponse, getRoleGreetings, getGlobalQuickReplies, BOT_NAME, BOT_AVATAR
} from './botKnowledge';

// ─── Markdown-lite renderer ────────────────────────────────────────────────
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            // Italic: _text_
            const italicParts = part.split(/(_[^_]+_)/g).map((ip, k) => {
                if (ip.startsWith('_') && ip.endsWith('_')) {
                    return <em key={k} className="text-green-300">{ip.slice(1, -1)}</em>;
                }
                return ip;
            });
            return <span key={j}>{italicParts}</span>;
        });

        const trimmed = line.trimStart();
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
            return (
                <div key={i} className="flex items-start gap-1.5 ml-1 my-0.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-green-400 flex-shrink-0" />
                    <span>{parts}</span>
                </div>
            );
        }
        if (/^\d+\./.test(trimmed)) {
            return <div key={i} className="ml-2 my-0.5">{parts}</div>;
        }
        if (trimmed === '') return <div key={i} className="h-1.5" />;
        return <div key={i} className="my-0.5">{parts}</div>;
    });
};

// ─── Typing Indicator ─────────────────────────────────────────────────────
const TypingIndicator = () => (
    <div className="flex items-end gap-2 self-start max-w-[85%]">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md text-sm">
            {BOT_AVATAR}
        </div>
        <div className="bg-white dark:bg-slate-700 border border-stone-100 dark:border-slate-600 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-500 inline-block"
                        style={{
                            animation: `botTypingBounce 1.2s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// ─── Message Bubble ────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onQuickReply }) => {
    const isBot = msg.sender === 'bot';
    return (
        <div className={`flex items-end gap-2 ${isBot ? 'self-start' : 'self-end flex-row-reverse'} max-w-[90%] animate-fadeInUp`}>
            {isBot && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md text-sm">
                    {BOT_AVATAR}
                </div>
            )}
            <div className="flex flex-col gap-2">
                <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        isBot
                            ? 'bg-white dark:bg-slate-700 text-stone-800 dark:text-slate-100 border border-stone-100 dark:border-slate-600 rounded-bl-sm'
                            : 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm'
                    }`}
                >
                    {isBot ? renderMarkdown(msg.text) : <p>{msg.text}</p>}
                    <span className={`text-[10px] mt-1.5 block ${isBot ? 'text-stone-400 dark:text-slate-500' : 'text-green-100 text-right'}`}>
                        {msg.time}
                    </span>
                </div>

                {/* Quick Reply Chips */}
                {isBot && msg.quickReplies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {msg.quickReplies.map((qr, i) => (
                            <button
                                key={i}
                                onClick={() => onQuickReply(qr)}
                                className="text-[11px] px-2.5 py-1 rounded-full border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/60 hover:border-green-500 transition-all font-medium whitespace-nowrap"
                            >
                                {qr}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main AIChatBot Component ──────────────────────────────────────────────
const AIChatBot = () => {
    const { user, language, t } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [showPulse, setShowPulse] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const getTime = () =>
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const buildWelcomeMessage = useCallback(() => {
        let text;
        const greetings = getRoleGreetings(language);
        if (user?.name && user?.role) {
            text = greetings[user.role]?.(user.name) || greetings.guest();
        } else {
            text = greetings.guest();
        }
        
        let initialReplies = getGlobalQuickReplies(language).slice(0, 4);

        return {
            id: 'welcome',
            sender: 'bot',
            text,
            time: getTime(),
            quickReplies: initialReplies,
        };
    }, [user?.name, user?.role, language]);

    // Initialize chat when opened for first time or when language changes
    useEffect(() => {
        if (isOpen) {
            setHasOpened(true);
            setShowPulse(false);
            setMessages([buildWelcomeMessage()]);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, language, buildWelcomeMessage]);

    // Auto-scroll
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isOpen, isMinimized]);

    // Listen for custom event to open chatbot externally (e.g. from VoiceAssistant)
    useEffect(() => {
        const handleExternalOpen = () => {
            setIsOpen(true);
            setIsMinimized(false);
        };
        window.addEventListener('farmlink:open-chatbot', handleExternalOpen);
        return () => window.removeEventListener('farmlink:open-chatbot', handleExternalOpen);
    }, []);

    const addBotMessage = (text, quickReplies) => {
        setMessages(prev => [...prev, {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text,
            time: getTime(),
            quickReplies: quickReplies || getGlobalQuickReplies(language),
        }]);
    };

    const sendMessage = useCallback((text) => {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        // Add user message
        setMessages(prev => [...prev, {
            id: `user_${Date.now()}`,
            sender: 'user',
            text: trimmed,
            time: getTime(),
        }]);
        setInput('');
        setIsTyping(true);

        // Simulate bot thinking
        const delay = 600 + Math.random() * 600;
        setTimeout(() => {
            const { response, quickReplies } = resolveResponse(trimmed, language);
            setIsTyping(false);
            addBotMessage(response, quickReplies);
        }, delay);
    }, [isTyping, language]);

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickReply = (text) => {
        sendMessage(text);
    };

    const handleReset = () => {
        setMessages([buildWelcomeMessage()]);
        setInput('');
        setIsTyping(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
    };

    const currentBotName = BOT_NAME[language] || BOT_NAME['en'];
    const placeholderText = language === 'hi' ? 'FarmLink के बारे में कुछ भी पूछें...' : (language === 'mr' ? 'FarmLink बद्दल काहीही विचारा...' : 'Ask me anything about FarmLink...');
    const poweredByText = language === 'hi' ? 'FarmLink AI द्वारा संचालित' : (language === 'mr' ? 'FarmLink AI द्वारे समर्थित' : 'Powered by FarmLink AI Assistant');
    const alwaysHereText = language === 'hi' ? 'हमेशा मदद के लिए यहाँ' : (language === 'mr' ? 'नेहमी मदतीसाठी येथे' : 'Always here to help');

    return (
        <>
            {/* ── Inline Keyframes ── */}
            <style>{`
                @keyframes botTypingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                    30% { transform: translateY(-5px); opacity: 1; }
                }
                @keyframes botSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes botPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
                    50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.3s ease-out forwards; }
                .bot-panel-open { animation: botSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .bot-btn-pulse { animation: botPulse 2.5s ease-in-out infinite; }
            `}</style>

            {/* ── Floating Bot Button ── */}
            {!isOpen && (
                <button
                    id="ai-chatbot-trigger"
                    onClick={handleOpen}
                    title={currentBotName}
                    className={`fixed bottom-6 left-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer ${showPulse ? 'bot-btn-pulse' : ''}`}
                    style={{ border: '2px solid rgba(255,255,255,0.25)' }}
                >
                    <Bot size={26} />
                    {showPulse && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                            <Sparkles size={9} className="text-yellow-800" />
                        </span>
                    )}
                </button>
            )}

            {/* ── Chat Panel ── */}
            {isOpen && (
                <div
                    id="ai-chatbot-panel"
                    className="fixed bottom-6 left-6 z-[90] w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col overflow-hidden bot-panel-open"
                    style={{ maxHeight: isMinimized ? 'auto' : '78vh' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                                {BOT_AVATAR}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                                    {currentBotName}
                                    <span className="text-[10px] bg-yellow-400/90 text-yellow-900 font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                        AI
                                    </span>
                                </h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                                    <span className="text-[10px] text-green-100">{alwaysHereText}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleReset}
                                title="Reset chat"
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <RotateCcw size={14} />
                            </button>
                            <button
                                onClick={() => setIsMinimized(m => !m)}
                                title={isMinimized ? 'Expand' : 'Minimize'}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                {isMinimized ? <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /> : <Minimize2 size={14} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Close"
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto px-3 py-4 bg-stone-50 dark:bg-slate-900 flex flex-col gap-3"
                                style={{ minHeight: '240px', maxHeight: '56vh' }}
                            >
                                {messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        msg={msg}
                                        onQuickReply={handleQuickReply}
                                    />
                                ))}
                                {isTyping && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggested chips (initial state) */}
                            {messages.length === 0 && (
                                <div className="px-3 pb-2 bg-stone-50 dark:bg-slate-900 flex flex-wrap gap-1.5">
                                    {getGlobalQuickReplies(language).slice(0, 4).map((qr, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickReply(qr)}
                                            className="text-[11px] px-2.5 py-1 rounded-full border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 transition-all"
                                        >
                                            {qr}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <form
                                onSubmit={handleSubmit}
                                className="p-3 bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 flex items-center gap-2 flex-shrink-0"
                            >
                                <input
                                    ref={inputRef}
                                    id="ai-chatbot-input"
                                    type="text"
                                    placeholder={placeholderText}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    disabled={isTyping}
                                    className="flex-1 bg-stone-100 dark:bg-slate-900 border-none rounded-full px-3.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-green-500 text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="p-2.5 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-full hover:from-green-500 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-green-500/30 active:scale-95"
                                >
                                    <Send size={15} />
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border-t border-stone-50 dark:border-slate-700/50 text-center">
                                <span className="text-[10px] text-stone-400 dark:text-slate-600 flex items-center justify-center gap-1">
                                    <Sparkles size={9} className="text-green-500" />
                                    {poweredByText}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default AIChatBot;
