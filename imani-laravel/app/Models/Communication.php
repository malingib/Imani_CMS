<?php

namespace App\Models;

use App\Enums\CommunicationStatus;
use App\Enums\CommunicationType;
use App\Traits\BelongsToChurch;

class Communication extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'type',
        'recipient_count',
        'target_group_name',
        'subject',
        'content',
        'date',
        'status',
        'sender',
        'scheduled_for',
        'delivery_breakdown',
    ];

    protected function casts(): array
    {
        return [
            'type' => CommunicationType::class,
            'status' => CommunicationStatus::class,
            'delivery_breakdown' => 'array',
        ];
    }
}
