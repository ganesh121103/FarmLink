import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// Upgraded Toast with Shrinking Progress Bar
const ToastContainer = () => {
    const { toasts } = useAppContext();
    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="bg-stone-800 dark:bg-slate-800 text-white rounded-lg shadow-xl flex flex-col animate-fade-in-up border-l-4 border-green-500 pointer-events-auto overflow-hidden min-w-[280px]">
                    <div className="px-6 py-4 flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-400" /> <span className="font-medium">{toast.message}</span>
                    </div>
                    {/* 3000ms animation matches the timeout in context */}
                    <div className="h-1 w-full bg-green-900/50">
                        <div className="h-full bg-green-500 animate-shrink" style={{ animationDuration: '3s' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
