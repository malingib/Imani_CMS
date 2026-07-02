<?php

namespace App\Models;

use App\Enums\ActivityType;
use App\Traits\BelongsToChurch;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends BaseModel
{
    use BelongsToChurch;

    public $timestamps = false;

    protected $fillable = [
        'church_id',
        'member_id',
        'type',
        'description',
        'timestamp',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => ActivityType::class,
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
