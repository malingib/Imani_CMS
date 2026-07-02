<?php

namespace App\Models;

use App\Enums\Frequency;
use App\Traits\BelongsToChurch;

class RecurringExpense extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'category',
        'amount',
        'frequency',
        'next_date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'frequency' => Frequency::class,
        ];
    }
}
