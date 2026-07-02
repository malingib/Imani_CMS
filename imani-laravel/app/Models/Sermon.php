<?php

namespace App\Models;

use App\Traits\BelongsToChurch;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sermon extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'title',
        'speaker',
        'date',
        'time',
        'scripture',
        'event',
        'event_id',
        'transcript',
    ];

    public function churchEvent(): BelongsTo
    {
        return $this->belongsTo(ChurchEvent::class, 'event_id');
    }
}
