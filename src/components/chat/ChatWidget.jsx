import React, { useState, useEffect, useRef } from 'react';
import { X, User, Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiCall } from '../../api/apiCall';

const ChatWidget = () => {
    const { activeChat, setActiveChat, user, socket } = useAppContext();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch chat history when a chat is opened
    useEffect(() => {
        if (!activeChat || !user) return;
        setLoading(true);
        setMessages([]);
        apiCall(`/chat/${activeChat.id}?userId=${user._id}`)
            .then(({ data }) => setMessages(data || []))
            .catch(() => setMessages([]))
            .finally(() => setLoading(false));
    }, [activeChat?.id, user?._id]);

    // Listen for incoming messages and deletions via Socket.IO
    useEffect(() => {
        const s = socket?.current;
        if (!s) return;

        const handleReceive = (msg) => {
            if (activeChat && (msg.senderId === activeChat.id || msg.receiverId === activeChat.id)) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleDelete = ({ messageId }) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        };

        s.on('receive_message', handleReceive);
        s.on('message_deleted', handleDelete);
        
        return () => {
            s.off('receive_message', handleReceive);
            s.off('message_deleted', handleDelete);
        };
    }, [socket?.current, activeChat?.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    if (!activeChat) return null;

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket?.current || !user) return;

        const messageData = {
            senderId: user._id,
            receiverId: activeChat.id,
            senderName: user.name,
            senderRole: user.role,
            text: input.trim(),
        };

        socket.current.emit('send_message', messageData);

        // Optimistically add the message to UI
        setMessages(prev => [...prev, {
            ...messageData,
            _id: `temp_${Date.now()}`,
            createdAt: new Date().toISOString(),
        }]);
        setInput("");
    };

    const deleteMessage = async (messageId) => {
        if (!messageId || messageId.startsWith('temp_')) return;
        try {
            await apiCall(`/chat/message/${messageId}?userId=${user._id}`, 'DELETE');
            setMessages(prev => prev.filter(m => m._id !== messageId));
            socket.current.emit('delete_message', { messageId, receiverId: activeChat.id });
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isMe = (msg) => msg.senderId === user?._id;

    return (
        <div className="fixed bottom-6 right-6 z-[85] w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in-up" style={{ maxHeight: '70vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {activeChat.image ? (
                            <img src={activeChat.image} alt={activeChat.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold leading-tight">{activeChat.name}</h4>
                        <span className="text-[10px] text-green-100 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            {activeChat.role === 'farmer' ? 'Farmer' : 'Customer'}
                        </span>
                    </div>
                </div>
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-slate-900 flex flex-col gap-3" style={{ minHeight: '280px', maxHeight: '50vh' }}>
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-green-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 dark:text-slate-500 gap-2">
                        <MessageSquare size={36} className="opacity-50" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Say hello to {activeChat.name}!</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center text-xs text-stone-400 font-medium mb-2">
                            💬 Chat with {activeChat.name}
                        </div>
                        {messages.map((msg, i) => (
                            <div key={msg._id || i} className={`group flex items-center gap-2 ${isMe(msg) ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                <div
                                    className={`max-w-xs rounded-2xl p-3 ${
                                        isMe(msg)
                                            ? 'bg-green-600 text-white rounded-br-sm'
                                            : 'bg-white dark:bg-slate-800 text-black dark:text-white rounded-bl-sm border border-stone-100 dark:border-slate-700 shadow-sm'
                                    }`}
                                >
                                    {!isMe(msg) && (
                                        <p className="text-[10px] font-bold text-green-700 dark:text-green-400 mb-0.5">
                                            {msg.senderName}
                                        </p>
                                    )}
                                    <p className="text-sm">{msg.text}</p>
                                    <span className={`text-[9px] mt-1 block ${isMe(msg) ? 'text-green-200 text-right' : 'text-stone-400'}`}>
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                                {isMe(msg) && msg._id && !msg._id.startsWith('temp_') && (
                                    <button 
                                        onClick={() => deleteMessage(msg._id)} 
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1.5 focus:outline-none"
                                        title="Delete Message"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 flex items-center gap-2 flex-shrink-0">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-stone-100 dark:bg-slate-900 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 text-black dark:text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWidget;
