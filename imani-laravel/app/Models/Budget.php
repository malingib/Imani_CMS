<?php

namespace App\Models;

use App\Traits\BelongsToChurch;

class Budget extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'category',
        'amount',
        'spent',
        'month',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'spent' => 'decimal:2',
        ];
    }
}
