<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    Route::get('dashboard', DashboardController::class);

    Route::apiResource('projects', ProjectController::class);

    // Goals: nested for index+store, shallow for show+update+destroy
    Route::apiResource('projects.goals', GoalController::class)
        ->shallow()
        ->except(['index']);
    Route::get('projects/{project}/goals', [GoalController::class, 'index']);

    // Tasks: nested for index+store, standalone for update+destroy
    Route::get('goals/{goal}/tasks',    [TaskController::class, 'index']);
    Route::post('goals/{goal}/tasks',   [TaskController::class, 'store']);
    Route::put('tasks/{task}',          [TaskController::class, 'update']);
    Route::delete('tasks/{task}',       [TaskController::class, 'destroy']);

    // Categories
    Route::get('categories',  [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store']);
});
