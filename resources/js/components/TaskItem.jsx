import React from 'react';
import CategoryChip from './CategoryChip';
import useProjectStore from '../store/projectStore';

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isOverdue(iso, isDone) {
    if (isDone || !iso) return false;
    return new Date(iso) < new Date(new Date().toDateString());
}

export default function TaskItem({ task, onEdit }) {
    const toggleTask = useProjectStore((s) => s.toggleTask);
    const deleteTask = useProjectStore((s) => s.deleteTask);
    const overdue = isOverdue(task.deadline, task.is_done);

    function handleDelete(e) {
        e.stopPropagation();
        if (window.confirm(`Delete "${task.title}"?`)) {
            deleteTask(task.id);
        }
    }

    return (
        <div className={`group flex items-start gap-3 rounded-lg p-3 transition hover:bg-slate-100/80 dark:hover:bg-slate-800/50 ${overdue ? 'ring-1 ring-red-200 dark:ring-red-500/20' : ''}`}>
            {/* checkbox */}
            <button
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                    task.is_done
                        ? 'border-green-500 bg-green-500 text-white'
                        : overdue
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-slate-300 hover:border-indigo-500 dark:border-slate-600 dark:hover:border-indigo-500'
                }`}
            >
                {task.is_done && (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {/* content */}
            <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${task.is_done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                </p>
                {task.description && (
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{task.description}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {task.category && <CategoryChip category={task.category} />}
                    <span className={`text-xs ${overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
                        {overdue ? '⚠ ' : ''}{formatDate(task.deadline)}
                    </span>
                </div>
            </div>

            {/* actions */}
            <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
                <button
                    onClick={() => onEdit(task)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"
                    aria-label="Edit task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button
                    onClick={handleDelete}
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-red-400"
                    aria-label="Delete task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
