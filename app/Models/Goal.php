<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Goal extends Model
{
    /** @use HasFactory<\Database\Factories\GoalFactory> */
    use HasFactory;

    protected $fillable = ['project_id', 'title', 'description', 'start_date', 'deadline'];

    protected $appends = ['progress', 'status'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'deadline'   => 'date',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function getProgressAttribute(): float
    {
        if (! $this->relationLoaded('tasks')) {
            return 0.0;
        }

        $total = $this->tasks->count();
        if ($total === 0) {
            return 0.0;
        }

        return round($this->tasks->where('is_done', true)->count() / $total * 100, 1);
    }

    public function getStatusAttribute(): string
    {
        $progress = $this->progress;

        if ($progress == 100) {
            return 'completed';
        }

        if ($this->deadline && $this->deadline->lt(now()->startOfDay())) {
            return 'overdue';
        }

        if ($progress == 0) {
            return 'not_started';
        }

        return 'in_progress';
    }
}
