import React from 'react';

const styles = {
    // project statuses
    active:      'bg-indigo-100 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20',
    completed:   'bg-green-100  text-green-700  ring-green-200  dark:bg-green-500/10  dark:text-green-400  dark:ring-green-500/20',
    archived:    'bg-slate-100  text-slate-600  ring-slate-200  dark:bg-slate-500/10  dark:text-slate-400  dark:ring-slate-500/20',
    // goal statuses
    not_started: 'bg-slate-100  text-slate-600  ring-slate-200  dark:bg-slate-500/10  dark:text-slate-400  dark:ring-slate-500/20',
    in_progress: 'bg-amber-100  text-amber-700  ring-amber-200  dark:bg-amber-500/10  dark:text-amber-400  dark:ring-amber-500/20',
    overdue:     'bg-red-100    text-red-700    ring-red-200    dark:bg-red-500/10    dark:text-red-400    dark:ring-red-500/20',
};

export default function StatusBadge({ status }) {
    const label = status.replace(/_/g, ' ');
    return (
        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${styles[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400'}`}>
            {label}
        </span>
    );
}
