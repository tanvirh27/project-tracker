import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useToastStore from '../store/toastStore';
import Layout from '../components/Layout';
import TaskTimeline from '../components/TaskTimeline';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { Skeleton } from '../components/Skeleton';

const inputClass = 'w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:ring-slate-700';

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function deriveGoalStatus(goal) {
    if (!goal) return 'not_started';
    const tasks    = goal.tasks ?? [];
    const total    = tasks.length;
    const done     = tasks.filter((t) => t.is_done).length;
    const progress = total === 0 ? 0 : done / total * 100;
    if (progress === 100) return 'completed';
    if (goal.deadline && new Date(goal.deadline) < new Date(new Date().toDateString())) return 'overdue';
    if (progress === 0) return 'not_started';
    return 'in_progress';
}

function deriveProgress(goal) {
    if (!goal) return 0;
    const tasks = goal.tasks ?? [];
    const total = tasks.length;
    if (total === 0) return 0;
    return Math.round(tasks.filter((t) => t.is_done).length / total * 1000) / 10;
}

// ─── Task form ────────────────────────────────────────────────────────────────
const EMPTY_TASK = { title: '', description: '', deadline: '', category_id: '' };

function TaskForm({ goalId, categories, initial, onSave, onCancel }) {
    const [form, setForm]         = useState(initial ?? EMPTY_TASK);
    const [errors, setErrors]     = useState({});
    const [submitting, setSubmitting] = useState(false);
    const createTask = useProjectStore((s) => s.createTask);
    const updateTask = useProjectStore((s) => s.updateTask);

    function field(key) {
        return { value: form[key] ?? '', onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const payload = { ...form, category_id: form.category_id || null };
            if (initial?.id) await updateTask(initial.id, payload);
            else             await createTask(goalId, payload);
            onSave();
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
            else setErrors({ title: [err.response?.data?.message ?? 'Failed to save task.'] });
        } finally {
            setSubmitting(false);
        }
    }

    function FieldError({ name }) {
        const msg = errors[name]?.[0];
        return msg ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{msg}</p> : null;
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 ring-1 ring-slate-200 space-y-3 dark:bg-slate-900 dark:ring-slate-800">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input type="text" {...field('title')} required placeholder="Task title" className={inputClass} />
                    <FieldError name="title" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                        Deadline <span className="text-red-500">*</span>
                    </label>
                    <input type="date" {...field('deadline')} required className={inputClass} />
                    <FieldError name="deadline" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                    <select {...field('category_id')} className={inputClass}>
                        <option value="">No category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
                    <textarea {...field('description')} rows={2} placeholder="Optional"
                        className={`${inputClass} resize-none`}
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={onCancel}
                    className="flex-1 rounded-lg bg-slate-100 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    Cancel
                </button>
                <button type="submit" disabled={submitting}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                    {submitting ? 'Saving…' : initial?.id ? 'Save changes' : 'Add task'}
                </button>
            </div>
        </form>
    );
}

// ─── Category quick-create ────────────────────────────────────────────────────
const PRESET_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#0ea5e9', '#ec4899', '#ef4444', '#8b5cf6', '#14b8a6'];

function CategoryForm({ onSave, onCancel }) {
    const [name, setName]     = useState('');
    const [color, setColor]   = useState(PRESET_COLORS[0]);
    const [submitting, setSubmitting] = useState(false);
    const createCategory = useProjectStore((s) => s.createCategory);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try { await createCategory({ name, color }); onSave(); }
        catch { /* non-critical */ }
        finally { setSubmitting(false); }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 ring-1 ring-slate-200 space-y-3 dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">New category</h3>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="Category name" className={inputClass} />
            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full transition ring-2 ${color === c ? 'ring-white ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : 'ring-transparent'}`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={onCancel}
                    className="flex-1 rounded-lg bg-slate-100 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    Cancel
                </button>
                <button type="submit" disabled={submitting}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                    {submitting ? 'Creating…' : 'Create'}
                </button>
            </div>
        </form>
    );
}

