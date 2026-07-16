import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useToastStore from '../store/toastStore';
import Layout from '../components/Layout';
import GoalCard from '../components/GoalCard';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

const TODAY = new Date().toISOString().split('T')[0];
const EMPTY_GOAL = { title: '', description: '', start_date: TODAY, deadline: '' };

const inputClass = 'w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:ring-slate-700';

function CreateGoalModal({ projectId, onClose }) {
    const createGoal = useProjectStore((s) => s.createGoal);
    const [form, setForm]         = useState(EMPTY_GOAL);
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
            await createGoal(projectId, form);
            onClose();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                setErrors({ title: [err.response?.data?.message ?? 'Failed to create goal.'] });
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
                <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">New goal</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Title</label>
                        <input type="text" {...field('title')} required placeholder="Goal title" className={inputClass} />
                        <FieldError name="title" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Description</label>
                        <textarea {...field('description')} rows={2} placeholder="Optional" className={`${inputClass} resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Start date</label>
                            <input type="date" {...field('start_date')} required className={inputClass} />
                            <FieldError name="start_date" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Deadline</label>
                            <input type="date" {...field('deadline')} required className={inputClass} />
                            <FieldError name="deadline" />
                        </div>
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

export default function ProjectDetail() {
    const { id } = useParams();
    const { currentProject, loading, error, fetchProject } = useProjectStore();
    const addToast = useToastStore((s) => s.add);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchProject(id); }, [id]);
    useEffect(() => { if (error) addToast(error); }, [error]);

    const goals = currentProject?.goals ?? [];

    const dateRange = currentProject
        ? currentProject.start_date + (currentProject.end_date ? ` → ${currentProject.end_date}` : '')
        : '';

    return (
        <Layout>
            {/* breadcrumb */}
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
                <Link to="/projects" className="hover:text-slate-900 transition-colors dark:hover:text-white">Projects</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-slate-300">{currentProject?.name ?? '…'}</span>
            </nav>

            {loading && (
                <div className="space-y-8">
                    <div className="rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 p-6 space-y-4">
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            )}

            {!loading && currentProject && (
                <>
                    {/* project header */}
                    <div className="mb-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{currentProject.name}</h1>
                                {currentProject.description && (
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentProject.description}</p>
                                )}
                            </div>
                            <StatusBadge status={currentProject.status} />
                        </div>

                        <ProgressBar value={currentProject.progress} className="mb-2" />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{currentProject.progress}% overall</span>
                            {dateRange && <span>{dateRange}</span>}
                        </div>
                    </div>

                    {/* goals section */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Goals</h2>
                            <p className="text-sm text-slate-500">
                                {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                        >
                            + New goal
                        </button>
                    </div>

                    {goals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <div className="mb-3 text-4xl">🎯</div>
                            <h3 className="mb-1 font-medium text-slate-900 dark:text-white">No goals yet</h3>
                            <p className="mb-6 text-sm text-slate-500">Break your project into goals to track progress.</p>
                            <button onClick={() => setShowModal(true)}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                                Add first goal
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
                        </div>
                    )}
                </>
            )}

            {showModal && currentProject && (
                <CreateGoalModal projectId={currentProject.id} onClose={() => setShowModal(false)} />
            )}
        </Layout>
    );
}
