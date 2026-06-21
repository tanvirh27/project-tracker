<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->with('goals.tasks')
            ->get();

        $totalOverdueGoals = 0;

        $projectSummaries = $projects->map(function ($project) use (&$totalOverdueGoals) {
            $goals     = $project->goals;
            $completed = $goals->filter(fn ($g) => $g->status === 'completed')->count();
            $overdue   = $goals->filter(fn ($g) => $g->status === 'overdue')->count();
            $totalOverdueGoals += $overdue;

            return [
                'id'          => $project->id,
                'name'        => $project->name,
                'status'      => $project->status,
                'progress'    => $project->progress,
                'start_date'  => $project->start_date?->toDateString(),
                'end_date'    => $project->end_date?->toDateString(),
                'goal_counts' => [
                    'total'     => $goals->count(),
                    'completed' => $completed,
                    'overdue'   => $overdue,
                ],
            ];
        });

        $averageProgress = $projects->isEmpty()
            ? 0.0
            : round($projectSummaries->avg('progress'), 1);

        $allGoals = $projects->flatMap(fn ($p) => $p->goals);
        $allTasks = $allGoals->flatMap(fn ($g) => $g->tasks);

        return response()->json([
            'data' => [
                'average_progress' => $averageProgress,
                'stats'            => [
                    'total_projects'     => $projects->count(),
                    'active_projects'    => $projects->where('status', 'active')->count(),
                    'completed_projects' => $projects->where('status', 'completed')->count(),
                    'total_goals'        => $allGoals->count(),
                    'completed_goals'    => $allGoals->filter(fn ($g) => $g->status === 'completed')->count(),
                    'total_tasks'        => $allTasks->count(),
                    'completed_tasks'    => $allTasks->where('is_done', true)->count(),
                    'overdue_goals'      => $totalOverdueGoals,
                ],
                'projects' => $projectSummaries->values(),
            ],
        ]);
    }
}
