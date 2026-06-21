import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

function SunIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    );
}

export default function Layout({ children, maxWidth = 'max-w-5xl' }) {
    const { user, logout } = useAuthStore();
    const { dark, toggle } = useThemeStore();
    const { pathname } = useLocation();

    function navClass(path) {
        const active = pathname === path || (path !== '/' && pathname.startsWith(path));
        return `rounded-md px-2.5 py-1 text-sm transition-colors ${
            active
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
        }`;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-950/90">
                <div className={`mx-auto flex ${maxWidth} items-center justify-between`}>
                    <nav className="flex items-center gap-1">
                        <Link to="/" className="mr-2 text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                            Project Tracker
                        </Link>
                        <Link to="/" className={navClass('/')}>Dashboard</Link>
                        <Link to="/projects" className={navClass('/projects')}>Projects</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggle}
                            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            {dark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <span className="hidden text-sm text-slate-500 dark:text-slate-500 sm:block">{user?.name}</span>
                        <button
                            onClick={logout}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>
            <main className={`mx-auto ${maxWidth} px-4 py-6 sm:px-6 sm:py-8`}>
                {children}
            </main>
        </div>
    );
}
