<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'goal_id'      => $this->goal_id,
            'category_id'  => $this->category_id,
            'title'        => $this->title,
            'description'  => $this->description,
            'deadline'     => $this->deadline?->toDateString(),
            'is_done'      => $this->is_done,
            'completed_at' => $this->completed_at?->toDateTimeString(),
            'order'        => $this->order,
            'category'     => $this->whenLoaded('category'),
            'created_at'   => $this->created_at->toDateTimeString(),
        ];
    }
}
