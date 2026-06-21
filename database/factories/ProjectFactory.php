<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-3 months', 'now');
        $end   = $this->faker->dateTimeBetween($start, '+6 months');

        return [
            'user_id'     => User::factory(),
            'name'        => $this->faker->bs(),
            'description' => $this->faker->sentence(),
            'start_date'  => $start->format('Y-m-d'),
            'end_date'    => $end->format('Y-m-d'),
            'status'      => $this->faker->randomElement(['active', 'active', 'active', 'completed', 'archived']),
        ];
    }
}
