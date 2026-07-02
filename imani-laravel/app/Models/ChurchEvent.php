<?php

namespace App\Models;

use App\Enums\ChurchEventType;
use App\Enums\RecurrenceType;
use App\Traits\BelongsToChurch;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChurchEvent extends BaseModel
{
    use BelongsToChurch;

    protected $table = 'church_events';

    protected $fillable = [
        'church_id',
        'title',
        'description',
        'date',
        'time',
        'location',
        'type',
        'coordinator',
        'contact_person',
        'rsvp_deadline',
        'recurrence',
        'coordinates',
    ];

    protected function casts(): array
    {
        return [
            'type' => ChurchEventType::class,
            'recurrence' => RecurrenceType::class,
            'coordinates' => 'array',
        ];
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'event_attendance', 'event_id', 'member_id')
            ->withPivot('church_id');
    }

    public function sermons(): HasMany
    {
        return $this->hasMany(Sermon::class, 'event_id');
    }
}
