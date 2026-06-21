<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Goal>
 */
class GoalFactory extends Factory
{
    public function definition(): array
    {
        $start    = $this->faker->dateTimeBetween('-2 months', 'now');
        $deadline = $this->faker->dateTimeBetween($start, '+4 months');

        return [
            'project_id'  => Project::factory(),
            'title'       => ucfirst($this->faker->bs()),
            'description' => $this->faker->sentence(),
            'start_date'  => $start->format('Y-m-d'),
            'deadline'    => $deadline->format('Y-m-d'),
        ];
    }
}
