import React from 'react';
import useToastStore from '../store/toastStore';

export default function ToastContainer() {
    const { toasts, dismiss } = useToastStore();
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-100 flex flex-col gap-2"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-xl ring-1 max-w-sm ${
                        toast.type === 'error'
                            ? 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800/50'
                            : toast.type === 'success'
                            ? 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-950 dark:text-green-200 dark:ring-green-800/50'
                            : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                    }`}
                >
                    <span className="flex-1 leading-snug">{toast.message}</span>
                    <button
                        onClick={() => dismiss(toast.id)}
                        className="mt-0.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                        aria-label="Dismiss notification"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
