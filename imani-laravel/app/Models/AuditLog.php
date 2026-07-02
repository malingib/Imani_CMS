<?php

namespace App\Models;

use App\Enums\Severity;
use App\Traits\BelongsToChurch;

class AuditLog extends BaseModel
{
    use BelongsToChurch;

    public $timestamps = false;

    protected $fillable = [
        'church_id',
        'user_id',
        'user_name',
        'action',
        'module',
        'timestamp',
        'severity',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'severity' => Severity::class,
            'metadata' => 'array',
        ];
    }
}
