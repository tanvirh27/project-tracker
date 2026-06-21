<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'project_id'  => $this->project_id,
            'title'       => $this->title,
            'description' => $this->description,
            'start_date'  => $this->start_date?->toDateString(),
            'deadline'    => $this->deadline?->toDateString(),
            'status'      => $this->status,       // model accessor
            'progress'    => $this->progress,     // model accessor
            'tasks'       => TaskResource::collection($this->whenLoaded('tasks')),
            'created_at'  => $this->created_at->toDateTimeString(),
        ];
    }
}
