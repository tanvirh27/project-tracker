import React from 'react';

export default function ProgressRing({ value = 0, size = 160, strokeWidth = 12 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, value));
    const offset = circumference * (1 - clamped / 100);

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    className="stroke-slate-200 dark:stroke-slate-800"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="stroke-indigo-500"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{clamped}%</span>
                <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">avg progress</span>
            </div>
        </div>
    );
}
