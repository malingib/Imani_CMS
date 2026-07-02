<?php

namespace App\Models;

use App\Enums\MpesaPurpose;
use App\Enums\MpesaStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpesaTransaction extends BaseModel
{
    protected $fillable = [
        'church_id',
        'user_id',
        'member_id',
        'invoice_id',
        'subscription_id',
        'finance_transaction_id',
        'purpose',
        'phone',
        'amount',
        'gift_type',
        'checkout_request_id',
        'merchant_request_id',
        'mpesa_receipt_number',
        'status',
        'result_code',
        'result_desc',
        'raw_callback',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'purpose' => MpesaPurpose::class,
            'status' => MpesaStatus::class,
            'raw_callback' => 'array',
            'metadata' => 'array',
        ];
    }

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function financeTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'finance_transaction_id');
    }
}
