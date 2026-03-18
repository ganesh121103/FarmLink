import React, { useState, useEffect, useRef } from 'react';
import { X, User, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ChatWidget = () => {
    const { activeChat, setActiveChat } = useAppContext();
    const [messages, setMessages] = useState([
        { text: "Hi there! I'm interested in buying your organic carrots in bulk. Are they harvested today?", sender: 'me', time: '10:00 AM' },
        { text: "Hello! Yes, they were harvested early this morning. How many KGs do you need?", sender: 'farmer', time: '10:05 AM' }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeChat]);

    if (!activeChat) return null;

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "Thanks for the message! I'll get back to you shortly as I'm out in the fields right now.", sender: 'farmer', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }, 2000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[85] w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in-up">
            <div className="bg-green-700 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><User size={20} /></div>
                    <div>
                        <h4 className="font-bold leading-tight">{activeChat.name}</h4>
                        <span className="text-[10px] text-green-100 flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Online</span>
                    </div>
                </div>
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="h-80 overflow-y-auto p-4 bg-stone-50 dark:bg-slate-900 flex flex-col gap-4">
                <div className="text-center text-xs text-stone-400 font-medium mb-2">Secure end-to-end encrypted chat</div>
                {messages.map((msg, i) => (
                    <div key={i} className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'me' ? 'bg-green-600 text-white self-end rounded-br-sm' : 'bg-white dark:bg-slate-800 text-black dark:text-white self-start rounded-bl-sm border border-stone-100 dark:border-slate-700 shadow-sm'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <span className={`text-[9px] mt-1 block ${msg.sender === 'me' ? 'text-green-200 text-right' : 'text-stone-400'}`}>{msg.time}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-stone-100 dark:bg-slate-900 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 text-black dark:text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" disabled={!input.trim()} className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWidget;
