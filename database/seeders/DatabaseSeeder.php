<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Goal;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::factory()->create([
            'name'  => 'Demo User',
            'email' => 'demo@example.com',
        ]);

        $categoryData = [
            ['name' => 'Design',    'color' => '#6366f1'],
            ['name' => 'Dev',       'color' => '#22c55e'],
            ['name' => 'Marketing', 'color' => '#f59e0b'],
            ['name' => 'Research',  'color' => '#0ea5e9'],
        ];

        $categories = collect($categoryData)->map(
            fn ($data) => Category::create(['user_id' => $user->id] + $data)
        );

        $projects = [
            [
                'name'        => 'Website Redesign',
                'description' => 'Full redesign of the company marketing site.',
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-08-31',
                'status'      => 'active',
                'goals' => [
                    [
                        'title'      => 'UX Research',
                        'start_date' => '2026-05-01',
                        'deadline'   => '2026-06-15',
                        'tasks' => [
                            ['title' => 'Conduct user interviews',    'category' => 'Research',  'deadline' => '2026-05-20', 'is_done' => true],
                            ['title' => 'Synthesise findings',        'category' => 'Research',  'deadline' => '2026-06-01', 'is_done' => true],
                            ['title' => 'Present insights to team',   'category' => 'Design',    'deadline' => '2026-06-10', 'is_done' => false],
                        ],
                    ],
                    [
                        'title'      => 'Design System',
                        'start_date' => '2026-06-01',
                        'deadline'   => '2026-07-15',
                        'tasks' => [
                            ['title' => 'Define colour palette',      'category' => 'Design',    'deadline' => '2026-06-10', 'is_done' => true],
                            ['title' => 'Build component library',    'category' => 'Design',    'deadline' => '2026-07-01', 'is_done' => false],
                            ['title' => 'Document component usage',   'category' => 'Dev',       'deadline' => '2026-07-10', 'is_done' => false],
                        ],
                    ],
                    [
                        'title'      => 'Frontend Build',
                        'start_date' => '2026-07-01',
                        'deadline'   => '2026-08-20',
                        'tasks' => [
                            ['title' => 'Implement homepage',         'category' => 'Dev',       'deadline' => '2026-07-20', 'is_done' => false],
                            ['title' => 'Implement about page',       'category' => 'Dev',       'deadline' => '2026-07-28', 'is_done' => false],
                            ['title' => 'QA and cross-browser test',  'category' => 'Dev',       'deadline' => '2026-08-15', 'is_done' => false],
                        ],
                    ],
                ],
            ],
            [
                'name'        => 'Q3 Marketing Campaign',
                'description' => 'Launch campaign for the new product line.',
                'start_date'  => '2026-06-01',
                'end_date'    => '2026-09-30',
                'status'      => 'active',
                'goals' => [
                    [
                        'title'      => 'Campaign Strategy',
                        'start_date' => '2026-06-01',
                        'deadline'   => '2026-06-30',
                        'tasks' => [
                            ['title' => 'Define target audience',     'category' => 'Marketing', 'deadline' => '2026-06-10', 'is_done' => true],
                            ['title' => 'Set KPIs and budget',        'category' => 'Marketing', 'deadline' => '2026-06-20', 'is_done' => false],
                        ],
                    ],
                    [
                        'title'      => 'Content Production',
                        'start_date' => '2026-07-01',
                        'deadline'   => '2026-08-31',
                        'tasks' => [
                            ['title' => 'Write blog posts',           'category' => 'Marketing', 'deadline' => '2026-07-20', 'is_done' => false],
                            ['title' => 'Design social assets',       'category' => 'Design',    'deadline' => '2026-08-01', 'is_done' => false],
                            ['title' => 'Produce video ads',          'category' => 'Marketing', 'deadline' => '2026-08-20', 'is_done' => false],
                        ],
                    ],
                ],
            ],
            [
                'name'        => 'API v2',
                'description' => 'Rebuild public API with improved performance.',
                'start_date'  => '2026-04-01',
                'end_date'    => '2026-07-31',
                'status'      => 'active',
                'goals' => [
                    [
                        'title'      => 'Architecture Planning',
                        'start_date' => '2026-04-01',
                        'deadline'   => '2026-04-30',
                        'tasks' => [
                            ['title' => 'Draft API spec',             'category' => 'Dev',       'deadline' => '2026-04-10', 'is_done' => true],
                            ['title' => 'Review with stakeholders',   'category' => 'Research',  'deadline' => '2026-04-20', 'is_done' => true],
                            ['title' => 'Finalise schema design',     'category' => 'Dev',       'deadline' => '2026-04-28', 'is_done' => true],
                        ],
                    ],
                    [
                        'title'      => 'Implementation',
                        'start_date' => '2026-05-01',
                        'deadline'   => '2026-07-15',
                        'tasks' => [
                            ['title' => 'Build auth endpoints',       'category' => 'Dev',       'deadline' => '2026-05-20', 'is_done' => true],
                            ['title' => 'Build core resource routes', 'category' => 'Dev',       'deadline' => '2026-06-15', 'is_done' => false],
                            ['title' => 'Write integration tests',    'category' => 'Dev',       'deadline' => '2026-07-10', 'is_done' => false],
                        ],
                    ],
                ],
            ],
        ];

        $categoryMap = $categories->keyBy('name');

        foreach ($projects as $projectData) {
            $goalsData = $projectData['goals'];
            unset($projectData['goals']);

            $project = Project::create(['user_id' => $user->id] + $projectData);

            foreach ($goalsData as $order => $goalData) {
                $tasksData = $goalData['tasks'];
                unset($goalData['tasks']);

                $goal = Goal::create(['project_id' => $project->id] + $goalData);

                foreach ($tasksData as $taskOrder => $taskData) {
                    $categoryName = $taskData['category'];
                    unset($taskData['category']);

                    $isDone = $taskData['is_done'];

                    Task::create([
                        'goal_id'      => $goal->id,
                        'category_id'  => $categoryMap[$categoryName]->id ?? null,
                        'completed_at' => $isDone ? now() : null,
                        'order'        => $taskOrder,
                    ] + $taskData);
                }
            }
        }
    }
}
