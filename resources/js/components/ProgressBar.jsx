import React from 'react';

export default function ProgressBar({ value = 0, className = '' }) {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className={`h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}>
            <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}
