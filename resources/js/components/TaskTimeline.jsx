import React from 'react';
import TaskItem from './TaskItem';

export default function TaskTimeline({ tasks, onEdit }) {
    if (!tasks || tasks.length === 0) return null;

    const sorted = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return (
        <div className="relative">
            {/* vertical line */}
            <div className="absolute left-5.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="space-y-1">
                {sorted.map((task) => {
                    const overdue = !task.is_done && task.deadline && new Date(task.deadline) < new Date(new Date().toDateString());
                    return (
                        <div key={task.id} className="flex items-start gap-3">
                            {/* timeline dot */}
                            <div className="relative z-10 mt-3.5 shrink-0">
                                <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-950 ${
                                    task.is_done
                                        ? 'bg-green-500'
                                        : overdue
                                        ? 'bg-red-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`} />
                            </div>

                            {/* task card */}
                            <div className="flex-1 min-w-0">
                                <TaskItem task={task} onEdit={onEdit} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
