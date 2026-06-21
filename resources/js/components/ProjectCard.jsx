import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import useProjectStore from '../store/projectStore';

function formatDate(iso) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project }) {
    const navigate = useNavigate();
    const deleteProject = useProjectStore((s) => s.deleteProject);

    function handleDelete(e) {
        e.stopPropagation();
        if (window.confirm(`Delete "${project.name}"?`)) {
            deleteProject(project.id);
        }
    }

    const start = formatDate(project.start_date);
    const end   = formatDate(project.end_date);
    const dateRange = start && end ? `${start} → ${end}` : start ? `From ${start}` : null;

    return (
        <div
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group relative flex cursor-pointer flex-col gap-3 rounded-xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-slate-400 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-slate-600"
        >
            {/* delete button */}
            <button
                onClick={handleDelete}
                className="absolute right-4 top-4 hidden rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 group-hover:flex dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                aria-label="Delete project"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>

            {/* header */}
            <div className="flex items-start justify-between gap-4 pr-6">
                <h3 className="truncate font-medium text-slate-900 dark:text-white">{project.name}</h3>
                <StatusBadge status={project.status} />
            </div>

            {project.description && (
                <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
            )}

            {/* progress */}
            <div className="space-y-1.5">
                <ProgressBar value={project.progress} />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>{project.progress}% complete</span>
                    {dateRange && <span className="text-slate-400 dark:text-slate-600">{dateRange}</span>}
                </div>
            </div>
        </div>
    );
}
