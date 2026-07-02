<?php

namespace App\Models;

use App\Traits\BelongsToChurch;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Group extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'name',
        'description',
        'member_count',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'group_members')
            ->withPivot('church_id');
    }
}
