import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import ProgressRing from '../components/ProgressRing';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import { SkeletonDashboard } from '../components/Skeleton';
import useToastStore from '../store/toastStore';

function StatBox({ label, value, sub, variant = 'default' }) {
    const colors = {
        default: 'text-slate-900 dark:text-white',
        indigo:  'text-indigo-600 dark:text-indigo-400',
        red:     'text-red-600 dark:text-red-400',
        green:   'text-green-600 dark:text-green-400',
    };
    return (
        <div className="rounded-xl bg-slate-100 p-4 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700/50">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${colors[variant]}`}>{value}</p>
            {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

function DashboardProjectCard({ project }) {
    const navigate = useNavigate();
    const overdue = project.goal_counts?.overdue > 0;

    return (
        <div
            onClick={() => navigate(`/projects/${project.id}`)}
            className={`group flex cursor-pointer flex-col gap-3 rounded-xl p-5 ring-1 transition hover:ring-slate-400 dark:hover:ring-slate-500 ${
                overdue
                    ? 'bg-red-50 ring-red-200 dark:bg-red-950/20 dark:ring-red-900/50'
                    : 'bg-white ring-slate-200 dark:bg-slate-900 dark:ring-slate-800'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="truncate font-medium text-slate-900 dark:text-white">{project.name}</h3>
                <StatusBadge status={project.status} />
            </div>

            <div className="space-y-1.5">
                <ProgressBar value={project.progress} />
                <p className="text-xs text-slate-500">{project.progress}% complete</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{project.goal_counts?.total ?? 0} goals</span>
                {project.goal_counts?.completed > 0 && (
                    <span className="text-green-600 dark:text-green-500">
                        {project.goal_counts.completed} done
                    </span>
                )}
                {overdue && (
                    <span className="font-medium text-red-600 dark:text-red-400">
                        ⚠ {project.goal_counts.overdue} overdue
                    </span>
                )}
            </div>

            {(project.start_date || project.end_date) && (
                <p className="text-xs text-slate-400">
                    {project.start_date}{project.end_date ? ` → ${project.end_date}` : ''}
                </p>
            )}
        </div>
    );
}

export default function Dashboard() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.add);

    useEffect(() => {
        api.get('/dashboard')
            .then((res) => setData(res.data.data))
            .catch(() => addToast('Failed to load dashboard. Please refresh.'))
            .finally(() => setLoading(false));
    }, []);

    const goalPct = data && data.stats.total_goals > 0
        ? Math.round(data.stats.completed_goals / data.stats.total_goals * 100)
        : 0;
    const taskPct = data && data.stats.total_tasks > 0
        ? Math.round(data.stats.completed_tasks / data.stats.total_tasks * 100)
        : 0;

    return (
        <Layout>
            {loading && <SkeletonDashboard />}

            {!loading && data && (
                <>
                    {/* overview hero */}
                    <div className="mb-6 flex flex-col items-center gap-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:flex-row sm:gap-8">
                        <div className="flex shrink-0 flex-col items-center">
                            <ProgressRing value={Math.round(data.average_progress)} size={140} strokeWidth={10} />
                            <p className="mt-2 text-xs text-slate-500">Across all projects</p>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-3">
                            <StatBox
                                label="Projects"
                                value={data.stats.total_projects}
                                sub={`${data.stats.active_projects} active · ${data.stats.completed_projects} done`}
                            />
                            <StatBox
                                label="Goals"
                                value={data.stats.total_goals}
                                sub={`${data.stats.completed_goals} completed (${goalPct}%)`}
                                variant={data.stats.overdue_goals > 0 ? 'default' : 'green'}
                            />
                            <StatBox
                                label="Tasks"
                                value={data.stats.total_tasks}
                                sub={`${data.stats.completed_tasks} done (${taskPct}%)`}
                                variant="indigo"
                            />
                            <StatBox
                                label="Overdue goals"
                                value={data.stats.overdue_goals}
                                sub="need attention"
                                variant={data.stats.overdue_goals > 0 ? 'red' : 'default'}
                            />
                        </div>
                    </div>

                    {/* project grid */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Projects</h2>
                        <Link
                            to="/projects"
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                        >
                            + New project
                        </Link>
                    </div>

                    {data.projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <div className="mb-4 text-4xl">📋</div>
                            <h3 className="mb-1 font-medium text-slate-900 dark:text-white">No projects yet</h3>
                            <p className="mb-6 text-sm text-slate-500">
                                Create your first project to start tracking progress.
                            </p>
                            <Link
                                to="/projects"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                            >
                                Create a project
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.projects.map((project) => (
                                <DashboardProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
}
