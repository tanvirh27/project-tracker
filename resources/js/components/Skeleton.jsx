import React from 'react';

export function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 p-5 space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col items-center gap-6 rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 p-6 sm:flex-row">
                <div className="h-40 w-40 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="grid w-full grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 space-y-2">
                            <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-8 w-10 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    );
}
