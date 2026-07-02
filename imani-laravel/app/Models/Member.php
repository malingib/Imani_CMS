<?php

namespace App\Models;

use App\Enums\MaritalStatus;
use App\Enums\MemberStatus;
use App\Enums\MembershipType;
use App\Traits\BelongsToChurch;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'user_id',
        'first_name',
        'last_name',
        'phone',
        'email',
        'location',
        'groups',
        'status',
        'join_date',
        'birthday',
        'age',
        'gender',
        'marital_status',
        'membership_type',
        'photo',
        'stewardship_score',
    ];

    protected function casts(): array
    {
        return [
            'groups' => 'array',
            'status' => MemberStatus::class,
            'marital_status' => MaritalStatus::class,
            'membership_type' => MembershipType::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_members')
            ->withPivot('church_id');
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(ChurchEvent::class, 'event_attendance', 'member_id', 'event_id')
            ->withPivot('church_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
