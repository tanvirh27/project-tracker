<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Goal;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function index(Goal $goal): AnonymousResourceCollection
    {
        $this->authorize('view', $goal);

        $tasks = $goal->tasks()->with('category')->orderBy('deadline')->orderBy('order')->get();

        return TaskResource::collection($tasks);
    }

    public function store(StoreTaskRequest $request, Goal $goal): TaskResource
    {
        $this->authorize('update', $goal);

        $task = $goal->tasks()->create($request->validated());
        $task->load('category');

        return new TaskResource($task);
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $this->authorize('update', $task);

        $data = $request->validated();

        if (array_key_exists('is_done', $data)) {
            $data['completed_at'] = $data['is_done'] ? now() : null;
        }

        $task->update($data);
        $task->load('category');

        return new TaskResource($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);
        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }
}
