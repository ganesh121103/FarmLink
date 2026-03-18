import React from 'react';
import { AppProvider } from './context/AppContext';
import MainContent from './MainContent';
import Background from './components/ui/Background';
import ToastContainer from './components/ui/ToastContainer';

import './index.css';

export default function App() {
    return (
        <AppProvider>
            <div className="min-h-screen font-sans text-black dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-green-200 selection:text-green-900">
                <Background />
                <ToastContainer />
                <MainContent />
            </div>
            <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroZoom { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }

        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        .animate-hero-zoom { animation: heroZoom 25s alternate infinite ease-in-out; }
        .animate-shrink { animation: shrink linear forwards; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </AppProvider>
    );
}
