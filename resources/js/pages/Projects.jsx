import React, { useEffect, useState } from 'react';
import useProjectStore from '../store/projectStore';
import useToastStore from '../store/toastStore';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import { SkeletonCard } from '../components/Skeleton';

const STATUS_OPTIONS = ['active', 'completed', 'archived'];

const EMPTY_FORM = { name: '', description: '', start_date: '', end_date: '', status: 'active' };

const inputClass = 'w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:ring-slate-700';

function CreateModal({ onClose }) {
    const createProject = useProjectStore((s) => s.createProject);
    const [form, setForm]         = useState(EMPTY_FORM);
    const [errors, setErrors]     = useState({});
    const [submitting, setSubmitting] = useState(false);

    function field(key) {
        return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            await createProject({ ...form, end_date: form.end_date || null });
            onClose();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                setErrors({ name: [err.response?.data?.message ?? 'Failed to create project.'] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    function FieldError({ name }) {
        const msg = errors[name]?.[0];
        return msg ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{msg}</p> : null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">New project</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Name</label>
                        <input type="text" {...field('name')} required placeholder="Project name" className={inputClass} />
                        <FieldError name="name" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Description</label>
                        <textarea {...field('description')} rows={2} placeholder="Optional"
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Start date</label>
                            <input type="date" {...field('start_date')} required className={inputClass} />
                            <FieldError name="start_date" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                                End date <span className="text-slate-400">(optional)</span>
                            </label>
                            <input type="date" {...field('end_date')} className={inputClass} />
                            <FieldError name="end_date" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Status</label>
                        <select {...field('status')} className={inputClass}>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 rounded-lg bg-slate-100 py-2.5 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                            {submitting ? 'Creating…' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Projects() {
    const { projects, loading, error, fetchProjects } = useProjectStore();
    const addToast = useToastStore((s) => s.add);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchProjects(); }, []);
    useEffect(() => { if (error) addToast(error); }, [error]);

    return (
        <Layout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Projects</h1>
                    {!loading && (
                        <p className="mt-0.5 text-sm text-slate-500">
                            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    + New project
                </button>
            </div>

            {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && !error && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="mb-4 text-4xl">📁</div>
                    <h3 className="mb-1 font-medium text-slate-900 dark:text-white">No projects yet</h3>
                    <p className="mb-6 text-sm text-slate-500">Get started by creating your first project.</p>
                    <button onClick={() => setShowModal(true)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                        Create your first project
                    </button>
                </div>
            )}

            {!loading && projects.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
                </div>
            )}

            {showModal && <CreateModal onClose={() => setShowModal(false)} />}
        </Layout>
    );
}
