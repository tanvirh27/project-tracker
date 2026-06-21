<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'description', 'start_date', 'end_date', 'status'];

    protected $appends = ['progress'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function getProgressAttribute(): float
    {
        if (! $this->relationLoaded('goals')) {
            return 0.0;
        }

        $total = 0;
        $done  = 0;

        foreach ($this->goals as $goal) {
            if ($goal->relationLoaded('tasks')) {
                foreach ($goal->tasks as $task) {
                    $total++;
                    if ($task->is_done) {
                        $done++;
                    }
                }
            }
        }

        return $total === 0 ? 0.0 : round($done / $total * 100, 1);
    }
}
