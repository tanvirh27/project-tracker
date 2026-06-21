<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'deadline'    => ['sometimes', 'date'],
            'category_id' => ['sometimes', 'nullable', 'exists:categories,id'],
            'is_done'     => ['sometimes', 'boolean'],
            'order'       => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
