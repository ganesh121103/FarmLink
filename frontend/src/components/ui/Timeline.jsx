import React from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

// Timeline Item for Traceability
export const TimelineItem = ({ title, date, desc, done, active }) => (
    <div className="relative pl-6 pb-8 last:pb-0">
        <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${done ? 'bg-green-500' : active ? 'bg-yellow-500 animate-pulse' : 'bg-stone-300 dark:bg-slate-600'}`}></div>
        <h4 className={`font-bold text-base leading-none mb-1 ${done || active ? 'text-black dark:text-white' : 'text-stone-400 dark:text-slate-500'}`}>{title}</h4>
        <p className={`text-xs font-bold mb-1 ${active ? 'text-yellow-600' : 'text-green-600'}`}>{date}</p>
        <p className="text-sm text-stone-500 dark:text-slate-400">{desc}</p>
    </div>
);

// Customer Order Tracking Timeline
export const OrderTrackingTimeline = ({ status }) => {
    const stages = ['Placed', 'Shipped', 'Delivered'];
    const currentIndex = Math.max(0, stages.indexOf(status));

    const icons = [<Package size={18} />, <Truck size={18} />, <CheckCircle size={18} />];

    return (
        <div className="flex items-center w-full py-6 mt-4 border-t border-stone-100 dark:border-slate-700">
            {stages.map((stage, index) => {
                const isActive = index <= currentIndex;
                const isLast = index === stages.length - 1;

                return (
                    <React.Fragment key={stage}>
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-stone-200 dark:bg-slate-700 text-stone-400'}`}>
                                {icons[index]}
                            </div>
                            <span className={`text-xs md:text-sm font-bold mt-2 absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-green-700 dark:text-green-500' : 'text-stone-500 dark:text-slate-400'}`}>{stage}</span>
                        </div>
                        {!isLast && (
                            <div className={`flex-1 h-1.5 transition-colors duration-500 z-0 ${index < currentIndex ? 'bg-green-600' : 'bg-stone-200 dark:bg-slate-700'}`}></div>
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    );
};
