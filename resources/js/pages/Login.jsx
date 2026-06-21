import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError]         = useState('');
    const [submitting, setSubmitting] = useState(false);
    const login    = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Login failed.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-sm">
                <h1 className="mb-8 text-center text-2xl font-semibold text-slate-900 dark:text-white">
                    Project Tracker
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">Sign in</h2>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:ring-slate-700"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:ring-slate-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        No account?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
