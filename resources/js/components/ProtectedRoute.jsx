import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
    const user    = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
                <span className="text-sm text-slate-500">Loading…</span>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}
