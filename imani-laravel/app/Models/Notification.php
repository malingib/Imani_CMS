<?php

namespace App\Models;

use App\Enums\NotificationType;
use App\Traits\BelongsToChurch;

class Notification extends BaseModel
{
    use BelongsToChurch;

    public $timestamps = false;

    protected $fillable = [
        'church_id',
        'title',
        'message',
        'time',
        'type',
        'read',
    ];

    protected function casts(): array
    {
        return [
            'type' => NotificationType::class,
            'read' => 'boolean',
            'created_at' => 'datetime',
        ];
    }
}
