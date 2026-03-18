import React from 'react';
import Card from './Card';

export const ProductSkeleton = () => (
    <Card className="overflow-hidden flex flex-col h-full border-transparent animate-pulse">
        <div className="h-48 md:h-56 bg-stone-200 dark:bg-slate-700 w-full"></div>
        <div className="p-5 flex-1 flex flex-col gap-3">
            <div className="h-6 bg-stone-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="mt-auto pt-4 border-t border-stone-100 dark:border-slate-700 flex items-center justify-between">
                <div className="h-8 bg-stone-200 dark:bg-slate-700 rounded w-16"></div>
                <div className="h-10 w-10 bg-stone-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
        </div>
    </Card>
);

export const FarmerSkeleton = () => (
    <Card className="p-6 flex flex-col border-transparent h-full animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-stone-200 dark:bg-slate-700 rounded-full shrink-0"></div>
            <div className="flex flex-col gap-2 w-full">
                <div className="h-6 bg-stone-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
        </div>
        <div className="space-y-2 mb-4 flex-1">
            <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-slate-700 mt-auto">
            <div className="h-6 bg-stone-200 dark:bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-12"></div>
        </div>
    </Card>
);
