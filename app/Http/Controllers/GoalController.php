<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Resources\GoalResource;
use App\Models\Goal;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GoalController extends Controller
{
    public function index(Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $goals = $project->goals()->with('tasks')->orderBy('deadline')->get();

        return GoalResource::collection($goals);
    }

    public function store(StoreGoalRequest $request, Project $project): GoalResource
    {
        $this->authorize('update', $project);

        $goal = $project->goals()->create($request->validated());
        $goal->load('tasks');

        return new GoalResource($goal);
    }

    public function show(Goal $goal): GoalResource
    {
        $this->authorize('view', $goal);

        $goal->load('tasks');

        return new GoalResource($goal);
    }

    public function update(UpdateGoalRequest $request, Goal $goal): GoalResource
    {
        $this->authorize('update', $goal);

        $goal->update($request->validated());
        $goal->load('tasks');

        return new GoalResource($goal);
    }

    public function destroy(Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);
        $goal->delete();

        return response()->json(['message' => 'Goal deleted.']);
    }
}
