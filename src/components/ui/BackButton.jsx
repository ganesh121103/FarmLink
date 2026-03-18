import React from 'react';
import { ArrowLeft, Zap } from 'lucide-react';

export const BackButton = ({ onClick }) => (
    <button onClick={onClick} aria-label="Go Back" className="flex items-center gap-2 mb-4 text-black dark:text-slate-200 hover:opacity-80 transition-opacity">
        <ArrowLeft size={20} /> Back
    </button>
);

export const SparklesIcon = () => <Zap size={14} className="mr-1 text-yellow-500" fill="currentColor" />;