// ─── Goal edit form (inline) ──────────────────────────────────────────────────
function GoalEditForm({ goal, onSave, onCancel }) {
    const updateGoal = useProjectStore((s) => s.updateGoal);
    const addToast   = useToastStore((s) => s.add);
    const [form, setForm]         = useState({
        title:       goal.title,
        description: goal.description ?? '',
        start_date:  goal.start_date ?? '',
        deadline:    goal.deadline ?? '',
    });
    const [submitting, setSubmitting] = useState(false);

    function field(key) {
        return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateGoal(goal.id, form);
            onSave();
        } catch (err) {
            addToast(err.response?.data?.message ?? 'Failed to update goal.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Goal title</label>
                <input type="text" {...field('title')} required className={inputClass} />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
                <textarea {...field('description')} rows={2} placeholder="Optional" className={`${inputClass} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Start date</label>
                    <input type="date" {...field('start_date')} required className={inputClass} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Deadline</label>
                    <input type="date" {...field('deadline')} required className={inputClass} />
                </div>
            </div>
            <div className="flex gap-2 pt-1">
                <button type="button" onClick={onCancel}
                    className="flex-1 rounded-lg bg-slate-100 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    Cancel
                </button>
                <button type="submit" disabled={submitting}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                    {submitting ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </form>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function GoalDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 p-6 space-y-4">
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="mt-4 h-2.5 w-2.5 rounded-full shrink-0" />
                        <Skeleton className="h-14 flex-1 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        currentGoal, categories, loading, error,
        fetchGoal, fetchCategories, updateGoal, deleteGoal,
    } = useProjectStore();
    const addToast = useToastStore((s) => s.add);

    const [showTaskForm, setShowTaskForm]       = useState(false);
    const [editingTask, setEditingTask]         = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingGoal, setEditingGoal]         = useState(false);

    useEffect(() => { fetchGoal(id); fetchCategories(); }, [id]);
    useEffect(() => { if (error) addToast(error); }, [error]);

    const liveStatus   = useMemo(() => deriveGoalStatus(currentGoal), [currentGoal]);
    const liveProgress = useMemo(() => deriveProgress(currentGoal), [currentGoal]);

    async function handleDeleteGoal() {
        if (!window.confirm(`Delete "${currentGoal.title}" and all its tasks? This cannot be undone.`)) return;
        try {
            await deleteGoal(currentGoal.id);
            navigate(currentGoal.project_id ? `/projects/${currentGoal.project_id}` : '/projects');
        } catch {
            addToast('Failed to delete goal.');
        }
    }

    return (
        <Layout maxWidth="max-w-3xl">
            {/* breadcrumb */}
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
                <Link to="/projects" className="hover:text-slate-900 transition-colors dark:hover:text-white">Projects</Link>
                <span>/</span>
                {currentGoal?.project_id && (
                    <>
                        <Link to={`/projects/${currentGoal.project_id}`} className="hover:text-slate-900 transition-colors dark:hover:text-white">
                            Project
                        </Link>
                        <span>/</span>
                    </>
                )}
                <span className="text-slate-900 dark:text-slate-300">{currentGoal?.title ?? '…'}</span>
            </nav>

            {loading && <GoalDetailSkeleton />}

            {!loading && currentGoal && (
                <>
                    {/* goal header */}
                    <div className="mb-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        {editingGoal ? (
                            <GoalEditForm
                                goal={currentGoal}
                                onSave={() => setEditingGoal(false)}
                                onCancel={() => setEditingGoal(false)}
                            />
                        ) : (
                            <>
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{currentGoal.title}</h1>
                                        {currentGoal.description && (
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentGoal.description}</p>
                                        )}
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            {formatDate(currentGoal.start_date)} → {formatDate(currentGoal.deadline)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <StatusBadge status={liveStatus} />
                                        <button
                                            onClick={() => setEditingGoal(true)}
                                            title="Edit goal"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleDeleteGoal}
                                            title="Delete goal"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <ProgressBar value={liveProgress} className="mb-1.5" />
                                <p className="text-xs text-slate-500">{liveProgress}% complete</p>
                            </>
                        )}
                    </div>

                    {/* tasks section */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Tasks
                            <span className="ml-2 text-sm font-normal text-slate-500">
                                {(currentGoal.tasks ?? []).filter((t) => t.is_done).length}/{(currentGoal.tasks ?? []).length}
                            </span>
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowCategoryForm((v) => !v); setShowTaskForm(false); setEditingTask(null); }}
                                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                + Category
                            </button>
                            <button
                                onClick={() => { setShowTaskForm((v) => !v); setEditingTask(null); setShowCategoryForm(false); }}
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                            >
                                + Add task
                            </button>
                        </div>
                    </div>

                    {showCategoryForm && (
                        <div className="mb-4">
                            <CategoryForm onSave={() => setShowCategoryForm(false)} onCancel={() => setShowCategoryForm(false)} />
                        </div>
                    )}

                    {showTaskForm && !editingTask && (
                        <div className="mb-4">
                            <TaskForm
                                goalId={currentGoal.id}
                                categories={categories}
                                onSave={() => setShowTaskForm(false)}
                                onCancel={() => setShowTaskForm(false)}
                            />
                        </div>
                    )}

                    {editingTask && (
                        <div className="mb-4">
                            <TaskForm
                                goalId={currentGoal.id}
                                categories={categories}
                                initial={editingTask}
                                onSave={() => setEditingTask(null)}
                                onCancel={() => setEditingTask(null)}
                            />
                        </div>
                    )}

                    {!showTaskForm && !editingTask && (currentGoal.tasks ?? []).length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-12 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <div className="mb-3 text-3xl">✅</div>
                            <h3 className="mb-1 text-sm font-medium text-slate-900 dark:text-white">No tasks yet</h3>
                            <p className="mb-4 text-xs text-slate-500">Add tasks to track progress toward this goal.</p>
                            <button onClick={() => setShowTaskForm(true)}
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
                                Add first task
                            </button>
                        </div>
                    )}

                    {(currentGoal.tasks ?? []).length > 0 && (
                        <TaskTimeline
                            tasks={currentGoal.tasks ?? []}
                            onEdit={(task) => {
                                setEditingTask({ ...task, category_id: task.category_id ?? '', deadline: task.deadline ?? '' });
                                setShowTaskForm(false);
                                setShowCategoryForm(false);
                            }}
                        />
                    )}
                </>
            )}
        </Layout>
    );
}
