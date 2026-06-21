import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Register() {
    const [form, setForm]           = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [errors, setErrors]       = useState({});
    const [submitting, setSubmitting] = useState(false);
    const register = useAuthStore((s) => s.register);
    const navigate = useNavigate();

    function field(key) {
        return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            await register(form.name, form.email, form.password, form.password_confirmation);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                setErrors({ general: err.response?.data?.message ?? 'Registration failed.' });
            }
        } finally {
            setSubmitting(false);
        }
    }

    function FieldError({ name }) {
        const msg = errors[name]?.[0];
        return msg ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{msg}</p> : null;
    }

    const inputClass = 'w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:ring-slate-700';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-sm">
                <h1 className="mb-8 text-center text-2xl font-semibold text-slate-900 dark:text-white">
                    Project Tracker
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">Create account</h2>

                    {errors.general && (
                        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            {errors.general}
                        </p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Name</label>
                        <input type="text" {...field('name')} required autoComplete="name" className={inputClass} />
                        <FieldError name="name" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Email</label>
                        <input type="email" {...field('email')} required autoComplete="email" className={inputClass} />
                        <FieldError name="email" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Password</label>
                        <input type="password" {...field('password')} required autoComplete="new-password" className={inputClass} />
                        <FieldError name="password" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Confirm password</label>
                        <input type="password" {...field('password_confirmation')} required autoComplete="new-password" className={inputClass} />
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                        {submitting ? 'Creating account…' : 'Create account'}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
