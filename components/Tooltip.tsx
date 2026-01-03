import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    const [visible, setVisible] = useState(false);

    const posClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div
            className="relative flex items-center group cursor-help"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div className={`absolute z-[100] px-3 py-1.5 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl border border-white/10 whitespace-nowrap animate-fade-in ${posClasses[position]}`}>
                    {content}
                    {/* Arrow */}
                    <div className={`absolute border-4 border-transparent ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-800' :
                            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-800' :
                                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-800' :
                                    'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-800'
                        }`}></div>
                </div>
            )}
        </div>
    );
};
