<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    public function definition(): array
    {
        $isDone = $this->faker->boolean(30);

        return [
            'goal_id'      => Goal::factory(),
            'category_id'  => null,
            'title'        => ucfirst($this->faker->bs()),
            'description'  => $this->faker->optional()->sentence(),
            'deadline'     => $this->faker->dateTimeBetween('now', '+3 months')->format('Y-m-d'),
            'is_done'      => $isDone,
            'completed_at' => $isDone ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'order'        => $this->faker->numberBetween(0, 20),
        ];
    }
}
