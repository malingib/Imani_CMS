<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\TransactionCategory;
use App\Enums\TransactionSource;
use App\Enums\TransactionType;
use App\Traits\BelongsToChurch;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends BaseModel
{
    use BelongsToChurch;

    protected $fillable = [
        'church_id',
        'member_id',
        'member_name',
        'amount',
        'type',
        'payment_method',
        'date',
        'reference',
        'category',
        'notes',
        'phone_number',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'type' => TransactionType::class,
            'payment_method' => PaymentMethod::class,
            'category' => TransactionCategory::class,
            'source' => TransactionSource::class,
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
