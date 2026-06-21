<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'start_date'  => $this->start_date?->toDateString(),
            'end_date'    => $this->end_date?->toDateString(),
            'status'      => $this->status,
            'progress'    => $this->progress,     // model accessor
            'goals'       => GoalResource::collection($this->whenLoaded('goals')),
            'created_at'  => $this->created_at->toDateTimeString(),
        ];
    }
}
